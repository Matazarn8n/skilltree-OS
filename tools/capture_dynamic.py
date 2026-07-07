#!/usr/bin/env python3
"""Capture remaining DYNAMIC views of skilltree-hub (single authenticated session).
Screenshots (retina, full_page) + real-text scrape for: hub + skill modals, brain
(AI-draft / manual-type flows), tree (+connect command / audit), community,
settings, onboarding API + screens, chart.html / app-map.html.

Reuses the proven login + settle() pattern from tools/crawl.py. Never prints the
password (loaded straight from .env.md, only used to fill the form).
"""
import sys, time, json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "captures" / "dynamic"
OUT.mkdir(parents=True, exist_ok=True)
HEADED = "--headed" in sys.argv


def load_env(p):
    d = {}
    for l in p.read_text().splitlines():
        l = l.strip()
        if "=" in l and not l.startswith("#"):
            k, v = l.split("=", 1)
            d[k.strip()] = v.strip()
    return d


env = load_env(ROOT / ".env.md")
BASE = env["URL"].rstrip("/")
LOGIN = env.get("URL_login", BASE + "/login")
USER = env["login"]
PWD = env["password"]  # never print this

from playwright.sync_api import sync_playwright


def settle(pg, timeout=25):
    """Wait until the SPA actually rendered content (not errwrap / blank shell)."""
    end = time.time() + timeout
    last = -1
    c = None
    while time.time() < end:
        try:
            c = pg.evaluate("""() => ({
                btn: document.querySelectorAll('button').length,
                a: document.querySelectorAll('a[href]').length,
                txt: (document.body.innerText||'').length,
                err: !!document.querySelector('.errwrap') || /something went wrong|error/i.test(document.body.innerText||''),
                url: location.pathname
            })""")
        except Exception:
            time.sleep(0.6)
            continue
        if c["err"] and c["txt"] < 200:
            try:
                pg.reload(wait_until="domcontentloaded")
            except Exception:
                pass
            time.sleep(1.5)
            continue
        if c["txt"] > 400 and (c["btn"] > 0 or c["a"] > 1):
            if c["txt"] == last:
                return c
            last = c["txt"]
        time.sleep(0.8)
    return c


def scrape(pg):
    return pg.evaluate("""() => {
        const headings = [...document.querySelectorAll('h1,h2,h3')].map(h=>h.tagName+': '+h.textContent.trim()).slice(0,80);
        const buttons = [...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(Boolean).slice(0,80);
        return {title: document.title, url: location.href, headings, buttons,
                text: (document.body.innerText||'').slice(0, 12000)};
    }""")


def save(name, pg):
    """Screenshot full_page + scrape -> captures/dynamic/<name>.png/.json"""
    png = OUT / f"{name}.png"
    try:
        pg.screenshot(path=str(png), full_page=True)
    except Exception as e:
        print(f"[!] screenshot {name}: {type(e).__name__}: {e}")
    data = scrape(pg)
    (OUT / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2))
    size = png.stat().st_size if png.exists() else 0
    print(f"[+] {name:28} png={size/1024:.1f}KB  text={len(data['text'])}chars  h={data['headings'][:2]}")
    return data


def close_modal(pg):
    for sel in ["button:has-text('×')", "[aria-label=Close]", "[aria-label=close]"]:
        try:
            el = pg.query_selector(sel)
            if el:
                el.click()
                time.sleep(0.6)
                return
        except Exception:
            pass
    try:
        pg.keyboard.press("Escape")
        time.sleep(0.6)
    except Exception:
        pass


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


