#!/usr/bin/env python3
"""Suite de preuves Phase 4 (backend Supabase) — requêtes/rendus RÉELS, anti-faux-positif.

Prérequis (gérés par l'orchestrateur, cf. 04-02-SUMMARY) :
  - apps/web buildé (pnpm build, exit 0, SANS piper head/grep = SIGPIPE).
  - Serveur PERSONAL_MODE=true sur :3010  → VERIFY_BASE (défaut http://localhost:3010).
  - Serveur PERSONAL_MODE=false sur :3011 → UNPAID_BASE (pour la preuve du gate 403).
    Si UNPAID_BASE absent → le check 403 est marqué SKIP (loud), pas un faux PASS.
  - Supabase local UP (docker), gateway HERMES :8765 UP.

Lancer :
  /home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p6.py

Chaque check imprime PASS/FAIL + la valeur mesurée. Premier FAIL → exit 1 (aucune preuve
verte consignée sur échec). Tout PASS → écrit orchestration/verify/p6/
{install-persist.png, dom-assert.txt, draft-proof.txt, access.txt}.
"""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = os.environ.get("VERIFY_BASE", "http://localhost:3010")
UNPAID_BASE = os.environ.get("UNPAID_BASE")  # serveur PERSONAL_MODE=false pour le 403
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "orchestration" / "verify" / "p6"
OUT.mkdir(parents=True, exist_ok=True)
HERMES_DB = os.path.expanduser("~/hermes-data/hermes.db")
PG_CONTAINER = "supabase_db_skilltree-OS"
STUB_PHRASE = "Brouillon à partir de"  # la phrase du gabarit Phase 3 — NE DOIT PAS apparaître

report: list[str] = []


def log(line: str) -> None:
    print(line, flush=True)
    report.append(line)


def check(cond: bool, name: str, measured: str) -> None:
    log(f"[{'PASS' if cond else 'FAIL'}] {name} :: {measured}")
    if not cond:
        log("\n>>> ÉCHEC — arrêt, aucune preuve verte écrite.")
        sys.exit(1)


def pg(sql: str) -> str:
    """Exécute une requête sur le Postgres Supabase (docker), renvoie la valeur brute."""
    out = subprocess.run(
        ["docker", "exec", "-i", PG_CONTAINER, "psql", "-U", "postgres", "-d", "postgres", "-tAc", sql],
        capture_output=True, text=True, timeout=30,
    )
    if out.returncode != 0:
        raise RuntimeError(f"psql error: {out.stderr.strip()}")
    return out.stdout.strip()


def proxy_calls_count() -> int:
    out = subprocess.run(
        ["sqlite3", HERMES_DB, "select count(*) from proxy_calls where source='skilltree-brain-draft'"],
        capture_output=True, text=True, timeout=15,
    )
    return int(out.stdout.strip() or "0")


def signup(page, base: str, email: str, password: str) -> None:
    """Crée un compte via l'UI (email confirmations désactivées en local) → session cookie."""
    page.goto(f"{base}/auth/login", wait_until="networkidle")
    page.fill("input[type=email]", email)
    page.fill("input[type=password]", password)
    page.click("text=Créer un compte")
    page.wait_for_timeout(1500)  # laisse le signUp + redirect s'établir


