#!/usr/bin/env python3
"""Grab the DASHBOARDS surface (separate page dash/index.html) + rendered screenshots.
Anti-faux-positif: dumps raw HTML, records demo-number JSON, screenshots each carousel card.
Usage: fetch_dash.py [--headed]"""
import sys, time, json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW  = ROOT / "captures" / "raw"
DASH = ROOT / "captures" / "dashboards"; DASH.mkdir(parents=True, exist_ok=True)
HEADED = "--headed" in sys.argv
env = {}
for l in (ROOT/".env.md").read_text().splitlines():
    l=l.strip()
    if "=" in l and not l.startswith("#"): k,v=l.split("=",1); env[k.strip()]=v.strip()
BASE=env["URL"].rstrip("/"); LOGIN=env.get("URL_login",BASE+"/login")
from playwright.sync_api import sync_playwright

CANDIDATES = ["/app/dash/index.html", "/app/dash/", "/dash/index.html", "/dash/"]
with sync_playwright() as p:
    b=p.chromium.launch(headless=not HEADED)
    ctx=b.new_context(viewport={"width":1600,"height":1000}, device_scale_factor=2)
    pg=ctx.new_page()
    hits=[]
    pg.on("response", lambda r: _grab(r, hits))
    def _grab(r,hits):
        try:
            u=r.url
            if "/api/skill" in u: return
            ct=(r.headers or {}).get("content-type","")
            if "json" in ct or "/api/" in u or u.endswith(".json"):
                body=r.text()
                if re.search(r"31,?587|Cost per Lead|Paid Acquisition|Command Center|HubSpot|Mission Control|CPL|spend", body, re.I):
                    hits.append(u); (RAW/f"dash_{re.sub(r'[^a-z0-9]+','_',u.split('//')[-1].lower())[:70]}.json").write_text(body)
        except Exception: pass
    pg.goto(LOGIN, wait_until="networkidle", timeout=45000)
    pg.fill("input[type=email]", env["login"]); pg.fill("input[type=password]", env["password"])
    (pg.query_selector("button[type=submit]") or pg.keyboard).press("Enter") if False else None
    btn=pg.query_selector("button[type=submit]"); (btn.click() if btn else pg.keyboard.press("Enter"))
    try: pg.wait_for_function("()=>!location.pathname.includes('login')", timeout=30000)
    except Exception: pg.keyboard.press("Enter"); time.sleep(3)
    pg.wait_for_load_state("networkidle", timeout=40000); time.sleep(2)
    if "login" in pg.url: print("[!!] AUTH FAILED"); b.close(); sys.exit(2)
    print("[*] landed:", pg.url)

    found=None
    for path in CANDIDATES:
        try:
            resp=pg.request.get(BASE+path, timeout=20000)
            print(f"    {path} -> HTTP {resp.status} ({len(resp.text()) if resp.ok else 0}b)")
            if resp.ok and len(resp.text())>2000:
                (RAW/"skilltree_dash_index_html.txt").write_text(resp.text()); found=path; break
        except Exception as e: print(f"    {path} ERR {type(e).__name__}")
    if not found:
        print("[!] no dash page found"); b.close(); sys.exit(1)

    pg.goto(BASE+found, wait_until="domcontentloaded", timeout=40000); time.sleep(4)
    pg.screenshot(path=str(DASH/"dash_full.png"), full_page=True)
    # step carousel
    for k in range(10):
        pg.evaluate("""()=>{const a=[...document.querySelectorAll('button,a,[aria-label],[class*=next],[class*=arrow]')]
          .find(e=>/›|next|forward|→/i.test((e.getAttribute('aria-label')||'')+e.textContent)||/next|right/i.test(e.className));
          if(a)a.click();}""")
        time.sleep(1.3); pg.screenshot(path=str(DASH/f"dash_card_{k}.png"))
    txt=pg.evaluate("()=>document.body.innerText.slice(0,12000)")
    (DASH/"dash_text.json").write_text(json.dumps({"path":found,"json_hits":hits,"text":txt}, indent=2))
    print(f"[*] dash page={found} json_hits={len(hits)} text_len={len(txt)}")
    print("    demo markers in text:", bool(re.search(r'31,?587|Cost per Lead|Paid Acquisition', txt)))
    b.close()