with sync_playwright() as p:
    b = p.chromium.launch(headless=not HEADED)
    ctx = b.new_context(viewport={"width": 1600, "height": 1000}, device_scale_factor=2)
    pg = ctx.new_page()

    # ---------- login ----------
    print("[*] login")
    pg.goto(LOGIN, wait_until="networkidle", timeout=45000)
    pg.fill("input[type=email]", USER)
    pg.fill("input[type=password]", PWD)
    btn = pg.query_selector("button[type=submit]")
    (btn.click() if btn else pg.keyboard.press("Enter"))
    try:
        pg.wait_for_function("()=>!location.pathname.includes('login')", timeout=30000)
    except Exception:
        pg.keyboard.press("Enter")
    pg.wait_for_load_state("networkidle", timeout=45000)
    time.sleep(3)
    print("[*] landed:", pg.url)

    # ================= 1. /hub =================
    pg.goto(BASE + "/hub", wait_until="domcontentloaded", timeout=40000)
    settle(pg)
    time.sleep(1.5)
    save("hub", pg)

    # targeted section screenshots (best-effort)
    for label, heading_text in [
        ("hub_section_fresh_drops", "Fresh drops"),
        ("hub_section_most_installed", "Most installed"),
        ("hub_section_community_pulse", "Community pulse"),
        ("hub_section_build_logs", "Build logs"),
    ]:
        try:
            h = pg.get_by_text(heading_text, exact=False).first
            box = h.bounding_box()
            if box:
                # screenshot a viewport-height slice under the heading
                clip = {"x": 0, "y": max(0, box["y"] - 20), "width": 1600, "height": 500}
                pg.screenshot(path=str(OUT / f"{label}.png"), clip=clip)
                print(f"[+] {label} (element clip)")
        except Exception as e:
            print(f"[!] section {label}: {type(e).__name__}")

    # skill cards -> modal
    for skill_name in ["Carousel Designer", "Cold Email Copywriter", "Knowledge Base"]:
        try:
            card = pg.get_by_text(skill_name, exact=True).first
            card.click(timeout=8000)
            time.sleep(1.2)
            settle(pg, timeout=10)
            save(f"hub_modal_{slugify(skill_name)}", pg)
            close_modal(pg)
            time.sleep(0.8)
        except Exception as e:
            print(f"[!] hub modal {skill_name}: {type(e).__name__}: {e}")
            close_modal(pg)

    # ================= 2. /brain =================
    pg.goto(BASE + "/brain", wait_until="domcontentloaded", timeout=40000)
    settle(pg)
    time.sleep(1.5)
    save("brain_initial", pg)

    # AI-draft flow
    try:
        ai_btn = pg.get_by_text("Draft my brain with AI", exact=False).first
        ai_btn.click(timeout=8000)
        time.sleep(2)
        settle(pg, timeout=15)
        save("brain_ai", pg)
    except Exception as e:
        print(f"[!] brain AI flow: {type(e).__name__}: {e}")

    # reset and try manual flow
    pg.goto(BASE + "/brain", wait_until="domcontentloaded", timeout=40000)
    settle(pg)
    time.sleep(1.5)
    try:
        manual_btn = pg.get_by_text("I'll type it myself", exact=False).first
        manual_btn.click(timeout=8000)
        time.sleep(2)
        settle(pg, timeout=15)
        save("brain_manual", pg)
    except Exception as e:
        print(f"[!] brain manual flow: {type(e).__name__}: {e}")

    # ================= 3. /tree =================
    pg.goto(BASE + "/tree", wait_until="domcontentloaded", timeout=40000)
    settle(pg)
    time.sleep(1.5)
    save("tree_initial", pg)

    try:
        connect_btn = pg.get_by_text("Generate my connect command", exact=False).first
        connect_btn.click(timeout=8000)
        time.sleep(1.5)
        settle(pg, timeout=10)
        save("tree_connect_command", pg)
    except Exception as e:
        print(f"[!] tree connect command: {type(e).__name__}: {e}")

    for label, text in [
        ("tree_browse_drops", "Browse this week's drops"),
        ("tree_audit", "SkillTree Audit"),
    ]:
        try:
            el = pg.get_by_text(text, exact=False).first
            if el.count() if hasattr(el, "count") else True:
                el.click(timeout=6000)
                time.sleep(1.5)
                settle(pg, timeout=10)
                save(label, pg)
                pg.go_back(wait_until="domcontentloaded", timeout=20000)
                settle(pg, timeout=10)
        except Exception as e:
            print(f"[!] tree {label}: {type(e).__name__}: {e}")

    # ================= 4. /community =================
    pg.goto(BASE + "/community", wait_until="domcontentloaded", timeout=40000)
    settle(pg)
    time.sleep(1.5)
    save("community", pg)

    # ================= 5. /settings =================
    pg.goto(BASE + "/settings", wait_until="domcontentloaded", timeout=40000)
    settle(pg)
    time.sleep(1.5)
    save("settings", pg)

    # ================= 6. onboarding =================
    try:
        resp = pg.request.get(BASE + "/api/onboarding")
        body = None
        try:
            body = resp.json()
        except Exception:
            body = {"_raw_text": resp.text()[:5000]}
        (OUT / "api_onboarding.json").write_text(
            json.dumps({"status": resp.status, "ok": resp.ok, "body": body}, ensure_ascii=False, indent=2)
        )
        print(f"[+] api_onboarding.json  status={resp.status}")
    except Exception as e:
        print(f"[!] /api/onboarding: {type(e).__name__}: {e}")

    for route in ["/preview", "/onboarding"]:
        try:
            pg.goto(BASE + route, wait_until="domcontentloaded", timeout=30000)
            settle(pg, timeout=15)
            time.sleep(1.2)
            save(route.strip("/"), pg)
        except Exception as e:
            print(f"[!] {route}: {type(e).__name__}: {e}")

    # ================= 7. chart.html / app-map.html =================
    for route, txtname in [("/chart.html", "chart_html.txt"), ("/app-map.html", "app_map_html.txt")]:
        try:
            resp = pg.request.get(BASE + route)
            (OUT / txtname).write_text(resp.text())
            print(f"[+] {txtname}  status={resp.status}  len={len(resp.text())}")
        except Exception as e:
            print(f"[!] {route} fetch: {type(e).__name__}: {e}")

    try:
        pg.goto(BASE + "/chart.html", wait_until="domcontentloaded", timeout=30000)
        time.sleep(2)
        pg.screenshot(path=str(OUT / "chart_html.png"), full_page=True)
        print("[+] chart_html.png")
    except Exception as e:
        print(f"[!] chart.html screenshot: {type(e).__name__}: {e}")

    b.close()

print("[*] done ->", OUT)
