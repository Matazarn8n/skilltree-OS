#!/usr/bin/env python3
"""Suite de preuves Plan 03-03 (wizard Brain) — rendu réel.

Préalable serveur :
    cd apps/web && pnpm build && npx next start -p 3010 &
    (poll http://localhost:3010/brain jusqu'à 200)

Lancer :
    /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p4.py

Chaque check imprime PASS/FAIL + la valeur mesurée. Premier FAIL → exit 1 (aucune
preuve verte n'est consignée sur un échec). Tout PASS → écrit orchestration/verify/p4/
{dom-assert.txt, brain-section.png, brain-manual.png}.
"""
import os
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get("VERIFY_BASE", "http://localhost:3010")
OUT = Path(__file__).resolve().parent.parent / "orchestration" / "verify" / "p4"
OUT.mkdir(parents=True, exist_ok=True)

EXPECTED_EYEBROWS = [
    "ENTREPRISE", "OFFRE", "CLIENTS", "TON", "OPÉRATIONS", "OUTILS", "OBJECTIFS", "CONTRAINTES",
]

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


def clear_storage(page) -> None:
    page.goto(f"{BASE}/brain", wait_until="networkidle")
    page.evaluate("() => window.localStorage.removeItem('skilltree.brain.v1')")
    page.reload(wait_until="networkidle")


def eyebrow_text(page) -> str:
    return page.locator("[data-testid='brain-eyebrow']").inner_text().strip()


def step_text(page) -> str:
    return page.locator("[data-testid='brain-step']").inner_text().strip()


def badge_text(page) -> str:
    return page.locator("[data-testid='brain-source-badge']").inner_text().strip()


def type_and_continue(page, text: str) -> None:
    page.locator("textarea[aria-label]").fill(text)
    page.get_by_role("button", name="Continuer →").click()
    page.wait_for_timeout(120)


