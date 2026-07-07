#!/usr/bin/env python3
"""Robust authenticated crawler for skilltree-hub -> personal FR reconstruction.
Handles the post-login redirect chain + headless flakiness (errwrap) with retries.
Captures screenshots + scrapes real text for every reachable view.
Usage: crawl.py [--headed] [--stage login|nav|all]
"""
import sys, time, json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "captures"; OUT.mkdir(exist_ok=True)
DATA = OUT / "content"; DATA.mkdir(exist_ok=True)
HEADED = "--headed" in sys.argv

def load_env(p):
    d = {}
    for l in p.read_text().splitlines():
        l = l.strip()
        if "=" in l and not l.startswith("#"):
            k, v = l.split("=", 1); d[k.strip()] = v.strip()
    return d
env = load_env(ROOT / ".env.md")
BASE = env["URL"].rstrip("/"); LOGIN = env.get("URL_login", BASE + "/login")

from playwright.sync_api import sync_playwright

def settle(pg, timeout=25):
    """Wait until the SPA actually rendered content (not errwrap / blank shell)."""
    end = time.time() + timeout
    last = -1
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
            time.sleep(0.6); continue
        if c["err"] and c["txt"] < 200:
            try: pg.reload(wait_until="domcontentloaded")
            except Exception: pass
            time.sleep(1.5); continue
        if c["txt"] > 400 and (c["btn"] > 0 or c["a"] > 1):
            if c["txt"] == last:  # stable two ticks
                return c
            last = c["txt"]
        time.sleep(0.8)
    return c

def scrape(pg):
    return pg.evaluate("""() => {
        const nav = [...document.querySelectorAll('nav a, aside a, [class*=sidebar] a, header a')]
          .map(a => ({href:a.getAttribute('href'), text:a.textContent.trim()})).filter(x=>x.text);
        const buttons = [...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(Boolean).slice(0,60);
        const headings = [...document.querySelectorAll('h1,h2,h3')].map(h=>h.tagName+': '+h.textContent.trim()).slice(0,60);
        return {title: document.title, url: location.href, nav, buttons, headings,
                text: (document.body.innerText||'').slice(0, 8000)};
    }""")

with sync_playwright() as p:
    b = p.chromium.launch(headless=not HEADED)
    ctx = b.new_context(viewport={"width":1600,"height":1000}, device_scale_factor=2)
    pg = ctx.new_page()

    print("[*] login"); pg.goto(LOGIN, wait_until="networkidle", timeout=45000)
    pg.fill("input[type=email]", env["login"]); pg.fill("input[type=password]", env["password"])
    btn = pg.query_selector("button[type=submit]")
    (btn.click() if btn else pg.keyboard.press("Enter"))
    # wait for the redirect chain to leave /login
    try:
        pg.wait_for_function("() => !location.pathname.includes('login')", timeout=30000)
    except Exception:
        print("[!] still on /login after submit — retrying Enter"); pg.keyboard.press("Enter"); time.sleep(3)
    pg.wait_for_load_state("networkidle", timeout=45000); time.sleep(3)
    print("[*] landed:", pg.url)

    # ensure we are on the app home (map), with content
    pg.goto(BASE + "/", wait_until="domcontentloaded", timeout=40000)
    c = settle(pg); print("[*] home settled:", json.dumps(c, ensure_ascii=False)[:200])
    pg.screenshot(path=str(OUT/"home.png"), full_page=True)
    home = scrape(pg); (DATA/"home.json").write_text(json.dumps(home, ensure_ascii=False, indent=2))
    print("[*] nav found:", [n["text"] for n in home["nav"]][:15])

    # visit each in-app nav destination
    seen=set(); manifest=[]
    for n in home["nav"]:
        href=n["href"]
        if not href or not href.startswith("/") or href in seen: continue
        seen.add(href)
        try:
            pg.goto(BASE+href, wait_until="domcontentloaded", timeout=40000)
            c=settle(pg); time.sleep(1.5)
            name=re.sub(r"[^a-z0-9]+","_",href.strip("/").lower()) or "root"
            pg.screenshot(path=str(OUT/f"nav_{name}.png"), full_page=True)
            data=scrape(pg); (DATA/f"nav_{name}.json").write_text(json.dumps(data,ensure_ascii=False,indent=2))
            manifest.append({"nav":n["text"],"href":href,"final":pg.url,"headings":data["headings"][:8]})
            print(f"[+] {n['text']:14} {href:14} -> {pg.url}  ({len(data['text'])} chars)")
        except Exception as e:
            print(f"[!] {href}: {type(e).__name__}"); manifest.append({"href":href,"error":type(e).__name__})
    (OUT/"crawl_manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    b.close()
print("[*] done ->", OUT)