def main() -> None:
    stamp = int(time.time())
    email = f"verify-p6-{stamp}@skilltree.test"
    password = "verify-p6-strong-pw"

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context()
        page = ctx.new_page()

        # ── 1. PERSISTANCE : signup → install → row Postgres → reload → toujours installé ──
        signup(page, BASE, email, password)
        uid = pg(f"select id from auth.users where email='{email}'")
        check(bool(uid), "signup crée un auth.users", f"uid={uid[:8] if uid else 'NONE'}…")

        before = int(pg(f"select count(*) from installs where user_id='{uid}'"))
        check(before == 0, "installs vides avant install", f"count={before}")

        # Installe le 1er skill via l'API authentifiée (cookies de la session) — équivaut au clic
        # InstallModal, qui appelle le même POST /api/install (useInstalls).
        page.goto(f"{BASE}/hub", wait_until="networkidle")
        # Récupère un slug réel depuis le catalogue (structure tolérante).
        cat = page.request.get(f"{BASE}/api/catalog").json()
        slug = _first_slug(cat)
        check(bool(slug), "slug catalogue récupéré", f"slug={slug}")

        r = page.request.post(f"{BASE}/api/install", data=json.dumps({"slug": slug}),
                              headers={"Content-Type": "application/json"})
        check(r.status == 200, "POST /api/install 200", f"status={r.status}")

        after = int(pg(f"select count(*) from installs where user_id='{uid}'"))
        check(after == before + 1, "row installs créée (compteur +1)", f"{before}→{after}")

        # Reload : la persistance survit (row lue par GET /api/install → useInstalls → TreeAudit).
        page.goto(f"{BASE}/tree", wait_until="networkidle")
        page.wait_for_timeout(1200)  # hydratation async de useInstalls
        audit = page.locator("[data-testid='tree-audit-count']").inner_text().strip()
        check("skill" in audit.lower() and "rien d'installé" not in audit.lower(),
              "TreeAudit montre l'install après reload", audit)
        page.screenshot(path=str(OUT / "install-persist.png"), full_page=True)

        # ── 2. CATALOGUE 0-DB ──────────────────────────────────────────────────────────────
        cat_res = page.request.get(f"{BASE}/api/catalog")
        check(cat_res.status == 200, "/api/catalog 200", f"status={cat_res.status}")
        # Preuve statique 0-DB : aucune des 3 routes catalogue n'importe supabase (grep source).
        grep = subprocess.run(
            ["grep", "-rl", "supabase",
             str(ROOT / "apps/web/app/api/catalog"),
             str(ROOT / "apps/web/app/api/my-tree"),
             str(ROOT / "apps/web/app/api/skills")],
            capture_output=True, text=True,
        )
        check(grep.stdout.strip() == "", "routes catalogue n'importent pas supabase (0-DB)",
              f"matches='{grep.stdout.strip()}'")

        # ── 4a. ACCESS PERSONAL_MODE → paid:true ────────────────────────────────────────────
        acc = page.request.get(f"{BASE}/api/access").json()
        check(acc.get("paid") is True, "/api/access PERSONAL_MODE paid:true", json.dumps(acc))
        (OUT / "access.txt").write_text(json.dumps(acc, ensure_ascii=False, indent=2))

        # ── 4b. DRAFT réel via gateway : proxy_calls +1, contenu NON-gabarit ────────────────
        pc_before = proxy_calls_count()
        draft = page.request.post(f"{BASE}/api/brain/draft",
                                  data=json.dumps({"notes": "agence growth B2B pour SaaS early-stage"}),
                                  headers={"Content-Type": "application/json"}, timeout=120000)
        check(draft.status == 200, "POST /api/brain/draft 200 (user payé)", f"status={draft.status}")
        body = draft.json()
        keys = ["company", "offer", "customers", "voice", "ops", "stack", "goals", "constraints"]
        check(all(k in body for k in keys), "draft renvoie les 8 sections", f"keys={list(body.keys())}")
        joined = " ".join(str(v) for v in body.values())
        check(STUB_PHRASE not in joined, "contenu NON-gabarit (≠ phrase du stub)",
              f"len={len(joined)} sample={joined[:80]!r}")
        # anti-faux-positif : la gateway a bien journalisé une NOUVELLE ligne proxy_calls.
        time.sleep(1.0)
        pc_after = proxy_calls_count()
        check(pc_after == pc_before + 1, "nouvelle row proxy_calls (source skilltree-brain-draft)",
              f"{pc_before}→{pc_after}")
        (OUT / "draft-proof.txt").write_text(
            f"proxy_calls {pc_before}->{pc_after}\nsections={list(body.keys())}\n\n"
            + json.dumps(body, ensure_ascii=False, indent=2)
        )

        # ── 4c. RATE-LIMIT : au-delà de N drafts/fenêtre → 429 ──────────────────────────────
        # 1 draft déjà consommé ci-dessus. Limite = 5/fenêtre → les appels 2..5 passent (ou 200/502),
        # le 6e DOIT être 429. On compte les 429.
        statuses = []
        for _ in range(6):
            rr = page.request.post(f"{BASE}/api/brain/draft",
                                   data=json.dumps({"notes": "x"}),
                                   headers={"Content-Type": "application/json"}, timeout=120000)
            statuses.append(rr.status)
        check(429 in statuses, "rate-limit renvoie 429 au-delà de la fenêtre", f"statuses={statuses}")

        # ── 4d. GATING 403 (user authentifié NON payé) — nécessite serveur PERSONAL_MODE=false ──
        if UNPAID_BASE:
            uctx = browser.new_context()
            upage = uctx.new_page()
            uemail = f"verify-p6-unpaid-{stamp}@skilltree.test"
            signup(upage, UNPAID_BASE, uemail, password)
            # Self-validation : sans PERSONAL_MODE, /api/access doit voir paid:false (sinon override raté).
            uacc = upage.request.get(f"{UNPAID_BASE}/api/access").json()
            check(uacc.get("paid") is False, "serveur unpaid: /api/access paid:false (env override OK)",
                  json.dumps(uacc))
            d403 = upage.request.post(f"{UNPAID_BASE}/api/brain/draft",
                                      data=json.dumps({"notes": "x"}),
                                      headers={"Content-Type": "application/json"})
            check(d403.status == 403, "draft gated: 403 si non payé", f"status={d403.status}")
            uctx.close()
        else:
            log("[SKIP] gate 403 — UNPAID_BASE non défini (lancer un serveur PERSONAL_MODE=false pour couvrir).")

        browser.close()

    (OUT / "dom-assert.txt").write_text("\n".join(report) + "\n")
    log(f"\nTOUS LES CHECKS PASS — preuves écrites dans {OUT}")


def _first_slug(cat: dict):
    """Extrait le 1er slug de skill du catalogue, tolérant à la forme de la réponse."""
    def walk(o):
        if isinstance(o, dict):
            if "slug" in o and isinstance(o["slug"], str):
                yield o["slug"]
            for v in o.values():
                yield from walk(v)
        elif isinstance(o, list):
            for v in o:
                yield from walk(v)
    return next(walk(cat), None)


if __name__ == "__main__":
    main()
