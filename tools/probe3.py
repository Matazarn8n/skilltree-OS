import time,pathlib,json
ROOT=pathlib.Path("tools").resolve().parent; OUT=ROOT/"captures"
def le(p):
    d={}
    for l in open(p):
        l=l.strip()
        if "=" in l and not l.startswith("#"): k,v=l.split("=",1); d[k.strip()]=v.strip()
    return d
env=le(ROOT/".env.md"); BASE=env["URL"].rstrip("/")
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(headless=True,args=["--disable-blink-features=AutomationControlled"])
    ctx=b.new_context(viewport={"width":1600,"height":1000},user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36")
    pg=ctx.new_page()
    pg.goto(env["URL_login"],wait_until="networkidle"); pg.fill("input[type=email]",env["login"]); pg.fill("input[type=password]",env["password"]); pg.keyboard.press("Enter")
    pg.wait_for_load_state("networkidle"); time.sleep(5)
    print("after login url:",pg.url)
    # stay on whatever landed; poll for content up to 20s
    for i in range(10):
        c=pg.evaluate("()=>({btn:document.querySelectorAll('button').length,a:document.querySelectorAll('a').length,txt:document.body.innerText.slice(0,120),err:!!document.querySelector('.errwrap,[class*=err]')})")
        print(i,json.dumps(c,ensure_ascii=False))
        if c["btn"]>0 or c["a"]>3: break
        time.sleep(2)
    pg.screenshot(path=str(OUT/"probe3_landing.png"),full_page=True)
    # dump full innerText of body to see if content is there
    txt=pg.evaluate("()=>document.body.innerText")
    open(OUT/"probe3_bodytext.txt","w").write(txt); print("bodytext len:",len(txt))
    b.close()
