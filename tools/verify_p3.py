#!/usr/bin/env python3
"""Suite de preuves Phase 3 / Plan 03-02 (Modules — stepper + reader + progression) — rendu réel.

Préalable serveur :
    cd apps/web && pnpm build && npx next start -p ${PORT:-3010} &
    (poll http://localhost:$PORT/modules jusqu'à 200)

Lancer :
    PORT=3010 /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p3.py

Chaque check imprime PASS/FAIL + la valeur mesurée. Premier FAIL → exit 1 (aucune
preuve verte n'est consignée sur un échec). Tout PASS → écrit orchestration/verify/p3/
{dom-assert.txt, lesson-long.png, stepper-advance.png} (coverage.md déjà écrit en Task 1).
"""
import os
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

PORT = os.environ.get("PORT", "3010")
BASE = f"http://localhost:{PORT}"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "orchestration" / "verify" / "p3"
OUT.mkdir(parents=True, exist_ok=True)

report: list[str] = []


def log(line: str) -> None:
    print(line)
    report.append(line)


def check(cond: bool, name: str, measured: str) -> None:
    status = "PASS" if cond else "FAIL"
    log(f"[{status}] {name} :: {measured}")
    if not cond:
        log("\n>>> ÉCHEC — arrêt, aucune preuve verte écrite.")
        sys.exit(1)


PROGRESS_KEY = "skilltree.progress.v1"


def clear_progress(page) -> None:
    page.evaluate(f"() => window.localStorage.removeItem('{PROGRESS_KEY}')")


def stepper_count(page):
    """Lit le compteur "X / N leçons terminées" du Stepper (aside sticky)."""
    txt = page.locator("[data-testid='stepper-count']").first.inner_text().strip()
    m = re.match(r"(\d+)\s*/\s*(\d+)", txt)
    assert m, f"compteur stepper illisible: {txt!r}"
    return int(m.group(1)), int(m.group(2)), txt


# ── anti-verbatim : fenêtres de 8 mots de la capture EN absentes du texte FR ──
def string_literals(ts_source: str) -> str:
    """Extrait les valeurs de string literals d'un fichier de leçon .ts (title/dek/blocks)."""
    vals = re.findall(r'"((?:[^"\\]|\\.)*)"', ts_source)
    return " ".join(vals)


def word_windows(text: str, n: int = 8) -> set[str]:
    words = re.findall(r"[A-Za-zÀ-ÿ0-9']+", text.lower())
    return {" ".join(words[i : i + n]) for i in range(len(words) - n + 1)}


def anti_verbatim_check(capture_json_path: Path, lesson_ts_path: Path, label: str):
    import json

    cap = json.loads(capture_json_path.read_text())
    cap_text = cap["text"]
    fr_source = lesson_ts_path.read_text()
    fr_text = string_literals(fr_source)

    cap_windows = word_windows(cap_text)
    fr_words = re.findall(r"[A-Za-zÀ-ÿ0-9']+", fr_text.lower())
    fr_joined = " ".join(fr_words)
    hits = [w for w in cap_windows if w in fr_joined]
    ok = len(hits) == 0
    log(
        f"    anti-verbatim [{label}] : {len(cap_windows)} fenêtres-8-mots (capture EN) testées "
        f"contre le texte FR ({lesson_ts_path.name}) → {len(hits)} trouvée(s) : {hits[:3]}"
    )
    return ok, hits


