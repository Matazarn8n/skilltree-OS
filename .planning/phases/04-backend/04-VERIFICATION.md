---
phase: 04-backend
verified: 2026-07-10T00:00:00Z
status: passed
score: 5/5 must-haves verified
re_verification: null
gaps: []
human_verification:
  - test: "Parcours navigateur complet signup → /hub → installer un skill → reload → toujours installé"
    expected: "Le skill reste marqué Installé après reload (déjà prouvé par verify_p6 install-persist.png + row Postgres 0→1)"
    why_human: "Rendu visuel/UX end-to-end ; serveurs torn down, non ré-exécutable ici (preuve committée fait foi)"
  - test: "Magic-link email/password login réel via UI"
    expected: "Session persiste au reload (cookie sb-*)"
    why_human: "Flux auth interactif non ré-exécutable sans démarrer les serveurs (preuve indirecte : auth.users incrémenté dans verify_p6)"
---

# Phase 4: Backend (Supabase) Verification Report

**Phase Goal:** Remplacer les stubs localStorage de Phase 3 par un vrai backend Supabase (schéma + RLS + auth + routes + draft LLM via gateway HERMES, Stripe-ready) SANS réécrire l'UI.
**Verified:** 2026-07-10
**Status:** PASSED
**Re-verification:** No — initial verification
**Method:** Lecture code + git log + grep + preuves committées (verify_p6.py 17/17, rls_isolation.mjs) + interrogation DB locale live. Aucun serveur démarré (torn down).

## Goal Achievement

### Observable Truths (5 success criteria)

| # | Critère | Statut | Evidence |
| --- | ------- | ------ | -------- |
| 1 | Schéma §5 : 6 tables + 5 enums, 0 catalogue, appliqué en DB | ✓ VERIFIED | 6 tables live via `psql \dt public.*` (brain/installs/onboarding/progress/tree_state/users) ; 5 `create type` (lesson_status/brain_section/brain_source/job_level/onboarding_path) ; grep catalogue tables = 0 |
| 2 | RLS user_id=auth.uid() sur 6 tables, RED sans RLS | ✓ VERIFIED | `pg_tables.rowsecurity=t` sur les 6 ; policies : users×3 (`id=auth.uid()`), 5 tables×1 `for all (user_id=auth.uid())` ; contre-preuve rls_isolation.txt : disable RLS installs → B voit ligne de A → ROUGE, réactivé |
| 3 | Auth Supabase (pw+magiclink, session middleware) + 3 clients | ✓ VERIFIED | server.ts (createServerClient+createServiceClient SERVER-ONLY), client.ts (createBrowserClient), middleware.ts (updateSession/getUser), login (signInWithPassword+signInWithOtp), callback (exchangeCodeForSession), signout présents |
| 4 | 7 routes user + webhook + draft gateway, 0 clé Anthropic, catalogue 0-DB | ✓ VERIFIED | 9 route.ts présents ; grep `x-api-key\|ANTHROPIC_API_KEY\|sk-ant` sur apps/web/{app,lib} = **0** ; draft = X-Internal-Token seul, 403/429/502 câblés ; catalog/my-tree/skills = 0 import supabase ; access PERSONAL_MODE force paid |
| 5 | Swap stubs sans réécriture UI, signatures gelées | ✓ VERIFIED | `git diff --name-only 5ab431d..HEAD -- components` = TreeAudit.tsx + BrainWizard.tsx UNIQUEMENT (MyTree 0 diff) ; `Brouillon à partir de`=0 ; localStorage persistence=0 ; draftBrain async ; toutes signatures présentes |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Attendu | Statut | Détails |
| -------- | ------- | ------ | ------- |
| `supabase/schema.sql` | 6 tables + 5 enums + RLS + policies | ✓ VERIFIED | 6 `create table if not exists`, 5 `create type`, 6 `enable row level security`, policies auth.uid() (users literal + boucle format pour les 5) |
| `supabase/tests/rls_isolation.mjs` | Preuve isolation + counter-proof | ✓ VERIFIED | rls-isolation.txt : 5 tables service-role=1 / B=0, counter-proof CONFIRMÉ (RESULT: PASS) |
| `apps/web/lib/supabase/{server,client}.ts` | 3 clients | ✓ VERIFIED | createServerClient/createServiceClient/createBrowserClient présents |
| `apps/web/middleware.ts` | refresh session | ✓ VERIFIED | updateSession/auth.getUser |
| `apps/web/app/auth/{login,callback,signout}` | auth FR | ✓ VERIFIED | password+magiclink, exchangeCodeForSession, signOut |
| `apps/web/app/api/**` (9 routes) | routes DB-backed + draft + webhook | ✓ VERIFIED | me/progress/install/tree/brain/brain/draft/onboarding/access/stripe/webhook |
| `apps/web/lib/{installs,progress,brain}.ts` | corps swappé /api, signatures gelées | ✓ VERIFIED | fetch /api/install (7), /api/brain (10), /api/progress|me (3) ; 0 localStorage persist |
| `tools/verify_p6.py` | preuve E2E | ✓ VERIFIED | 17/17 PASS (dom-assert.txt), preuves dans orchestration/verify/p6/ |

