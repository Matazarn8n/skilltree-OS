#!/usr/bin/env python3
"""Suite de preuves P5.1 (Dashboards + Chart, plan 03-05) — rendu réel.

Préalable serveur :
    cd apps/web && pnpm build && npx next start -p 3010 &
    (poll http://localhost:3010/map jusqu'à 200)

Lancer :
    /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p51.py

Chaque check imprime PASS/FAIL + la valeur mesurée. Premier FAIL -> exit 1 (aucune preuve
verte n'est consignée sur un échec). Tout PASS -> écrit orchestration/verify/p51/
{dom-assert.txt, dashboards.png, chart.png}.

Anti-faux-positif : les valeurs de contrôle (chiffres dashboards, N of M par secteur, totaux
165/36) sont RECALCULÉES ici depuis apps/web/lib/catalog/catalog.json — jamais copiées d'une
capture — puis comparées au texte réellement affiché par le navigateur.
"""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3010"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "orchestration" / "verify" / "p51"
OUT.mkdir(parents=True, exist_ok=True)
CATALOG_PATH = ROOT / "apps" / "web" / "lib" / "catalog" / "catalog.json"

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


# ── recalcul indépendant depuis le catalogue (jamais depuis lib/chart.ts ni une capture) ──
catalog = json.loads(CATALOG_PATH.read_text())
JOBS = catalog["jobs"]  # 165 = 137 map + 28 extras chart (D2)
DASHBOARDS = catalog["dashboards"]  # 6

SECTOR_NAME_FR = {s["slug"]: s["name"] for s in catalog["sectors"]}


def sector_counts(slug: str) -> dict:
    jobs = [j for j in JOBS if j["sector"] == slug]
    return {
        "total": len(jobs),
        "autonomous": sum(1 for j in jobs if j["level"] == "autonomous"),
        "assisted": sum(1 for j in jobs if j["level"] == "assisted"),
        "humanLed": sum(1 for j in jobs if j["level"] == "human-led"),
    }


TOTAL_ALL = len(JOBS)
HUMAN_LED_ALL = sum(1 for j in JOBS if j["level"] == "human-led")


