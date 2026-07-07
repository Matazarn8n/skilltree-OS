#!/usr/bin/env python3
"""Probe: prove we can extract exact content + interactions, not guess from frames.
Logs in, records JSON API responses, dumps __NEXT_DATA__, counts nodes, clicks one node.
"""
import os, re, json, time, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "captures"; OUT.mkdir(exist_ok=True)
def load_env(p):
    d={}
    for l in p.read_text().splitlines():
        l=l.strip()
        if "=" in l and not l.startswith("#"):
            k,v=l.split("=",1); d[k.strip()]=v.strip()
    return d
env=load_env(ROOT/".env.md"); BASE=env["URL"].rstrip("/")
from playwright.sync_api import sync_playwright
json_hits=[]
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    ctx=b.new_context(viewport={"width":1600,"height":1000})
    pg=ctx.new_page()
    def on_resp(r):
        try:
            ct=r.headers.get("content-type","")
            if "json" in ct and "vercel" not in r.url and "/_next/" not in r.url:
                json_hits.append((r.status, r.url))
        except: pass
    pg.on("response", on_resp)
    pg.goto(env.get("URL_login",BASE+"/login"), wait_until="networkidle", timeout=45000)
    pg.fill("input[type=email]", env["login"]); pg.fill("input[type=password]", env["password"])
    (pg.query_selector("button[type=submit]") or pg).click() if pg.query_selector("button[type=submit]") else pg.keyboard.press("Enter")
    pg.wait_for_load_state("networkidle", timeout=45000); time.sleep(3)
    # go to play/map
    pg.goto(BASE+"/play", wait_until="networkidle", timeout=40000); time.sleep(3)
    # dump __NEXT_DATA__
    nd = pg.eval_on_selector("#__NEXT_DATA__","e=>e.textContent") if pg.query_selector("#__NEXT_DATA__") else None
    if nd: (OUT/"next_data_play.json").write_text(nd); print("[+] __NEXT_DATA__ /play bytes:", len(nd))
    # look for graph nodes in DOM (svg circles / g nodes / data attributes)
    counts = pg.evaluate("""() => ({
      svg_circles: document.querySelectorAll('svg circle').length,
      svg_g: document.querySelectorAll('svg g').length,
      canvas: document.querySelectorAll('canvas').length,
      buttons: document.querySelectorAll('button').length,
      data_nodes: document.querySelectorAll('[data-node-id],[data-skill],[data-id]').length,
      links: document.querySelectorAll('a[href]').length,
    })""")
    print("[+] /play DOM counts:", json.dumps(counts))
    # window data globals
    globs = pg.evaluate("""() => Object.keys(window).filter(k => /skill|tree|node|data|store|state/i.test(k)).slice(0,40)""")
    print("[+] window globals:", globs)
    # try clicking a graph node (svg circle) to see interaction
    clicked=False
    for sel in ["svg circle","canvas","[data-node-id]","[data-skill]"]:
        el = pg.query_selector(sel)
        if el:
            try:
                box=el.bounding_box()
                if box and box["width"]>0:
                    pg.mouse.click(box["x"]+box["width"]/2, box["y"]+box["height"]/2); time.sleep(2)
                    pg.screenshot(path=str(OUT/f"probe_click_{re.sub('[^a-z]','',sel)}.png"))
                    print(f"[+] clicked {sel}, screenshot saved"); clicked=True; break
            except Exception as e: print("[!] click",sel,type(e).__name__)
    b.close()
print("=== JSON API responses seen ===")
seen=set()
for st,u in json_hits:
    key=u.split("?")[0]
    if key not in seen:
        seen.add(key); print(f"  {st} {u[:140]}")
(OUT/"api_endpoints.json").write_text(json.dumps(sorted(set(u for _,u in json_hits)),indent=2))
