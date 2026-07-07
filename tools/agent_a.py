#!/usr/bin/env python3
"""Agent A - completion run. Cible ce qui manque après le premier passage:
- /brain : chemin "Draft with AI" (brain_ai) + les 8 sections du chemin manuel
  (brain_section_1..8), en cliquant Continue -> sans remplir (pour voir juste
  les prompts de chaque section, sans polluer les vraies données du compte).
- /tree : re-vérif exhaustive des boutons/DOM pour un éventuel bouton d'audit.
- /community : re-scrape complet (déjà capturé mais on revérifie fraicheur).
Écrit dans captures/dynamic/.
"""
import sys, pathlib, json, time
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from skilltree import driver, goto, scrape, shot, save_json, click_and_shot, settle

OUT = pathlib.Path(__file__).resolve().parent.parent / "captures" / "dynamic"

def log(*a):
    print("[agent_a]", *a)

with driver() as (pg, BASE):
    # ---------- /tree : recherche exhaustive d'un bouton d'audit ----------
    log("goto /tree")
    goto(pg, BASE + "/tree")
    all_buttons = pg.evaluate("() => [...document.querySelectorAll('button, a')].map(b => b.textContent.trim()).filter(Boolean)")
    log("boutons/liens /tree:", all_buttons)
    audit_candidates = [b for b in all_buttons if "audit" in b.lower()]
    log("candidats audit sur /tree:", audit_candidates)
    if audit_candidates:
        ok = click_and_shot(pg, f"text={audit_candidates[0]}", OUT / "tree_audit.png", out_json=OUT / "tree_audit.json")
        log("tree_audit click:", ok)
    else:
        save_json(OUT / "tree_audit_NOTFOUND.json", {"note": "aucun bouton contenant 'audit' trouvé sur /tree", "buttons_a_and_links": all_buttons})
        log("PAS de bouton audit sur /tree -> note écrite dans tree_audit_NOTFOUND.json")

    # ---------- /brain : chemin AI ----------
    log("goto /brain (reload frais pour repartir de l'intro)")
    goto(pg, BASE + "/brain")
    shot(pg, OUT / "brain_initial_recheck.png")
    d0 = scrape(pg)
    save_json(OUT / "brain_initial_recheck.json", d0)
    log("headings /brain frais:", d0["headings"], "buttons:", d0["buttons"])

    ai_btn = pg.query_selector("text=Draft my brain with AI")
    if ai_btn:
        try:
            ai_btn.scroll_into_view_if_needed(); ai_btn.click(); time.sleep(2)
            settle(pg)
            shot(pg, OUT / "brain_ai.png")
            save_json(OUT / "brain_ai.json", scrape(pg))
            log("brain_ai capturé")
        except Exception as e:
            log("echec clic AI:", type(e).__name__, e)
    else:
        log("bouton 'Draft my brain with AI' introuvable (état déjà avancé ?)")

    # ---------- /brain : chemin manuel, les 8 sections ----------
    log("goto /brain pour chemin manuel")
    goto(pg, BASE + "/brain")
    manual_btn = pg.query_selector("text=I'll type it myself")
    if manual_btn:
        manual_btn.scroll_into_view_if_needed(); manual_btn.click(); time.sleep(1.5)
        settle(pg)
    else:
        log("bouton 'I'll type it myself' absent -> peut-être déjà en cours de formulaire")

    for n in range(1, 9):
        d = scrape(pg)
        shot(pg, OUT / f"brain_section_{n}.png")
        save_json(OUT / f"brain_section_{n}.json", d)
        log(f"section {n}: headings={d['headings']} buttons={d['buttons']}")
        cont = pg.query_selector("text=Continue")
        if not cont:
            cont = pg.query_selector("button:has-text('Continue')")
        if not cont:
            log(f"pas de bouton Continue apres section {n}, arret")
            break
        try:
            cont.scroll_into_view_if_needed(); cont.click(); time.sleep(1.5)
            settle(pg)
        except Exception as e:
            log(f"echec clic Continue section {n}:", type(e).__name__, e)
            break

log("DONE")
