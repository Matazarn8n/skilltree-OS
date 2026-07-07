import json,time,pathlib,re
ROOT=pathlib.Path("tools").resolve().parent; OUT=ROOT/"captures"
def le(p):
    d={}
    for l in open(p):
        l=l.strip()
        if "=" in l and not l.startswith("#"):
            k,v=l.split("=",1); d[k.strip()]=v.strip()
    return d
env=le(ROOT/".env.md"); BASE=env["URL"].rstrip("/")
from playwright.sync_api import sync_playwright
apis=[]
with sync_playwright() as p:
    b=p.chromium.launch(headless=True); ctx=b.new_context(viewport={"width":1600,"height":1000}); pg=ctx.new_page()
    pg.on("response", lambda r: apis.append(r.url) if ("json" in r.headers.get("content-type","") and "/_next/" not in r.url) else None)
    pg.goto(env["URL_login"],wait_until="networkidle"); pg.fill("input[type=email]",env["login"]); pg.fill("input[type=password]",env["password"]); pg.keyboard.press("Enter")
    pg.wait_for_load_state("networkidle"); time.sleep=__import__("time").sleep; time.sleep(4)
    pg.goto(BASE+"/",wait_until="networkidle"); time.sleep(5)
    c=pg.evaluate("""()=>({svg:document.querySelectorAll('svg').length,circ:document.querySelectorAll('svg circle,svg image,svg g').length,canvas:document.querySelectorAll('canvas').length,btn:document.querySelectorAll('button').length,a:document.querySelectorAll('a[href]').length,nav:[...document.querySelectorAll('nav a,aside a,[class*=nav] a')].map(e=>e.getAttribute('href')||e.textContent.trim()).slice(0,20),title:document.title})""")
    print("HOME counts:",json.dumps(c,ensure_ascii=False))
    # scripts to detect framework
    fw=pg.evaluate("""()=>({react:!!window.React||!!document.querySelector('#root,#app,[data-reactroot]'),vite:!![...document.querySelectorAll('script[src]')].find(s=>/assets\\/index-/.test(s.src)),next:!!document.querySelector('#__next'),roots:[...document.querySelectorAll('body>div')].map(d=>d.id||d.className).slice(0,5)})""")
    print("FW:",json.dumps(fw,ensure_ascii=False))
    # try clicking center of a sector hub (canvas or svg) - click a few points radially
    b.close()
print("APIs:")
[print(" ",u[:150]) for u in sorted(set(apis))]
