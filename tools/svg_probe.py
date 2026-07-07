import time,json,pathlib
ROOT=pathlib.Path("tools").resolve().parent
def le(p):
    d={}
    for l in open(p):
        l=l.strip()
        if "=" in l and not l.startswith("#"): k,v=l.split("=",1); d[k.strip()]=v.strip()
    return d
env=le(ROOT/".env.md"); BASE=env["URL"].rstrip("/")
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(headless=True); ctx=b.new_context(viewport={"width":1600,"height":1000}); pg=ctx.new_page()
    pg.goto(env["URL_login"],wait_until="networkidle"); pg.fill("input[type=email]",env["login"]); pg.fill("input[type=password]",env["password"]); pg.keyboard.press("Enter")
    try: pg.wait_for_function("()=>!location.pathname.includes('login')",timeout=30000)
    except: pass
    pg.wait_for_load_state("networkidle"); time.sleep(3)
    pg.goto(BASE+"/map",wait_until="domcontentloaded"); time.sleep(5)
    # census of svg children tag names + a sample node's outerHTML
    r=pg.evaluate("""()=>{
      const svgs=[...document.querySelectorAll('svg')];
      const census={};
      svgs.forEach(s=>[...s.querySelectorAll('*')].forEach(e=>{census[e.tagName]=(census[e.tagName]||0)+1}));
      // elements with text (skill labels)
      const texts=[...document.querySelectorAll('svg text')].map(t=>t.textContent.trim()).filter(Boolean).slice(0,40);
      // any element with pointer/cursor or data attrs
      const withData=[...document.querySelectorAll('*')].filter(e=>[...e.attributes].some(a=>/data-/.test(a.name))).map(e=>e.tagName+'['+[...e.attributes].filter(a=>/data-/.test(a.name)).map(a=>a.name).join(',')+']');
      const dataCensus={}; withData.forEach(x=>dataCensus[x]=(dataCensus[x]||0)+1);
      // biggest svg node sample
      const g=document.querySelector('svg g[transform], svg image, svg circle');
      return {svgCount:svgs.length, census, texts, dataCensus:Object.fromEntries(Object.entries(dataCensus).slice(0,20)), sampleHTML:(g?g.outerHTML.slice(0,300):null), bodySample:document.body.innerText.slice(0,300)};
    }""")
    print(json.dumps(r,ensure_ascii=False,indent=1)[:2500])
    # try hovering/clicking center-ish nodes by scanning svg circles positions
    b.close()