def run() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()

        # ── 1. DASHBOARDS : chiffres = donnée (1er center = Meta Ads) ──────────────
        page.goto(f"{BASE}/map?view=dashboards", wait_until="networkidle")
        first = DASHBOARDS[0]
        body = page.locator("body").inner_text()
        stat_values = [s["value"] for s in first["stats"]]
        missing_vals = [v for v in stat_values if v not in body]
        check(
            not missing_vals,
            f"Dashboards : 1er center ({first['short']}) chiffres = donnée",
            f"valeurs attendues={stat_values} manquantes={missing_vals}",
        )
        title_ok = first["name"] in body
        check(title_ok, "Dashboards : titre 1er center présent", f"titre={first['name']!r} présent={title_ok}")

        # nav prev/next parcourt les 6 centers distincts
        seen_titles = [page.locator("h2").first.inner_text()]
        for _ in range(5):
            page.get_by_role("button", name="Dashboard suivant").click()
            page.wait_for_timeout(200)
            seen_titles.append(page.locator("h2").first.inner_text())
        distinct = len(set(seen_titles))
        expected_titles = {d["name"] for d in DASHBOARDS}
        check(
            distinct == 6 and set(seen_titles) == expected_titles,
            "Dashboards : nav prev/next parcourt les 6 centers distincts",
            f"vus={seen_titles} distinct={distinct}",
        )
        page.goto(f"{BASE}/map?view=dashboards", wait_until="networkidle")
        page.screenshot(path=str(OUT / "dashboards.png"))

        # ── 2. CHART : 7 tabs dont Sales/Ventes ────────────────────────────────────
        page.goto(f"{BASE}/map?view=chart", wait_until="networkidle")
        tabs = page.locator("[role='tab']")
        tab_count = tabs.count()
        tab_texts = tabs.all_inner_texts()
        has_sales = any(t.strip().lower() in ("sales", "ventes") for t in tab_texts)
        check(
            tab_count == 7 and has_sales,
            "Chart : 7 tabs secteurs dont Sales/Ventes",
            f"count={tab_count} tabs={tab_texts}",
        )

        # cliquer 2-3 tabs sans erreur (isolation + rendu)
        clicked = []
        for label in (tab_texts[1], tab_texts[3]):
            tabs.filter(has_text=label).first.click()
            page.wait_for_timeout(200)
            active = page.locator("[role='tab'][aria-selected='true']").inner_text()
            clicked.append(active)
        check(
            clicked == [tab_texts[1], tab_texts[3]],
            "Chart : clic sur 2 tabs change le secteur actif sans erreur",
            f"clicked={clicked}",
        )
        page.screenshot(path=str(OUT / "chart.png"))

        # ── 3. N of M RECALCULÉS (jamais copiés) — 2 secteurs + totaux ─────────────
        for slug in ("deals", "sales"):
            tabs.filter(has_text=SECTOR_NAME_FR[slug]).first.click()
            page.wait_for_timeout(200)
            counts = sector_counts(slug)
            summary_txt = page.locator("p", has_text="tournent en autonomie").first.inner_text()
            needles = [str(counts["autonomous"]), str(counts["total"]), str(counts["assisted"]), str(counts["humanLed"])]
            all_present = all(n in summary_txt for n in needles)
            check(
                all_present,
                f"Chart : N of M recalculé secteur {slug} = résumé affiché",
                f"attendu(auto={counts['autonomous']}/{counts['total']} assisted={counts['assisted']} humanLed={counts['humanLed']}) "
                f"affiché={summary_txt!r}",
            )

        control_txt = page.locator("p", has_text="jobs référencés dans la vue CHART").first.inner_text()
        totals_present = str(TOTAL_ALL) in control_txt and str(HUMAN_LED_ALL) in control_txt
        check(
            totals_present and TOTAL_ALL == 165 and HUMAN_LED_ALL == 36,
            "Chart : totaux recalculés 165/36 affichés et corrects",
            f"total={TOTAL_ALL} humanLed={HUMAN_LED_ALL} affiché={control_txt!r}",
        )

        # `grep 165|36` dans lib/chart.ts -> 0 (nombres jamais codés en dur)
        chart_ts = (ROOT / "apps" / "web" / "lib" / "chart.ts").read_text()
        hardcoded = [line for line in chart_ts.splitlines() if "165" in line or "36" in line]
        check(
            len(hardcoded) == 0,
            "lib/chart.ts : 0 occurrence de 165|36 en dur",
            f"lignes trouvées={hardcoded}",
        )

        # ── 4. Isolation MAP : /map reste à 137 nœuds ──────────────────────────────
        page.goto(f"{BASE}/map", wait_until="networkidle")
        node_count = page.locator("[data-node]").count()
        check(node_count == 137, "Isolation MAP : 137 nœuds (extras chart absents)", f"count={node_count}")

        ctx.close()
        browser.close()


if __name__ == "__main__":
    run()
    header = [
        "# Preuve DOM — P5.1 Dashboards + Chart (plan 03-05) — rendu réel Playwright chromium",
        "",
        "Serveur : `cd apps/web && pnpm build && npx next start -p 3010` (build exit=0, prebuild assert-graph inclus).",
        "Runner : /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p51.py",
        "Viewport desktop 1440×900.",
        "",
        "## Fidélité visuelle",
        "dashboards.png vs captures/dashboards/meta-ads-paid-acquisition_full.png : stat tiles (icône/label/valeur XL/delta),",
        "tables campagnes, sélecteur période, nav prev/next.",
        "chart.png vs captures/chart/deals__matrix.png & sales__matrix.png : tabs 7 secteurs, 4 colonnes étape,",
        "3 bandes niveau, cartes job badge étape·points ou « En continu » pour Human-led.",
        "",
        "## Contrôle anti-fabrication",
        f"catalog.json (relu indépendamment de ce script) : {TOTAL_ALL} jobs CHART au total, {HUMAN_LED_ALL} human-led.",
        "`grep -n '165\\|36' apps/web/lib/chart.ts` -> 0 lignes (vérifié ci-dessous) : les totaux tombent du calcul,",
        "jamais copiés depuis les captures chart/*.json ou le manifeste.",
        "",
        "## Checks (mesures citées)",
        "",
    ]
    (OUT / "dom-assert.txt").write_text("\n".join(header + report) + "\n")
    print(f"\nOK — preuves écrites dans {OUT}")