def run() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()

        # ── 0. reset propre ──────────────────────────────────────────────
        clear_storage(page)

        # ── chemin manuel complet ────────────────────────────────────────
        check(
            page.get_by_role("button", name="Je l'écris moi-même").count() == 1,
            "écran d'entrée : CTA manuel présent",
            "bouton « Je l'écris moi-même » trouvé",
        )
        check(
            page.get_by_role("button", name="Rédiger ma base avec l'IA →").count() == 1,
            "écran d'entrée : CTA IA présent",
            "bouton « Rédiger ma base avec l'IA → » trouvé",
        )
        page.screenshot(path=str(OUT / "brain-manual.png"))

        page.get_by_role("button", name="Je l'écris moi-même").click()
        page.wait_for_timeout(120)

        # 1. 8 sections : eyebrow + "X/8" de 1 à 8, en tapant un contenu à chaque écran
        #    (Continuer est désactivé tant que le champ est vide — fidèle à "Fill this in
        #    to continue" de brain_section_2.json).
        MARKER = "ZZTEST-brain-entreprise"
        seen_steps = []
        for i in range(1, 9):
            seen_steps.append(step_text(page))
            eyebrow = eyebrow_text(page)
            check(
                eyebrow == EXPECTED_EYEBROWS[i - 1],
                f"section {i}/8 : eyebrow attendu",
                f"eyebrow={eyebrow!r} attendu={EXPECTED_EYEBROWS[i - 1]!r}",
            )
            if i == 1:
                page.locator("textarea[aria-label]").fill(MARKER)
                page.screenshot(path=str(OUT / "brain-section.png"))
                page.get_by_role("button", name="Continuer →").click()
            else:
                type_and_continue(page, f"Réponse section {i} — chemin manuel.")
            page.wait_for_timeout(120)

        check(
            seen_steps == [f"{i} / 8" for i in range(1, 9)],
            "8 écrans distincts, eyebrow 1→8",
            f"séquence={seen_steps}",
        )

        # après la 8e section + Continuer → écran "done"
        check(
            page.get_by_text("Les 8 sections sont renseignées").count() == 1,
            "chemin manuel complet : écran de fin atteint",
            "texte de fin trouvé",
        )

        keys_after_manual = page.evaluate(
            "() => Object.keys(JSON.parse(localStorage.getItem('skilltree.brain.v1') || '{}')).length"
        )
        check(keys_after_manual == 8, "8 clés dans localStorage après le chemin manuel", f"keys={keys_after_manual}")

        # ── 2. save → reload persiste (section 1) ────────────────────────
        stored_before = page.evaluate(
            "() => (JSON.parse(localStorage.getItem('skilltree.brain.v1') || '{}').company || {}).content"
        )
        check(MARKER in stored_before, "marqueur présent dans localStorage avant reload", f"content={stored_before!r}")

        page.reload(wait_until="networkidle")
        # reprise : la 1re section vide n'existe plus (8/8 remplies) → écran "done".
        check(
            page.get_by_text("Les 8 sections sont renseignées").count() == 1,
            "reload : reprise sur l'écran de fin (8/8 déjà remplies)",
            "texte de fin présent après reload",
        )
        # navigue vers la section 1 via "Modifier" pour vérifier le contenu à l'écran (pas
        # seulement dans localStorage) après un reload complet de page.
        page.get_by_role("button", name="Modifier").first.click()
        page.wait_for_timeout(120)
        step1 = step_text(page)
        textarea_val = page.locator("textarea[aria-label]").input_value()
        check(step1 == "1 / 8" and MARKER in textarea_val, "reload : section 1 affiche le marqueur persistant",
              f"step={step1} textarea={textarea_val!r}")

        # ── 3. badge source « Manuel » sur le chemin manuel ──────────────
        # innerText reflète le rendu (uppercase CSS) → comparaison insensible à la casse
        badge = badge_text(page)
        check(badge.lower() == "manuel", "badge source = Manuel (chemin manuel)", f"badge={badge!r}")

        # ── 4. chemin IA : reset puis draft ───────────────────────────────
        page.evaluate("() => window.localStorage.removeItem('skilltree.brain.v1')")
        page.reload(wait_until="networkidle")
        page.locator("#brain-intake-url").fill("https://altari.ai")
        page.locator("#brain-intake-notes").fill("Accompagnement growth pour SaaS B2B, ton direct.")
        page.get_by_role("button", name="Rédiger ma base avec l'IA →").click()
        page.wait_for_timeout(150)

        step_ai = step_text(page)
        badge_ai = badge_text(page)
        textarea_ai = page.locator("textarea[aria-label]").input_value()
        check(
            step_ai == "1 / 8" and badge_ai.lower() == "ia" and len(textarea_ai.strip()) > 0,
            "chemin IA : sections pré-remplies, badge IA",
            f"step={step_ai} badge={badge_ai!r} contenu_non_vide={bool(textarea_ai.strip())}",
        )
        keys_after_ai = page.evaluate(
            "() => Object.keys(JSON.parse(localStorage.getItem('skilltree.brain.v1') || '{}')).length"
        )
        check(keys_after_ai == 8, "chemin IA : 8 clés pré-remplies dans localStorage", f"keys={keys_after_ai}")

        ctx.close()
        browser.close()


if __name__ == "__main__":
    run()
    header = [
        "# Preuve DOM — Plan 03-03 (wizard Brain) — rendu réel Playwright chromium",
        "",
        "Serveur : `cd apps/web && pnpm build && npx next start -p 3010` (build exit=0).",
        "Runner : /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p4.py",
        "Viewport desktop 1440×900.",
        "",
        "## Fidélité visuelle",
        "brain-section.png (section ENTREPRISE 1/8, chemin manuel) vs captures/dynamic/brain_section_1.png :",
        "même structure (eyebrow + X/8, question, éditeur, Retour/Continuer, footnote) — eyebrow traduit",
        "FR (COMPANY→ENTREPRISE) et question traduite (« What's your company called? » → « Comment",
        "s'appelle ton entreprise ? »), fidèle en structure, prose neuve (pas de verbatim EN).",
        "brain-manual.png (écran d'entrée) vs captures/dynamic/brain_initial.png : mêmes deux chemins",
        "(IA / manuel), mêmes champs (site + notes libres), copy FR réécrite.",
        "Sections 2 à 8 : captures/dynamic/brain_section_2..8.json sont identiques à la section 1",
        "(la capture originale est restée bloquée sur la validation « Fill this in to continue » —",
        "aucune progression réelle capturée au-delà de l'écran 1) ; labels/questions 2-8 sont donc",
        "réécrits à partir de l'enum brain_section (docs/ARCHITECTURE.md §5), pas invention libre.",
        "",
        "## Checks (mesures citées)",
        "",
    ]
    (OUT / "dom-assert.txt").write_text("\n".join(header + report) + "\n")
    print(f"\nOK — preuves écrites dans {OUT}")
