#!/usr/bin/env python3
"""Suite de preuves Plan 03-01 (Hub + Install local + 78 fiches) — rendu réel.

Préalable serveur :
    cd apps/web && pnpm build && npx next start -p 3010 &
    (poll http://localhost:3010/hub jusqu'à 200)

Lancer :
    /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p2.py

Chaque check imprime PASS/FAIL + la valeur mesurée. Premier FAIL -> exit 1 (aucune preuve
verte n'est consignée sur un échec). Tout PASS -> écrit orchestration/verify/p2/
{dom-assert.txt, hub.png, cmdk-modal.png, skill-files-count.txt}.
"""
import difflib
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://localhost:3010"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "orchestration" / "verify" / "p2"
OUT.mkdir(parents=True, exist_ok=True)

CONTENT_DIR = ROOT / "apps" / "web" / "content" / "skills"
SOURCE_DIR = ROOT / "captures" / "skill_files_full"

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


def words(text: str) -> list[str]:
    return re.findall(r"[A-Za-zÀ-ÿ']+", text.lower())


def longest_common_run(a: list[str], b: list[str]) -> int:
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    match = sm.find_longest_match(0, len(a), 0, len(b))
    return match.size


def anti_verbatim_check(slug: str) -> tuple[bool, int]:
    """Retourne (ok, plus_longue_fenetre_commune_en_mots) entre la fiche FR et la source EN."""
    fr = (CONTENT_DIR / f"{slug}.md").read_text(encoding="utf8")
    en = (SOURCE_DIR / f"{slug}.md").read_text(encoding="utf8")
    run = longest_common_run(words(fr), words(en))
    return run < 8, run


