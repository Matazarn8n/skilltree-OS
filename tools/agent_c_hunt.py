#!/usr/bin/env python3
"""Agent C — BUT 1 (hunt). Cherche la source réseau des chiffres démo des
command centers (dashboards) : "Paid Acquisition", "31,587", "Cost per Lead",
"HubSpot", "Command Center", "dashboard". Enregistre pg.on("response") sur
TOUTES les réponses JS/JSON/text (hors /_next/image et binaires), compte les
marqueurs dans le corps, sauve tout hit dans captures/raw/, affiche le top 15
(score, taille, url). Anti-faux-positif : si 0 hit réseau, le dit honnêtement
(les stats sont alors calculées côté client, pas fetchées) au lieu de fabriquer
une conclusion.

Usage: python3 tools/agent_c_hunt.py
Interpréteur: ~/.higgsfield-login-venv/bin/python
"""
import sys, re, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from skilltree import driver, goto, save_json

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "captures" / "raw"
RAW.mkdir(parents=True, exist_ok=True)

MARKERS = ["Paid Acquisition", "31,587", "Cost per Lead", "HubSpot", "Command Center", "dashboard"]
BINARY_EXT = re.compile(r"\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf|mp4|mp3|pdf)(\?|$)", re.I)


def score_body(url, body):
    return sum(body.count(m) for m in MARKERS)


def main():
    hits = []  # list of dicts: url, score, size, saved_path
    seen_urls = set()

    def on_response(resp):
        try:
            url = resp.url
            if "/_next/image" in url:
                return
            if BINARY_EXT.search(url):
                return
            ct = (resp.headers or {}).get("content-type", "")
            if not any(t in ct for t in ("json", "javascript", "text")):
                return
            if url in seen_urls:
                return
            seen_urls.add(url)
            body = resp.text()
            s = score_body(url, body)
            entry = {"url": url, "score": s, "size": len(body)}
            if s > 0:
                fname = re.sub(r"[^a-z0-9]+", "_", url.split("//")[-1].lower())[:90]
                out = RAW / f"agentc_hunt_{fname}.txt"
                out.write_text(body, encoding="utf-8", errors="replace")
                entry["saved"] = str(out.relative_to(ROOT))
            hits.append(entry)
        except Exception as e:
            print(f"[!] response capture error on {getattr(resp,'url','?')}: {type(e).__name__}: {e}")

    with driver(record_json=False) as (pg, BASE):
        pg.on("response", on_response)

        print(f"[*] goto {BASE}/map")
        goto(pg, BASE + "/map", wait=2.0)

        # cherche et clique l'onglet DASHBOARDS
        clicked = False
        for sel in ["text=DASHBOARDS", "text=Dashboards", "[href*=dash]", "text=Command Center"]:
            el = pg.query_selector(sel)
            if el:
                try:
                    el.scroll_into_view_if_needed()
                    el.click()
                    clicked = True
                    print(f"[*] clic onglet DASHBOARDS via sélecteur: {sel}")
                    break
                except Exception as e:
                    print(f"[!] clic échoué sur {sel}: {type(e).__name__}")
        if not clicked:
            print("[!] onglet DASHBOARDS introuvable sur /map — tentative directe /app/dash/index.html")
            goto(pg, BASE + "/app/dash/index.html", wait=2.0)

        pg.wait_for_timeout(4000)  # laisse le temps aux fetch/xhr de partir

    # ---- rapport ----
    hits_sorted = sorted(hits, key=lambda h: (-h["score"], -h["size"]))
    top = hits_sorted[:15]
    print(f"\n[*] réponses observées (JS/JSON/text, hors _next/image et binaires): {len(hits)}")
    print("[*] top 15 (score, taille, url):")
    for h in top:
        print(f"  score={h['score']:<3} size={h['size']:<8} {h['url']}")
    matched = [h for h in hits if h["score"] > 0]
    save_json(RAW / "agentc_hunt_summary.json", {"total_responses": len(hits), "matched": matched, "top15": top})
    if not matched:
        print("\n[HONNÊTE] 0 réponse réseau ne contient les marqueurs demandés. Les chiffres des dashboards")
        print("ne sont PAS fetchés depuis une API/JSON — ils sont générés côté client par un moteur PRNG")
        print("déterministe embarqué dans le HTML (captures/raw/skilltree_dash_index_html.txt, seed fixe).")
        print("Voir tools/agent_c_parse_dash.js qui exécute ce code (au lieu de le deviner) pour produire")
        print("data/dashboards.json avec les vraies valeurs calculées par l'algorithme du site.")
    else:
        print(f"\n[*] {len(matched)} réponse(s) réseau avec marqueurs sauvées dans captures/raw/agentc_hunt_*.txt")


if __name__ == "__main__":
    main()
