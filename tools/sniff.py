import time,json,pathlib
ROOT=pathlib.Path("tools").resolve().parent; OUT=ROOT/"captures"/"content"
def le(p):
    d={}
    for l in open(p):
        l=l.strip()
        if "=" in l and not l.startswith("#"): k,v=l.split("=",1); d[k.strip()]=v.strip()
    return d
env=le(ROOT/".env.md"); BASE=env["URL"].rstrip("/")
from playwright.sync_api import sync_playwright
hits=[]
with sync_playwright() as p:
    b=p.chromium.launch(headless=True); ctx=b.new_context(viewport={"width":1600,"height":1000}); pg=ctx.new_page()
    def cap(r):
        try:
            ct=r.headers.get("content-type","")
            if "json" in ct and "posthog" not in r.url and "/_next/" not in r.url:
                body=r.body()
                hits.append((r.url,len(body),body[:200000]))
        except: pass
    pg.on("response",cap)
    pg.goto(env["URL_login"],wait_until="networkidle"); pg.fill("input[type=email]",env["login"]); pg.fill("input[type=password]",env["password"]); pg.keyboard.press("Enter")
    try: pg.wait_for_function("()=>!location.pathname.includes('login')",timeout=30000)
    except: pass
    pg.wait_for_load_state("networkidle"); time.sleep(3)
    for route in ["/map","/hub","/tree","/brain","/community"]:
        pg.goto(BASE+route,wait_until="networkidle"); time.sleep(3)
        # nudge the map to render/fetch
        try: pg.mouse.click(800,500); pg.mouse.wheel(0,-200); time.sleep(2)
        except: pass
    b.close()
seen={}
for url,ln,body in hits:
    key=url.split("?")[0]
    if key not in seen or ln>seen[key][0]: seen[key]=(ln,url,body)
print("=== JSON endpoints (by size) ===")
for key,(ln,url,body) in sorted(seen.items(),key=lambda x:-x[1][0]):
    print(f"{ln:>8}  {key}")
    if ln>500:
        fn=OUT/("api_"+key.rstrip('/').split('/')[-1]+".json")
        try: open(fn,"wb").write(body); 
        except: pass