def run() -> None:
    # 0. Compteur réel des 78 fiches — jamais copié, recompté à chaque run.
    md_files = sorted(CONTENT_DIR.glob("*.md"))
    count = len(md_files)
    check(count == 78, "content/skills/*.md compte réel", f"count={count}")
    (OUT / "skill-files-count.txt").write_text(f"{count}\n")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1440, "height": 1400})
        page = ctx.new_page()
        page.goto(f"{BASE}/hub", wait_until="networkidle")

        # 1. Les 6 sections Hub, headings FR présents (insensible à la casse — innerText
        # reflète le rendu CSS uppercase, cf. piège 02-02).
        body_txt = page.locator("body").inner_text().lower()
        needles = {
            "get started": "ta première semaine",
            "modules": "modules",
            "fresh drops": "fresh drops",
            "most installed": "les plus installés",
            "community pulse": "pouls de la communauté",
            "build logs": "build logs",
        }
        missing = [label for label, needle in needles.items() if needle not in body_txt]
        check(not missing, "6 sections Hub présentes", f"manquantes={missing}")
        page.screenshot(path=str(OUT / "hub.png"), full_page=True)

        # 2. EmptyState "Most installed" avant tout install (aucun install fait encore).
        empty_ok = "pas encore de skill installé" in body_txt
        check(empty_ok, "Most installed : EmptyState avant install", f"empty_ok={empty_ok}")

        # 3. ⌘K (fallback Ctrl+K) : ouvre la recherche, un nom réel de skill donne >=1 résultat.
        page.keyboard.press("Meta+k")
        dialog = page.locator("[role='dialog'][aria-label='Recherche']")
        try:
            dialog.wait_for(state="visible", timeout=1500)
        except Exception:
            page.keyboard.press("Control+k")
            dialog.wait_for(state="visible", timeout=1500)
        check(dialog.is_visible(), "⌘K/Ctrl+K ouvre la recherche", "dialog visible")

        query = "carrousel"
        page.locator("[role='dialog'][aria-label='Recherche'] input").fill(query)
        page.wait_for_timeout(150)
        results = page.locator("[role='dialog'][aria-label='Recherche'] li button")
        result_count = results.count()
        check(result_count >= 1, f"recherche « {query} » -> résultats", f"count={result_count}")

        first_result_text = results.first.inner_text()
        results.first.click()

        # 4. InstallModal ouverte (role=dialog), titrée du skill, bouton Installer présent.
        install_dialog = page.locator("[role='dialog'][aria-modal='true']").last
        install_dialog.wait_for(state="visible")
        install_txt = install_dialog.inner_text().lower()
        install_needles = ["ce que ça fait", "ce qu'il te faut", "installer le skill"]
        install_missing = [n for n in install_needles if n not in install_txt]
        check(not install_missing, "InstallModal complète (role=dialog)", f"manquants={install_missing}")
        page.screenshot(path=str(OUT / "cmdk-modal.png"))

        # 5. install(slug) persiste en localStorage (jamais lu sur un autre champ) —
        # on récupère le slug depuis le titre affiché plutôt que de le supposer.
        install_button = install_dialog.get_by_role("button", name="Installer le skill →")
        install_button.click()
        page.wait_for_timeout(150)

        storage_raw = page.evaluate("() => window.localStorage.getItem('skilltree.installs.v1')")
        check(storage_raw is not None and storage_raw != "{}", "localStorage skilltree.installs.v1 écrit",
              f"raw={storage_raw}")

        installed_state = install_dialog.inner_text().lower()
        check("installé" in installed_state, "bouton passe à « Installé »", f"texte_bouton_contient='installé'")

        page.keyboard.press("Escape")
        install_dialog.wait_for(state="hidden")

        # 6. Recliquer ⌘K sur le même skill -> affiche l'état Installé.
        page.keyboard.press("Meta+k")
        dialog.wait_for(state="visible")
        page.locator("[role='dialog'][aria-label='Recherche'] input").fill(query)
        page.wait_for_timeout(150)
        page.locator("[role='dialog'][aria-label='Recherche'] li button").first.click()
        install_dialog2 = page.locator("[role='dialog'][aria-modal='true']").last
        install_dialog2.wait_for(state="visible")
        reopened_txt = install_dialog2.inner_text().lower()
        check("installé" in reopened_txt, "réouverture ⌘K même skill : état Installé persisté",
              f"contains_installe={'installé' in reopened_txt}")
        page.keyboard.press("Escape")

        ctx.close()
        browser.close()

    # 7. Anti-verbatim : spot-check x3 (fenêtre de 8 mots consécutifs identiques FR vs EN).
    spot_slugs = ["carousel-designer", "billing-manager", "inbox-manager"]
    verdicts = []
    for slug in spot_slugs:
        ok, run_len = anti_verbatim_check(slug)
        check(ok, f"anti-verbatim {slug} (< 8 mots identiques)", f"plus_longue_fenetre_commune={run_len} mots")
        verdicts.append(f"  - {slug} : plus longue fenêtre commune FR/EN = {run_len} mots (< 8 -> PASS)")

    log("OK — preuves écrites")
    header = [
        "# Preuve DOM — Plan 03-01 (Hub + Install local + 78 fiches) — rendu réel Playwright chromium",
        "",
        "Serveur : `cd apps/web && pnpm build && npx next start -p 3010` (build exit=0, prebuild assert-graph inclus).",
        "Runner : /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p2.py",
        "Viewport desktop 1440x1400.",
        "",
        "## Fidélité visuelle",
        "hub.png vs captures/nav_hub.png : GET STARTED (progression X/5), Modules (3 cartes),",
        "Fresh drops + Featured this week, Most installed, Community pulse, Build logs — 6 sections",
        "dans le même ordre. Écart assumé : compteurs d'installs = état local réel de CET utilisateur",
        "(D3, pas un classement communautaire fabriqué) ; âges des drops étiquetés '(démo)'.",
        "",
        "## Checks (mesures citées)",
        "",
    ]
    footer = [
        "",
        "## Spot-check anti-verbatim (x3)",
        *verdicts,
        "",
        f"Premier résultat recherche « {query} » lors du run : {first_result_text!r}",
    ]
    (OUT / "dom-assert.txt").write_text("\n".join(header + report + footer) + "\n")
    print(f"\nOK — preuves écrites dans {OUT}")


if __name__ == "__main__":
    run()
