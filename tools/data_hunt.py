import time,json,pathlib,re
ROOT=pathlib.Path("tools").resolve().parent; OUT=ROOT/"captures"; (OUT/"raw").mkdir(parents=True,exist_ok=True)
def le(p):
    d={}
    for l in open(p):
        l=l.strip()
        if "=" in l and not l.startswith("#"): k,v=l.split("=",1); d[k.strip()]=v.strip()
    return d
env=le(ROOT/".env.md"); BASE=env["URL"].rstrip("/")
from playwright.sync_api import sync_playwright
SKILL_MARKERS=["Carousel Designer","Email Verification","Deal Room Producer","Web & Maps","Competitor Teardown","Account Enrichment"]
hits=[]
bodies={}
with sync_playwright() as p:
    b=p.chromium.launch(headless=True); ctx=b.new_context(viewport={"width":1600,"height":1000}); pg=ctx.new_page()
    def on_resp(r):
        u=r.url
        if "/_next/image" in u or u.endswith((".png",".jpg",".svg",".woff",".woff2",".ico")): return
        try:
            ct=r.headers.get("content-type","")
            if any(x in ct for x in ["json","javascript","text"]) or u.endswith(".js") or "/api/" in u:
                body=r.body()
                if not body: return
                txt=body.decode("utf-8","ignore")
                score=sum(txt.count(m) for m in SKILL_MARKERS)
                if score>0 or "/api/" in u:
                    hits.append((score,len(txt),r.status,u))
                    if score>0:
                        key=re.sub(r"[^a-z0-9]+","_",u.split("//")[-1])[:80]
                        bodies[key]=txt
        except Exception: pass
    pg.on("response",on_resp)
    pg.goto(env["URL_login"],wait_until="networkidle"); pg.fill("input[type=email]",env["login"]); pg.fill("input[type=password]",env["password"]); pg.keyboard.press("Enter")
    try: pg.wait_for_function("()=>!location.pathname.includes('login')",timeout=30000)
    except: pass
    pg.wait_for_load_state("networkidle"); time.sleep(3)
    pg.goto(BASE+"/",wait_until="networkidle"); time.sleep(6)
    # also poke /api guesses
    for ep in ["/api/skills","/api/tree","/api/map","/api/nodes","/api/access","/api/me"]:
        try:
            resp=pg.request.get(BASE+ep); t=resp.text()
            if resp.status==200 and len(t)>2: print(f"[API] {ep} -> {resp.status} {len(t)}b :: {t[:100]}")
        except Exception as e: pass
    b.close()
print("=== hits (score, size, status, url) ===")
for h in sorted(hits,reverse=True)[:25]: print(f"  {h[0]:3} {h[1]:8} {h[2]} {h[3][:110]}")
for k,v in bodies.items():
    (OUT/"raw"/(k+".txt")).write_text(v)
print("saved bodies:",list(bodies.keys())[:10])
