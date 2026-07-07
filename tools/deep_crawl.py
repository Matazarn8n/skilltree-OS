#!/usr/bin/env python3
"""Deep crawl: module lessons + map node inspection. Builds on crawl.py's proven login."""
import sys, time, json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "captures"; DATA = OUT / "content"; DATA.mkdir(parents=True, exist_ok=True)
LES = OUT / "lessons"; LES.mkdir(exist_ok=True)
def load_env(p):
    d={}
    for l in p.read_text().splitlines():
        l=l.strip()
        if "=" in l and not l.startswith("#"): k,v=l.split("=",1); d[k.strip()]=v.strip()
    return d
env=load_env(ROOT/".env.md"); BASE=env["URL"].rstrip("/"); LOGIN=env.get("URL_login",BASE+"/login")
from playwright.sync_api import sync_playwright

def settle(pg,timeout=20):
    end=time.time()+timeout; last=-1
    while time.time()<end:
        try: c=pg.evaluate("()=>({txt:(document.body.innerText||'').length,btn:document.querySelectorAll('button').length,err:!!document.querySelector('.errwrap')})")
        except Exception: time.sleep(0.5); continue
        if c["err"] and c["txt"]<200:
            try: pg.reload(wait_until="domcontentloaded")
            except: pass
            time.sleep(1.5); continue
        if c["txt"]>300 and c["txt"]==last: return c
        last=c["txt"]; time.sleep(0.7)
    return c

with sync_playwright() as p:
    b=p.chromium.launch(headless=True); ctx=b.new_context(viewport={"width":1600,"height":1000},device_scale_factor=2); pg=ctx.new_page()
    pg.goto(LOGIN,wait_until="networkidle"); pg.fill("input[type=email]",env["login"]); pg.fill("input[type=password]",env["password"])
    (pg.query_selector("button[type=submit]") or pg.keyboard).click() if pg.query_selector("button[type=submit]") else pg.keyboard.press("Enter")
    try: pg.wait_for_function("()=>!location.pathname.includes('login')",timeout=30000)
    except: pg.keyboard.press("Enter")
    pg.wait_for_load_state("networkidle"); time.sleep(3); print("[*] auth ->",pg.url)

    # ---- MAP render probe ----
    pg.goto(BASE+"/map",wait_until="domcontentloaded"); settle(pg); time.sleep(3)
    m=pg.evaluate("""()=>({
      canvas:document.querySelectorAll('canvas').length,
      svg:document.querySelectorAll('svg').length,
      svgnodes:document.querySelectorAll('svg circle,svg image,svg g[class*=node],svg [class*=node]').length,
      clickable:[...document.querySelectorAll('[class*=node],[data-skill],[data-node],[role=button]')].length,
      sample_classes:[...new Set([...document.querySelectorAll('svg *')].map(e=>e.getAttribute('class')).filter(Boolean))].slice(0,15),
      buttons:[...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(Boolean).slice(0,30)
    })""")
    print("[*] MAP render:",json.dumps(m,ensure_ascii=False)[:600])
    (DATA/"map_probe.json").write_text(json.dumps(m,ensure_ascii=False,indent=2))

    # ---- MODULES: expand each module -> capture lessons ----
    pg.goto(BASE+"/modules",wait_until="domcontentloaded"); settle(pg); time.sleep(2)
    # find module links (cards). collect hrefs under /modules or clickable module titles
    mod_links=pg.evaluate("""()=>[...document.querySelectorAll('a[href*="module"],a[href*="lesson"],a[href*="/modules/"]')].map(a=>({href:a.getAttribute('href'),text:a.textContent.trim()}))""")
    print("[*] module links:",json.dumps(mod_links,ensure_ascii=False)[:400])
    # also grab all internal links on modules page
    alllinks=pg.evaluate("""()=>[...new Set([...document.querySelectorAll('a[href^="/"]')].map(a=>a.getAttribute('href')))]""")
    lesson_hrefs=[h for h in alllinks if any(k in h for k in ["module","lesson","start-here","foundation","brain"])]
    print("[*] candidate lesson/module hrefs:",lesson_hrefs)
    visited=set()
    for h in lesson_hrefs:
        if h in visited: continue
        visited.add(h)
        try:
            pg.goto(BASE+h,wait_until="domcontentloaded"); settle(pg); time.sleep(1.5)
            name=re.sub(r"[^a-z0-9]+","_",h.strip("/").lower())
            pg.screenshot(path=str(LES/f"{name}.png"),full_page=True)
            d=pg.evaluate("""()=>({url:location.href,title:document.title,
              headings:[...document.querySelectorAll('h1,h2,h3')].map(h=>h.tagName+': '+h.textContent.trim()),
              sublinks:[...new Set([...document.querySelectorAll('a[href^="/"]')].map(a=>a.getAttribute('href')))],
              text:(document.body.innerText||'').slice(0,12000)})""")
            (LES/f"{name}.json").write_text(json.dumps(d,ensure_ascii=False,indent=2))
            # queue any deeper lesson links discovered
            for s in d["sublinks"]:
                if any(k in s for k in ["module","lesson","foundation","brain","start-here"]) and s not in visited and s not in lesson_hrefs:
                    lesson_hrefs.append(s)
            print(f"[+] {h}  ({len(d['text'])} chars, {len(d['headings'])} headings)")
        except Exception as e:
            print(f"[!] {h}: {type(e).__name__}")
    b.close()
print("[*] deep crawl done")
