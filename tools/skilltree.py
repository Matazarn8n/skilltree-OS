#!/usr/bin/env python3
"""Driver réutilisable SkillTree — primitives prouvées (login/settle/scrape) + helpers
navigation/clic/download pour les agents de collecte. Importer, ne pas re-dériver.

    from skilltree import driver
    with driver() as (pg, BASE):
        goto(pg, BASE+"/hub")
        click_and_shot(pg, "text=Carousel Designer", "captures/dynamic/hub_modal_carousel.png")

Interpréteur : ~/.higgsfield-login-venv/bin/python. Creds : ../.env.md (jamais loggés).
ponytail: pas de framework, primitives minces au-dessus de Playwright sync.
"""
import time, re, json, pathlib
from contextlib import contextmanager

ROOT = pathlib.Path(__file__).resolve().parent.parent

def load_env(p=ROOT / ".env.md"):
    d = {}
    for l in pathlib.Path(p).read_text().splitlines():
        l = l.strip()
        if "=" in l and not l.startswith("#"):
            k, v = l.split("=", 1); d[k.strip()] = v.strip()
    return d

def settle(pg, timeout=25):
    """Attend que le SPA ait rendu du contenu réel (pas errwrap/shell vide). Prouvé."""
    end = time.time() + timeout; last = -1
    while time.time() < end:
        try:
            c = pg.evaluate("""() => ({
                btn: document.querySelectorAll('button').length,
                a: document.querySelectorAll('a[href]').length,
                txt: (document.body.innerText||'').length,
                err: !!document.querySelector('.errwrap') || /something went wrong/i.test(document.body.innerText||'')
            })""")
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

def scrape(pg):
    """Extrait nav/boutons/headings/texte de la vue courante. Prouvé."""
    return pg.evaluate("""() => ({
        title: document.title, url: location.href,
        nav: [...document.querySelectorAll('nav a, aside a, [class*=sidebar] a')].map(a=>({href:a.getAttribute('href'),text:a.textContent.trim()})).filter(x=>x.text),
        buttons: [...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(Boolean).slice(0,80),
        headings: [...document.querySelectorAll('h1,h2,h3')].map(h=>h.tagName+': '+h.textContent.trim()).slice(0,80),
        text: (document.body.innerText||'').slice(0, 14000)
    })""")

def goto(pg, url, wait=2.0):
    pg.goto(url, wait_until="domcontentloaded", timeout=40000)
    c = settle(pg); time.sleep(wait); return c

def shot(pg, path, full=True):
    pathlib.Path(path).parent.mkdir(parents=True, exist_ok=True)
    pg.screenshot(path=str(path), full_page=full)
    size = pathlib.Path(path).stat().st_size
    if size < 30000: print(f"[!] {path} = {size}b (SUSPECT VIDE)")
    return size

def save_json(path, obj):
    p = pathlib.Path(path); p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2)); return p

def click_and_shot(pg, selector, out_png, wait=1.5, out_json=None):
    """Clique un élément (texte/CSS), attend, screenshot (+ scrape optionnel)."""
    el = pg.query_selector(selector)
    if not el: print(f"[!] introuvable: {selector}"); return None
    el.scroll_into_view_if_needed(); el.click(); time.sleep(wait)
    shot(pg, out_png)
    if out_json: save_json(out_json, scrape(pg))
    return True

def expand_all(pg, card_selector, out_dir, prefix, max_clicks=4):
    """Clique chaque carte (CHART job) plusieurs fois pour dérouler tous ses skills.
    Screenshot chaque état déroulé + scrape. Retourne la liste des textes déroulés."""
    cards = pg.query_selector_all(card_selector); results = []
    for i, _ in enumerate(cards):
        cards = pg.query_selector_all(card_selector)  # re-query, DOM bouge
        if i >= len(cards): break
        card = cards[i]
        try:
            card.scroll_into_view_if_needed()
            for c in range(max_clicks):
                card.click(); time.sleep(0.8)
                txt = card.inner_text()
                shot(pg, f"{out_dir}/{prefix}_{i:02d}_{c}.png", full=False)
                if "SKILL" in txt.upper() or c == max_clicks - 1:
                    results.append({"idx": i, "clicks": c + 1, "text": txt}); break
        except Exception as e:
            print(f"[!] carte {i}: {type(e).__name__}")
    return results

def carousel_walk(pg, next_selector, shot_fn, max_steps=12):
    """Défile un carrousel (DASHBOARDS) via le bouton next, screenshot chaque étape."""
    for step in range(max_steps):
        shot_fn(step)
        nxt = pg.query_selector(next_selector)
        if not nxt: break
        try: nxt.click(); time.sleep(1.2)
        except Exception: break

def capture_downloads(pg, trigger_selector, out_dir):
    """Clique un déclencheur de download ('Take it ↓') et sauve le fichier.
    Retourne le chemin sauvé, ou None. Utilise l'event 'download' de Playwright."""
    pathlib.Path(out_dir).mkdir(parents=True, exist_ok=True)
    try:
        with pg.expect_download(timeout=15000) as dl_info:
            pg.click(trigger_selector)
        dl = dl_info.value
        dest = pathlib.Path(out_dir) / dl.suggested_filename
        dl.save_as(str(dest)); return str(dest)
    except Exception as e:
        print(f"[!] download {trigger_selector}: {type(e).__name__}"); return None

@contextmanager
def driver(headless=True, record_json=False):
    """Contexte authentifié prêt à l'emploi. yield (page, BASE_URL).
    record_json=True → attache page.on('response') pour logguer les URLs JSON/JS."""
    from playwright.sync_api import sync_playwright
    env = load_env(); BASE = env["URL"].rstrip("/"); LOGIN = env.get("URL_login", BASE + "/login")
    with sync_playwright() as p:
        b = p.chromium.launch(headless=headless)
        ctx = b.new_context(viewport={"width": 1600, "height": 1000}, device_scale_factor=2)
        pg = ctx.new_page()
        seen = []
        if record_json:
            pg.on("response", lambda r: seen.append(r.url) if ("json" in r.headers.get("content-type","") and "/_next/" not in r.url) else None)
        # login prouvé
        pg.goto(LOGIN, wait_until="networkidle", timeout=45000)
        pg.fill("input[type=email]", env["login"]); pg.fill("input[type=password]", env["password"])
        btn = pg.query_selector("button[type=submit]")
        (btn.click() if btn else pg.keyboard.press("Enter"))
        try: pg.wait_for_function("()=>!location.pathname.includes('login')", timeout=30000)
        except Exception: pg.keyboard.press("Enter")
        pg.wait_for_load_state("networkidle", timeout=45000); time.sleep(3)
        assert "login" not in pg.url, f"login échoué, url={pg.url}"
        try:
            pg._st_seen = seen  # expose network log
            yield pg, BASE
        finally:
            b.close()

if __name__ == "__main__":
    # self-check : login + home rendu + nav non vide
    with driver() as (pg, BASE):
        c = goto(pg, BASE + "/hub")
        d = scrape(pg)
        assert d["text"] and len(d["text"]) > 400, "hub vide"
        assert any("Modules" in n["text"] or "Brain" in n["text"] for n in d["nav"]), "nav manquante"
        print(f"[OK] login+render+nav — hub {len(d['text'])} chars, {len(d['nav'])} nav links")
