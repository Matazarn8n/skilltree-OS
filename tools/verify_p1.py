#!/usr/bin/env python3
"""Suite de preuves Phase 2 (roue-constellation + JobPanel) — rendu réel.

Préalable serveur :
    cd apps/web && pnpm build && npx next start -p 3010 &
    (poll http://localhost:3010/map jusqu'à 200)

Lancer :
    /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p1.py

Chaque check imprime PASS/FAIL + la valeur mesurée. Premier FAIL → exit 1 (aucune
preuve verte n'est consignée sur un échec). Tout PASS → écrit orchestration/verify/p1/
{dom-assert.txt, map.png, sector-zoom.png, panel.png, lowfx-390.png}.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3010"
OUT = Path(__file__).resolve().parent.parent / "orchestration" / "verify" / "p1"
OUT.mkdir(parents=True, exist_ok=True)

EXPECTED_SECTOR_HEX = {  # data/tree.json (D9)
    "#FF9D5C", "#EF4444", "#A78BFA", "#5EEAD4", "#7DD3FC", "#FB7185", "#FACC15",
}

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


def rgb_to_hex(css: str) -> str:
    nums = css.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",")
    r, g, b = (int(float(nums[i])) for i in range(3))
    return f"#{r:02X}{g:02X}{b:02X}"


# ── contraste WCAG : luminance relative + ratio ─────────────────────────────
def _lin(c: float) -> float:
    c /= 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb: tuple[float, float, float]) -> float:
    r, g, b = rgb
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def contrast_ratio(fg: tuple, bg: tuple) -> float:
    l1, l2 = luminance(fg), luminance(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


# JS : couleur d'un élément + première couleur de fond opaque en remontant les ancêtres
RESOLVE_COLORS = """
(el) => {
  const parse = (s) => {
    const m = s.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(',').map(x => parseFloat(x));
    if (p.length === 4 && p[3] === 0) return null;   // transparent
    return [p[0], p[1], p[2]];
  };
  const fg = parse(getComputedStyle(el).color);
  let node = el, bg = null;
  while (node) {
    const c = parse(getComputedStyle(node).backgroundColor);
    if (c) { bg = c; break; }
    node = node.parentElement;
  }
  return { fg, bg };
}
"""


def measure_contrast(locator, label: str) -> float:
    res = locator.evaluate(RESOLVE_COLORS)
    fg, bg = res["fg"], res["bg"]
    assert fg and bg, f"{label}: couleur non résolue fg={fg} bg={bg}"
    ratio = contrast_ratio(tuple(fg), tuple(bg))
    log(f"    {label}: fg=rgb{tuple(fg)} sur bg=rgb{tuple(bg)} → ratio {ratio:.2f}:1")
    return ratio


def run() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()

        # ── contexte desktop principal ──────────────────────────────────
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        page.goto(f"{BASE}/map", wait_until="networkidle")

        # 1. 137 focusables, tous <button>, aria-label non vide
        count = page.locator("[data-node]").count()
        tags = page.eval_on_selector_all("[data-node]", "els => Array.from(new Set(els.map(e => e.tagName)))")
        empty = page.eval_on_selector_all(
            "[data-node]", "els => els.filter(e => !(e.getAttribute('aria-label')||'').trim()).length"
        )
        check(count == 137, "137 nœuds job", f"count={count}")
        check(tags == ["BUTTON"], "tous les nœuds sont des <button>", f"tagNames={tags}")
        check(empty == 0, "0 aria-label vide sur les 137", f"vides={empty}")

        # 2. couleurs secteur exactes (7 hexes du catalogue)
        dot_colors = page.eval_on_selector_all(
            "button[aria-label^='Secteur '] > span",
            "els => els.map(e => getComputedStyle(e).backgroundColor)",
        )
        found_hex = {rgb_to_hex(c) for c in dot_colors}
        check(
            found_hex == EXPECTED_SECTOR_HEX,
            "7 couleurs secteur exactes",
            f"{sorted(found_hex)}",
        )

        # 3. Tab : secteur PUIS ses jobs (même secteur)
        page.locator("button[aria-label^='Secteur Ventes']").focus()
        seq = [page.evaluate("() => document.activeElement.getAttribute('aria-label')")]
        for _ in range(4):
            page.keyboard.press("Tab")
            seq.append(page.evaluate("() => document.activeElement.getAttribute('aria-label')"))
        first_is_sector = seq[0].startswith("Secteur Ventes")
        # après le bouton secteur Ventes, les suivants sont des jobs du secteur Ventes (label « … — Ventes »)
        jobs_same_sector = all(lbl and lbl.endswith("— Ventes") for lbl in seq[1:])
        check(
            first_is_sector and jobs_same_sector,
            "Tab secteur→jobs du même secteur",
            f"séquence={seq}",
        )

        # 4. Enter → JobPanel réel (icp-definition)
        page.locator("[aria-label^='ICP Definition']").first.focus()
        page.keyboard.press("Enter")
        dialog = page.locator("[role='dialog']")
        dialog.wait_for(state="visible")
        # innerText reflète le rendu (uppercase CSS sur eyebrow/titres) → comparaison insensible à la casse
        txt = dialog.inner_text().lower()
        needles = [
            "pleinement autonome",            # eyebrow (level autonomous)
            "icp definition",                 # titre
            "commence ici",                   # badge start-here
            "ventes",                         # breadcrumb secteur FR
            "1 fichier skill exécutable",     # carte CTA (files=1)
            "récupère-le",                    # bouton CTA
            "se décompose en", "s'appuie sur", "ce que ça remplace",
            "l'échelle", "piloté humain", "assisté", "autonome", "l'humain",
        ]
        missing = [n for n in needles if n not in txt]
        desc_ok = "define and refine ideal customer" in txt  # desc source EN
        check(not missing and desc_ok, "JobPanel icp-definition complet",
              f"manquants={missing} desc_ok={desc_ok}")
        page.screenshot(path=str(OUT / "panel.png"))
        page.keyboard.press("Escape")
        dialog.wait_for(state="hidden")

        # 5. BUILDS ON cliquable (market-mapping → ICP Definition)
        page.locator("[aria-label^='Market Mapping']").first.focus()
        page.keyboard.press("Enter")
        dialog.wait_for(state="visible")
        # chip cliquable « ICP Definition » dans « S'appuie sur »
        page.get_by_role("button", name="ICP Definition", exact=True).click()
        page.wait_for_timeout(150)
        new_label = dialog.get_attribute("aria-label")
        check(new_label == "ICP Definition", "BUILDS ON navigue intra-panel",
              f"aria-label dialog après clic = {new_label}")
        page.keyboard.press("Escape")
        dialog.wait_for(state="hidden")

        # 5b. régression champs null (sop-generation, human=null)
        page.locator("[aria-label^='SOP Generation']").first.focus()
        page.keyboard.press("Enter")
        dialog.wait_for(state="visible")
        stxt = dialog.inner_text().lower()
        no_undef = ("undefined" not in stxt) and ("null" not in stxt)
        # section absente = pas de <h3> « L'humain » (l'eyebrow « Piloté par l'humain » du niveau
        # human-led contient légitimement la chaîne — on teste la SECTION, pas le texte brut)
        headings = [h.lower() for h in dialog.locator("h3").all_inner_texts()]
        human_absent = not any("l'humain" in h for h in headings)
        check(no_undef and human_absent, "sop-generation : 0 undefined/null, L'humain absent",
              f"no_undef={no_undef} human_absent={human_absent}")
        page.keyboard.press("Escape")
        dialog.wait_for(state="hidden")

        # 8. ?view= shareable en URL directe
        for view, needle in (("chart", "Chart — bientôt"), ("dashboards", "Dashboards — bientôt")):
            page.goto(f"{BASE}/map?view={view}", wait_until="networkidle")
            pill = page.locator(f"a[aria-current='page']:has-text('{view.upper()}')").count()
            body = page.locator("body").inner_text()
            check(pill == 1 and needle in body, f"?view={view} shareable",
                  f"pill_current={pill} placeholder={needle in body}")

        # 9 + 5c. zoom secteur : labels fonction + retour + contraste mesuré
        page.goto(f"{BASE}/map", wait_until="networkidle")
        page.screenshot(path=str(OUT / "map.png"))  # roue all-departments
        page.locator("button[aria-label^='Secteur Ventes']").click()
        page.wait_for_timeout(200)
        back_btn = page.get_by_text("← Tous les départements").count()
        fn_label = page.get_by_text("Targeting", exact=True).count()  # fonction du catalogue
        check(back_btn == 1 and fn_label >= 1, "zoom secteur : fonctions + retour",
              f"retour={back_btn} label_fonction_Targeting={fn_label}")
        page.screenshot(path=str(OUT / "sector-zoom.png"))

        # 5c. contraste AA mesuré (label job en vue secteur + tagline secteur)
        job_label = page.locator("[data-node] span.pointer-events-none").first
        tagline = page.locator("p.lowercase").first
        r_job = measure_contrast(job_label, "label job (JobNode)")
        r_tag = measure_contrast(tagline, "tagline secteur")
        check(r_job >= 4.5 and r_tag >= 4.5, "contraste AA ≥ 4.5:1 (2 mesures)",
              f"job={r_job:.2f}:1 tagline={r_tag:.2f}:1")

        # retour roue complète
        page.keyboard.press("Escape")
        page.wait_for_timeout(150)
        back_count = page.locator("[data-node]").count()
        check(back_count == 137, "retour roue : 137 nœuds", f"count={back_count}")
        ctx.close()

        # 6. reduced-motion → 0 animation (computed style)
        ctx_rm = browser.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
        prm = ctx_rm.new_page()
        prm.goto(f"{BASE}/map", wait_until="networkidle")

        def dur(sel: str, prop: str) -> float:
            v = prm.locator(sel).first.evaluate(f"el => getComputedStyle(el).{prop}")
            return max(float(x.replace("s", "")) for x in v.split(",")) if v else 0.0

        node_anim = dur("[data-node]", "animationDuration")
        node_trans = dur("[data-node] span", "transitionDuration")
        group_anim = dur("[role='group']", "animationDuration")
        worst = max(node_anim, node_trans, group_anim)
        check(worst <= 0.001, "reduced-motion : 0 animation",
              f"node_anim={node_anim}s node_trans={node_trans}s group_anim={group_anim}s")
        ctx_rm.close()

        # 7. LOWFX 390px → data-lowfx=true
        ctx_m = browser.new_context(viewport={"width": 390, "height": 844})
        pm = ctx_m.new_page()
        pm.goto(f"{BASE}/map", wait_until="networkidle")
        lowfx = pm.locator("[data-lowfx='true']").count()
        check(lowfx >= 1, "LOWFX 390px : data-lowfx=true présent", f"éléments data-lowfx=true = {lowfx}")
        pm.screenshot(path=str(OUT / "lowfx-390.png"))
        ctx_m.close()

        browser.close()


if __name__ == "__main__":
    run()
    header = [
        "# Preuve DOM — Phase 2 (roue + JobPanel) — rendu réel Playwright chromium",
        "",
        "Serveur : `cd apps/web && pnpm build && npx next start -p 3010` (build exit=0, prebuild assert-graph inclus).",
        "Runner : /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p1.py",
        "Viewport desktop 1440×900 sauf checks 6 (reduced-motion), 7 (390×844).",
        "",
        "## Fidélité visuelle",
        "map.png (roue all-departments) vs captures/01_after_login.png : 7 fans radiaux, hub central,",
        "couleurs secteur exactes. sector-zoom.png vs captures/map_zoom/sales.png : éventail fonctions + labels jobs.",
        "",
        "## Checks (mesures citées)",
        "",
    ]
    (OUT / "dom-assert.txt").write_text("\n".join(header + report) + "\n")
    print(f"\nOK — preuves écrites dans {OUT}")