### Key Link Verification

| From | To | Via | Statut | Détails |
| ---- | -- | --- | ------ | ------- |
| lib/installs.ts | POST /api/install → supabase insert | fetch scopé auth.uid() | ✓ WIRED | grep /api/install = 7 |
| api/brain/draft | gateway :8765 /api/llm/complete | X-Internal-Token seul | ✓ WIRED | fetch `${HERMES_GATEWAY_URL}/api/llm/complete`, header X-Internal-Token, source skilltree-brain-draft, 0 clé Anthropic |
| lib/brain.ts draftBrain() | POST /api/brain/draft | fetch async | ✓ WIRED | `await fetch("/api/brain/draft")`, draftBrain async, gabarit supprimé |
| TreeAudit.tsx / BrainWizard.tsx | useInstalls() / draftBrain() | source unique DB / await LLM | ✓ WIRED | TreeAudit useInstalledSlugs→useInstalls().installed ; BrainWizard await draftBrain, JSX intact |

### Anti-Patterns Found

Aucun blocker. Le chemin no-fallback est correctement câblé : `/api/brain/draft` renvoie 502 explicite (gateway KO/injoignable/text absent) au lieu d'un gabarit silencieux — conforme à la règle anti-faux-positif. Le rate-limit en mémoire process est une dette documentée (upgrade multi-tenant = Redis/DB), non bloquante en perso.

### Deviation notée (non-gap)

Le PLAN 04-02 anticipait les 2 exceptions composant = TreeAudit + MyTree. La réalité livrée est TreeAudit + **BrainWizard** (MyTree = 0 diff car il consomme `useInstalledSlugs` via re-export de TreeAudit ; BrainWizard devait passer `startWithAI` async car `draftBrain` est devenu un vrai appel LLM). Déviation **auditée et documentée** dans 04-02-SUMMARY (Option A await honnête retenue vs B fire-and-forget rejetée pour éviter des sections vides silencieuses). Le diff observé (TreeAudit + BrainWizard, MyTree intact) correspond exactement au périmètre attendu. Pas un gap.

### Human Verification Required

Deux items UX end-to-end (persistance visuelle install→reload, flux auth interactif) restent des vérifications humaines idéales — déjà couvertes indirectement par les preuves committées (install-persist.png, row Postgres 0→1, auth.users incrémenté). Serveurs torn down, non ré-exécutables ici sans dépasser le plafond harness.

### Gaps Summary

Aucun gap. Les 5 critères de succès sont satisfaits contre le code réel :
- Schéma §5 fidèle appliqué en DB live (6 tables, 5 enums, 0 catalogue).
- RLS actif + prouvé RED-sans-RLS (counter-proof exécutée).
- Auth complète (3 clients + login pw/magiclink + callback + middleware session).
- 9 routes câblées ; draft LLM via gateway X-Internal-Token SEUL, 0 clé Anthropic app-wide, gating 403/429/502 ; catalogue 0-DB ; access PERSONAL_MODE force paid ; webhook Stripe stub 501.
- Swap sans réécriture UI : signatures gelées, diff composant limité à TreeAudit+BrainWizard (MyTree intact), draftBrain async, 0 gabarit résiduel, 0 localStorage persist.

Preuves : orchestration/verify/p6/{install-persist.png, dom-assert.txt (16 PASS), draft-proof.txt, access.txt, rls-isolation.txt} + verify_p6.py 17/17. Commits ad1a6f7, acce328, b66ff3b confirmés.

---

_Verified: 2026-07-10_
_Verifier: Claude (gsd-verifier)_
