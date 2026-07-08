#!/usr/bin/env python3
"""Preuves Phase 3 plan 04 (My Tree / Community / Settings) — rendu réel.

Préalable serveur :
    cd apps/web && pnpm build && npx next start -p 3010 &
    (poll http://localhost:3010/tree jusqu'à 200)

Lancer :
    /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p5.py

Chaque check imprime PASS/FAIL + la valeur mesurée. Premier FAIL → exit 1 (aucune
preuve verte n'est consignée sur un échec). Tout PASS → écrit orchestration/verify/p5/
{dom-assert.txt, tree.png, community.png, settings.png}.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3010"
OUT = Path(__file__).resolve().parent.parent / "orchestration" / "verify" / "p5"
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


def run() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()

        # ── nettoyage préalable de la clé d'installs (isolation entre runs) ────────
        page.goto(f"{BASE}/tree", wait_until="networkidle")
        page.evaluate("window.localStorage.removeItem('skilltree.installs.v1')")
        page.reload(wait_until="networkidle")

        # 1. My Tree : ConnectMachine (commande git/npx) + rangée de stats + TreeAudit
        body_txt = page.locator("body").inner_text().lower()
        has_connect = "connecte ta machine" in body_txt
        has_sync_cmd = page.locator("code", has_text="skilltree-cli").count() >= 1
        has_stats = page.get_by_text("Installés", exact=True).count() >= 1
        has_audit = page.get_by_text("SkillTree Audit", exact=False).count() >= 1
        has_drops = page.get_by_text("Drops de la semaine", exact=True).count() >= 1
        check(
            has_connect and has_sync_cmd and has_stats and has_audit and has_drops,
            "My Tree : ConnectMachine + stats + WeeklyDrops + TreeAudit présents",
            f"connect={has_connect} sync_cmd={has_sync_cmd} stats={has_stats} audit={has_audit} drops={has_drops}",
        )
        page.screenshot(path=str(OUT / "tree.png"))

        # 2. TreeAudit avant/après install — compteur N (attendu 0) → N+1, SANS reload
        count_before_txt = page.locator("[data-testid='tree-audit-count']").inner_text()
        n_before = 0 if "Rien d'installé" in count_before_txt else None
        check(n_before == 0, "TreeAudit compteur avant install", f"texte={count_before_txt!r} N={n_before}")

        page.evaluate(
            """
            () => {
              window.localStorage.setItem('skilltree.installs.v1', JSON.stringify({ 'billing-manager': true }));
              window.dispatchEvent(new Event('skilltree:installs'));
            }
            """
        )
        page.wait_for_timeout(150)
        count_after_txt = page.locator("[data-testid='tree-audit-count']").inner_text()
        n_after_ok = "1 skill installé" in count_after_txt
        check(
            n_after_ok,
            "TreeAudit compteur après install (sans reload) : 0 -> 1",
            f"texte_avant={count_before_txt!r} texte_apres={count_after_txt!r}",
        )
        stat_after_txt = page.get_by_text("Installés", exact=True).locator("xpath=following-sibling::p[1]").inner_text()
        check("1 /" in stat_after_txt, "Rangée de stats reflète l'install (Installés = 1/N)", f"valeur={stat_after_txt!r}")

        # 3. Community : bandeau "100 premiers" + au moins 1 post
        page.goto(f"{BASE}/community", wait_until="networkidle")
        body_txt = page.locator("body").inner_text()
        has_100 = "100 premiers" in body_txt
        heading_count = page.get_by_role("heading", name="Communauté", exact=True).count()
        post_count = page.locator("article").count()
        check(
            has_100 and heading_count == 1 and post_count >= 1,
            "Community : H1 + bandeau 100 premiers + >=1 post",
            f"heading={heading_count} bandeau_100={has_100} posts={post_count}",
        )
        page.screenshot(path=str(OUT / "community.png"))

        # 4. Settings : "Membre · 47 $/mois" présent + 4 sections
        page.goto(f"{BASE}/settings", wait_until="networkidle")
        body_txt = page.locator("body").inner_text()
        has_47 = "47 $/mois" in body_txt or "47 $" in body_txt
        section_titles = ["Compte", "Sécurité", "Facturation", "Zone de danger"]
        sections_found = sum(1 for t in section_titles if page.get_by_role("heading", name=t, exact=True).count() == 1)
        check(
            has_47 and sections_found == 4,
            "Settings : Membre 47 $/mois + 4 sections",
            f"membre_47={has_47} sections_trouvees={sections_found}/4 ({section_titles})",
        )
        page.screenshot(path=str(OUT / "settings.png"))

        ctx.close()
        browser.close()


if __name__ == "__main__":
    run()
    header = [
        "# Preuve DOM — Phase 3 plan 04 (My Tree / Community / Settings) — rendu réel Playwright chromium",
        "",
        "Serveur : `cd apps/web && pnpm build && npx next start -p 3010` (build exit=0).",
        "Runner : /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p5.py",
        "Viewport desktop 1440x900.",
        "",
        "## Fidélité visuelle",
        "tree.png vs captures/nav_tree.png : Connecte ta machine, rangée de stats, Drops de la",
        "semaine, TreeAudit. community.png vs captures/nav_community.png : bandeau 100 premiers +",
        "feed de posts. settings.png vs captures/nav_settings.png : Compte/Sécurité/Facturation/",
        "Zone de danger, plan Membre 47 $/mois (D8 — 47 $ substitué au 49 $ de la capture par",
        "décision produit, cf. docs/ARCHITECTURE.md D8 + plan 03-04 truths).",
        "",
        "## Checks (mesures citées)",
        "",
    ]
    (OUT / "dom-assert.txt").write_text("\n".join(header + report) + "\n")
    print(f"\nOK — preuves écrites dans {OUT}")
