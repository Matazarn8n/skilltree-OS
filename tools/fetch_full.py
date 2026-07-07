#!/usr/bin/env python3
"""Residual capture (Phase 1) — deterministic, single authenticated session.
  1. Full gated skill .md via GET /api/skill?slug=<slug>  -> captures/skill_files_full/<slug>.md
  2. Dashboards data hunt: load /map, open DASHBOARDS tab, record XHR/JSON -> captures/raw/dash_*.json
Reuses the proven login (settle + leave-/login redirect) from crawl.py.
Anti-faux-positif: verifies each .md is longer than its preview; honest per-slug report.
Usage: fetch_full.py [--headed]
Interpreter: ~/.higgsfield-login-venv/bin/python
"""
import sys, time, json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
FULL = ROOT / "captures" / "skill_files_full"; FULL.mkdir(parents=True, exist_ok=True)
RAW  = ROOT / "captures" / "raw"; RAW.mkdir(parents=True, exist_ok=True)
DASH = ROOT / "captures" / "dashboards"; DASH.mkdir(parents=True, exist_ok=True)
HEADED = "--headed" in sys.argv

def load_env(p):
    d = {}
    for l in p.read_text().splitlines():
        l = l.strip()
        if "=" in l and not l.startswith("#"):
            k, v = l.split("=", 1); d[k.strip()] = v.strip()
    return d
env  = load_env(ROOT / ".env.md")
BASE = env["URL"].rstrip("/"); LOGIN = env.get("URL_login", BASE + "/login")

# slugs + preview lengths (baseline for the "full > preview" check)
sf = json.load(open(ROOT / "data" / "skill_files.json"))
prev_len = {slug: len(v.get("markdown", "")) for slug, v in sf.items()}
slugs = sorted(prev_len)
print(f"[*] {len(slugs)} slugs to fetch")

from playwright.sync_api import sync_playwright

def settle(pg, timeout=25):
    end = time.time() + timeout; last = -1; c = {}
    while time.time() < end:
        try:
            c = pg.evaluate("""() => ({btn:document.querySelectorAll('button').length,
                a:document.querySelectorAll('a[href]').length,
                txt:(document.body.innerText||'').length,
                err:!!document.querySelector('.errwrap')||/something went wrong/i.test(document.body.innerText||''),
                url:location.pathname})""")
        except Exception:
            time.sleep(0.6); continue
        if c["err"] and c["txt"] < 200:
            try: pg.reload(wait_until="domcontentloaded")
            except Exception: pass
            time.sleep(1.5); continue
        if c["txt"] > 400 and (c["btn"] > 0 or c["a"] > 1):
            if c["txt"] == last: return c
            last = c["txt"]
        time.sleep(0.8)
    return c

report = {"full_files": {}, "dashboards": {}}
with sync_playwright() as p:
    b = p.chromium.launch(headless=not HEADED)
    ctx = b.new_context(viewport={"width": 1600, "height": 1000}, device_scale_factor=2)
    pg = ctx.new_page()

    # capture all JSON responses (for the dashboard hunt)
    dash_hits = []
    def on_resp(r):
        try:
            u = r.url; ct = (r.headers or {}).get("content-type", "")
            if "/api/skill" in u: return
            if "json" in ct or u.endswith(".json") or "/api/" in u:
                body = r.text()
                if re.search(r"31,?587|Cost per Lead|Paid Acquisition|Command Center|HubSpot|Mission Control|dashboard", body, re.I):
                    dash_hits.append({"url": u, "len": len(body)})
                    slug = re.sub(r"[^a-z0-9]+", "_", u.split("//")[-1].lower())[:80]
                    (RAW / f"dash_{slug}.json").write_text(body)
        except Exception:
            pass
    pg.on("response", on_resp)

    print("[*] login")
    pg.goto(LOGIN, wait_until="networkidle", timeout=45000)
    pg.fill("input[type=email]", env["login"]); pg.fill("input[type=password]", env["password"])
    btn = pg.query_selector("button[type=submit]")
    (btn.click() if btn else pg.keyboard.press("Enter"))
    try:
        pg.wait_for_function("() => !location.pathname.includes('login')", timeout=30000)
    except Exception:
        pg.keyboard.press("Enter"); time.sleep(3)
    pg.wait_for_load_state("networkidle", timeout=45000); time.sleep(2)
    print("[*] landed:", pg.url)
    if "login" in pg.url:
        print("[!!] AUTH FAILED — still on /login. Aborting (no silent fallback)."); b.close(); sys.exit(2)

    # --- 1. full skill files via authenticated same-origin request ---
    ok = short = fail = 0
    for i, slug in enumerate(slugs, 1):
        try:
            resp = pg.request.get(f"{BASE}/api/skill?slug={slug}", timeout=20000)
            if not resp.ok:
                report["full_files"][slug] = f"HTTP {resp.status}"; fail += 1; continue
            data = resp.json()
            content = data.get("content") or ""
            if len(content) <= max(prev_len.get(slug, 0), 300):
                report["full_files"][slug] = f"SHORT {len(content)}<=preview {prev_len.get(slug,0)}"; short += 1
            else:
                (FULL / f"{slug}.md").write_text(content)
                report["full_files"][slug] = len(content); ok += 1
        except Exception as e:
            report["full_files"][slug] = f"ERR {type(e).__name__}"; fail += 1
        if i % 20 == 0: print(f"    ...{i}/{len(slugs)} (ok={ok} short={short} fail={fail})")
    print(f"[*] full files: ok={ok} short={short} fail={fail}")

    # --- 2. dashboards hunt: open /map, click DASHBOARDS, screenshot ---
    try:
        pg.goto(BASE + "/map", wait_until="domcontentloaded", timeout=40000); settle(pg); time.sleep(2)
        clicked = pg.evaluate("""() => {
            const el=[...document.querySelectorAll('button,a,[role=tab],div')]
              .find(e=>/^\\s*dashboards\\s*$/i.test(e.textContent||''));
            if(el){el.click(); return true;} return false; }""")
        time.sleep(4); settle(pg)
        pg.screenshot(path=str(DASH / "dashboards_tab.png"), full_page=True)
        # step the carousel a few times to trigger data loads
        for k in range(8):
            pg.evaluate("""() => { const a=[...document.querySelectorAll('button,[aria-label]')]
              .find(e=>/›|next|forward|arrow-right/i.test((e.getAttribute('aria-label')||'')+e.textContent)); if(a)a.click(); }""")
            time.sleep(1.2)
            pg.screenshot(path=str(DASH / f"dashboard_{k}.png"))
        report["dashboards"] = {"tab_clicked": clicked, "json_hits": dash_hits,
                                "png": len(list(DASH.glob("*.png")))}
        print(f"[*] dashboards: tab={clicked} json_hits={len(dash_hits)} png={report['dashboards']['png']}")
    except Exception as e:
        report["dashboards"] = {"error": f"{type(e).__name__}: {e}"}
        print("[!] dashboards hunt failed:", e)

    b.close()

(ROOT / "captures" / "fetch_full_report.json").write_text(json.dumps(report, indent=2))
print("[*] report -> captures/fetch_full_report.json")
