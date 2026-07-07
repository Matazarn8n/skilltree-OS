#!/usr/bin/env python3
"""Agent D — BUT 2: reference visuelle map (7 secteurs zoomes + panneaux node echantillon).
BUT 1 (78 skill.md complets) est deja fait par fetch_full.py (captures/skill_files_full/, 78/78, via
GET /api/skill?slug=<slug>) -- ce script ne le refait pas.

Le vrai canvas de la map vit dans un iframe /app-map.html (pas dans la page top-level).
Reperes DOM proves (via probe_agentd.py):
  - overview: div.hit (7, une par secteur, cliquer avec force=True -- des div.wname
    transparents se superposent et interceptent le pointeur en mode normal)
  - apres clic .hit: bodyClass passe par "... transitioning ..." puis se stabilise
    (attendre l'absence de "transitioning" avant tout screenshot/clic suivant)
  - dans un secteur zoome: div.node[role=button][aria-label="<Job> - <niveau>"] = noeud job
    cliquable. Le clic DOIT etre un vrai click() (pas force=True) sinon le handler ne se
    declenche pas de facon fiable (observe: force=True sur un node ne peuple aucun panneau).
  - le panneau job vit dans .chrome.open (conteneur scrollable, scrollHeight > clientHeight).
    Son contenu (.c-name, .c-desc, THE HUMAN/BUILD NOTES/TAKE THE SKILL/YOUR STATUS) est
    injecte dynamiquement au clic (confirme via MutationObserver).
  - fermeture panneau job: bouton ".c-x" (distinct de "#rx"/"hd-x"/"ab-x" qui sont d'autres
    panneaux : lecteur skill.md brut, hub detail, about).
  - selecteur YOUR STATUS: .my button[data-my] avec valeurs "" (Not started), "dev"
    (In development), "live" (Live) ; bouton actif porte la classe "on".

Interpreter: ~/.higgsfield-login-venv/bin/python
"""
import sys, re, time, json, pathlib
sys.path.insert(0, "tools")
from skilltree import driver, goto, settle, shot

ROOT = pathlib.Path(__file__).resolve().parent.parent
ZOOM_DIR = ROOT / "captures" / "map_zoom"
PANEL_DIR = ROOT / "captures" / "map_panel"
ZOOM_DIR.mkdir(parents=True, exist_ok=True)
PANEL_DIR.mkdir(parents=True, exist_ok=True)

SECTORS = ["Sales", "Deals", "Marketing", "Operations", "Intelligence", "Customer", "Back Office"]
NODES_PER_SECTOR = 2  # sample, not exhaustive (137 jobs already fully in data/skills.json)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def wait_settled(frame, timeout=15):
    try:
        frame.wait_for_function(
            "() => !document.body.className.includes('transitioning')", timeout=timeout * 1000
        )
    except Exception:
        pass
    time.sleep(1.0)


def close_job_panel(frame):
    try:
        btn = frame.query_selector(".c-x")
        if btn:
            btn.click(force=True)
            time.sleep(0.5)
    except Exception:
        pass


def capture_status_states(pg, frame, panel_el, out_prefix, log):
    """Bonus: capture the 3 clickable YOUR STATUS states, then reset to 'Not started'."""
    for label, data_my in [("notstarted", ""), ("dev", "dev"), ("live", "live")]:
        try:
            btn = frame.query_selector(f'.my button[data-my="{data_my}"]')
            if not btn:
                log.append(f"[!] status btn {label} introuvable")
                continue
            btn.click(force=True)
            time.sleep(0.6)
            panel_el.screenshot(path=str(PANEL_DIR / f"{out_prefix}_status_{label}.png"))
        except Exception as e:
            log.append(f"[!] status {label}: {type(e).__name__}")
    # reset to Not started so we don't leave the account's tracker mutated
    try:
        btn = frame.query_selector('.my button[data-my=""]')
        if btn:
            btn.click(force=True)
            time.sleep(0.3)
    except Exception:
        pass


def main():
    report = {"zoom": {}, "panels": {}, "errors": []}
    log = []
    with driver() as (pg, BASE):
        for si, sector in enumerate(SECTORS):
            sslug = slug(sector)
            try:
                goto(pg, BASE + "/map", wait=2)
                settle(pg)
                time.sleep(1.5)
                frame = next(f for f in pg.frames if "app-map.html" in f.url)

                hits = frame.query_selector_all(".hit")
                if len(hits) != 7:
                    log.append(f"[!] {sector}: attendu 7 .hit, trouve {len(hits)}")
                hits[si].click(force=True)
                wait_settled(frame)

                zoom_path = ZOOM_DIR / f"{sslug}.png"
                size = shot(pg, zoom_path)
                report["zoom"][sector] = size
                log.append(f"[OK] zoom {sector} -> {zoom_path} ({size}b)")

                # collect distinct job nodes (skip the sector root / START HERE cue node)
                nodes = frame.query_selector_all("div.node")
                seen_labels = set()
                candidates = []
                for n in nodes:
                    try:
                        label = n.get_attribute("aria-label") or ""
                    except Exception:
                        continue
                    if not label or label in seen_labels:
                        continue
                    seen_labels.add(label)
                    candidates.append((label, n))

                picked = candidates[:NODES_PER_SECTOR]
                for idx, (label, node) in enumerate(picked):
                    job_name = label.split("·")[0].strip() or label.split(",")[0].strip()
                    jslug = slug(job_name) or f"node{idx}"
                    prefix = f"{sslug}__{jslug}"
                    try:
                        node.scroll_into_view_if_needed()
                        node.click()
                        time.sleep(1.5)
                        panel_el = frame.query_selector(".chrome.open")
                        if not panel_el:
                            log.append(f"[!] {sector}/{job_name}: pas de panneau ouvert apres clic")
                            continue
                        panel_el.screenshot(path=str(PANEL_DIR / f"{prefix}_top.png"))
                        # scroll the panel's inner scrollable box to the bottom
                        frame.evaluate(
                            """(p) => {
                                function findScroll(el) {
                                    if (el.scrollHeight > el.clientHeight + 5) return el;
                                    for (const c of el.children) { const r = findScroll(c); if (r) return r; }
                                    return null;
                                }
                                const sc = findScroll(p);
                                if (sc) sc.scrollTop = sc.scrollHeight;
                            }""",
                            panel_el,
                        )
                        time.sleep(0.5)
                        panel_el.screenshot(path=str(PANEL_DIR / f"{prefix}_scrolled.png"))
                        report["panels"][prefix] = "ok"
                        log.append(f"[OK] panel {prefix}")

                        if si == 0 and idx == 0:
                            capture_status_states(pg, frame, panel_el, prefix, log)
                            report["panels"][prefix + "_status_states"] = "ok (3 etats captures)"

                        close_job_panel(frame)
                    except Exception as e:
                        log.append(f"[!] panel {sector}/{job_name}: {type(e).__name__}: {e}")
                        report["panels"][prefix] = f"ERR {type(e).__name__}"
            except Exception as e:
                log.append(f"[!!] secteur {sector} echec complet: {type(e).__name__}: {e}")
                report["errors"].append(f"{sector}: {type(e).__name__}: {e}")

    (ROOT / "captures" / "agent_d_report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print("\n".join(log))
    print(f"\n[*] zoom captures: {len(report['zoom'])}/7")
    ok_panels = sum(1 for v in report["panels"].values() if v == "ok")
    print(f"[*] panel captures: {ok_panels} noeuds OK")
    print("[*] report -> captures/agent_d_report.json")


if __name__ == "__main__":
    main()