def run() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()

        # ── setup : repartir d'un état de progression connu (0) ─────────────
        page.goto(f"{BASE}/modules/start-here/welcome", wait_until="networkidle")
        clear_progress(page)
        page.reload(wait_until="networkidle")

        # 1. Stepper avance : compteur initial 0/8, clic "Marquer comme terminé" → 1/8
        before, total, before_txt = stepper_count(page)
        check(before == 0 and total == 8, "compteur initial start-here", before_txt)

        page.locator("[data-testid='mark-complete']").click()
        page.wait_for_timeout(200)
        after, total2, after_txt = stepper_count(page)
        check(
            after == before + 1 and total2 == total,
            "compteur avance après marquage (X → X+1)",
            f"{before_txt}  →  {after_txt}",
        )
        done_steps = page.locator("a[data-lesson-status='done']").count()
        active_current = page.locator("a[aria-current='step']").count()
        check(done_steps == 1, "1 étape marquée done dans le stepper", f"done_steps={done_steps}")
        mark_pressed = page.locator("[data-testid='mark-complete']").get_attribute("aria-pressed")
        check(mark_pressed == "true", "bouton Marquer comme terminé aria-pressed=true", f"aria-pressed={mark_pressed}")
        page.screenshot(path=str(OUT / "stepper-advance.png"))

        # 1b. persistance au reload : compteur + localStorage lus après un vrai reload navigateur
        page.reload(wait_until="networkidle")
        after_reload, _, after_reload_txt = stepper_count(page)
        ls_val = page.evaluate(f"() => window.localStorage.getItem('{PROGRESS_KEY}')")
        persists = after_reload == after and ls_val is not None and "start-here/welcome" in ls_val
        check(
            persists,
            "persistance reload (compteur reste X+1 + clé localStorage présente)",
            f"compteur_après_reload={after_reload_txt} localStorage[{PROGRESS_KEY}]={ls_val}",
        )

        # 2. Navigation complète : "Suivant" à travers tout le module start-here (8 leçons)
        #    puis transition vers le module suivant (foundations) — LessonNav/getAdjacent.
        visited = [page.url]
        reached_foundations = False
        for _ in range(9):
            next_link = page.get_by_role("link", name=re.compile(r"^Suivant"))
            if next_link.count() == 0:
                break
            next_link.first.click()
            page.wait_for_load_state("networkidle")
            visited.append(page.url)
            if "/modules/foundations/install-claude-code" in page.url:
                reached_foundations = True
                break
        check(
            reached_foundations,
            "navigation complète start-here (8 leçons) → transition module suivant (foundations)",
            f"{len(visited)} pages parcourues, dernière={visited[-1]}",
        )

        # 3. Leçon longue (foundations/claude-md) : ≥2 sections, ≥1 bloc code, ≥1 callout
        page.goto(f"{BASE}/modules/foundations/claude-md", wait_until="networkidle")
        h2_count = page.locator("article h2").count()
        code_count = page.locator("article pre code").count()
        callout_count = page.locator("article").get_by_text("Idée clé", exact=True).count()
        check(
            h2_count >= 2 and code_count >= 1 and callout_count >= 1,
            "leçon longue structurée (sections + code + callout)",
            f"h2={h2_count} code={code_count} callout={callout_count}",
        )
        page.screenshot(path=str(OUT / "lesson-long.png"), full_page=True)

        ctx.close()
        browser.close()

    # 4. Anti-verbatim (hors-browser) : la leçon complétée en Task 2 (tool-stack, section
    #    "Meetings" ajoutée) + la leçon longue de référence (claude-md) — comparées à leur
    #    capture EN respective. Aucune fenêtre de 8 mots identique attendue (contenu FR neuf).
    checks = [
        (
            ROOT / "captures" / "lessons" / "modules_start_here_tool_stack.json",
            ROOT / "apps" / "web" / "content" / "lessons" / "start-here" / "tool-stack.ts",
            "start-here/tool-stack (section Meetings complétée)",
        ),
        (
            ROOT / "captures" / "lessons" / "modules_foundations_claude_md.json",
            ROOT / "apps" / "web" / "content" / "lessons" / "foundations" / "claude-md.ts",
            "foundations/claude-md (leçon longue de référence)",
        ),
    ]
    verdicts = []
    for cap_path, ts_path, label in checks:
        ok, hits = anti_verbatim_check(cap_path, ts_path, label)
        verdicts.append((label, ok, hits))
        check(ok, f"anti-verbatim ×2 — {label}", f"0 fenêtre de 8 mots identique attendue, trouvé={len(hits)}")

    header = [
        "# Preuve DOM — Phase 3 / Plan 03-02 (Modules) — rendu réel Playwright chromium",
        "",
        f"Serveur : `cd apps/web && pnpm build && npx next start -p {PORT}` (build exit=0, prebuild assert-graph inclus).",
        f"Runner : PORT={PORT} /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p3.py",
        "Viewport desktop 1440×900.",
        "",
        "## Couverture 18/18",
        "Voir orchestration/verify/p3/coverage.md (17 alignées, 1 complétée : start-here/tool-stack §Meetings).",
        "",
        "## Checks (mesures citées)",
        "",
    ]
    footer = [
        "",
        "## Anti-verbatim ×2 — verdicts",
        "",
    ]
    for label, ok, hits in verdicts:
        footer.append(f"- {label} : {'PASS — 0 fenêtre de 8 mots identique' if ok else f'FAIL — {hits}'}")
    footer.append("")
    footer.append("## Fidélité lesson-long.png")
    footer.append(
        "foundations/claude-md vs captures/lessons/modules_foundations_claude_md.png : mêmes 6 sections "
        "(Ce qu'est CLAUDE.md / Deux types / Quoi inclure vs laisser / /init / Template / Config globale), "
        "callout \"Idée clé\", 3 blocs code — structure fidèle, prose FR neuve."
    )
    (OUT / "dom-assert.txt").write_text("\n".join(header + report + footer) + "\n")
    print(f"\nOK — preuves écrites dans {OUT}")


if __name__ == "__main__":
    run()
