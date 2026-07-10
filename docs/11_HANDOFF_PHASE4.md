# HANDOFF — Phase 4 (Backend Supabase) → exécution séquencée

> **Modèle ORCHESTRATEUR : Opus 4.8, effort `high`.** Phase 4 remplace les stubs localStorage de Phase 3 (`install`/`progress`/`draftBrain`) par un vrai backend Supabase (schéma + RLS + auth + routes + LLM draft gateway + Stripe-ready) **sans réécrire l'UI**. 2 plans SÉQUENCÉS (pas fan-out) : wave 1 = 04-01 (schéma/RLS/auth, `opus-4-8`/`high`, IRRÉVERSIBLE), wave 2 = 04-02 (routes + swap stubs, `sonnet-4-6`/`medium`). · cwd OBLIGATOIRE : `/home/nuveo/projects/skilltree-OS` · repo git standalone, remote `origin = git@github.com:Matazarn8n/skilltree-OS.git` (push autorisé sur `main`). · Rédigé 2026-07-09 en clôture de session Opus (Phase 3 exécutée, Phase 4 planifiée + vérifiée).
>
> ⚠️ NE JAMAIS toucher `/home/nuveo/.planning` — AUTRE projet (hermes-os). Tous les `.planning/` ci-dessous sont sous `/home/nuveo/projects/skilltree-OS`.

## État — ce qui est FAIT

| Quoi | Preuve |
|---|---|
| **Phase 1 COMPLETE + VERIFIED** | catalogue `apps/web/lib/catalog/{catalog.json,types.ts}` (137 jobs/7 secteurs/34 fonctions), `assert-graph` PASS. Poussée `origin/main`. |
| **Phase 2 COMPLETE + VERIFIED 4/4** | roue-constellation + JobPanel + ViewSwitcher `?view=`. `verify_p1.py` 15/15. Poussée `origin/main`. |
| **Phase 3 EXÉCUTÉE (5/5 plans)** | Hub/Modules/Brain/Tree-Community-Settings/Dashboards-Chart. Preuves `orchestration/verify/p{2,3,4,5,51}/`. `verify_p{2,3,4,5,51}.py` tous PASS. Commits jusqu'à `5bb1c3e`. **⚠️ 21 commits ahead of `origin/main`, PAS ENCORE POUSSÉS** (l'utilisateur a déclaré Phase 3 vérifiée en session — la revue fidélité tier-fort + `gsd-verifier` + `03-VERIFICATION.md` n'ont PAS été produits ; à assumer ou combler avant gel v1 Phase 6). |
| **Phase 4 PLANIFIÉE + VÉRIFIÉE** | 2 plans `.planning/phases/04-backend/04-0{1,2}-PLAN.md`. `gsd-plan-checker` = **VERIFICATION PASSED** (9/9 checks ciblés + dimensions standard, 0 overlap `files_modified`, RLS-fail-test encodé, gateway OAuth-relais, catalogue 0-DB). Commit `e81d009`. |

## ⚠️ Dette ouverte avant de commencer Phase 4

1. **Push Phase 3** : `git push origin main` (21 commits en attente). L'utilisateur a court-circuité la revue fidélité + `gsd-verifier` de Phase 3 (« phase 3 verified already »). Décision assumée : pas de `03-VERIFICATION.md`. Si un doute fidélité surgit en Phase 6 (gel v1), c'est là qu'on rattrape (revue écran-par-écran vs `captures/`).
2. **Artefacts non-trackés** : `apps/web/lib/catalog/catalog.json` + `apps/web/tsconfig.tsbuildinfo` apparaissent modifiés (régénérés par `prebuild`), `orchestration/state.json` + `tools/__pycache__/` untracked — bruit de build, ignorable (ou committer catalog.json s'il diverge réellement des données sources).

## Les 2 plans (séquencés wave 1 → wave 2)

| Plan | Modèle/Effort | Construit | Preuve clé |
|---|---|---|---|
| **04-01** Schéma + RLS + Auth | `opus-4-8`/`high` (irréversible, R13 sécurité) | `supabase/schema.sql` = EXACTEMENT les 6 tables `users/progress/installs/brain/tree_state/onboarding` + 5 enums (ARCHITECTURE §5, aucune table du prototype obsolète), RLS `user_id = auth.uid()` sur les 6 tables, Supabase Auth (email/pw + magic link), clients `lib/supabase/{server,client}.ts` + `middleware.ts` + pages `app/auth/*` | **`supabase/tests/rls_isolation.mjs`** : users A/B réels, B authentifié SELECT → 0 ligne de A, service-role voit la ligne de A (contrôle positif anti-table-vide). **Vire au ROUGE si RLS retiré** (contre-preuve `alter table … disable row level security` exigée dans le SUMMARY). Preuve `orchestration/verify/p6/rls-isolation.txt` |
| **04-02** Routes + draft + swap stubs | `sonnet-4-6`/`medium` (wiring standard) | 7 routes user `/api/{me,progress,install,tree,brain,onboarding,access}` + `/api/brain/draft` (gateway :8765) + `/api/access` PERSONAL_MODE + `/api/stripe/webhook` stub 501 ; **swap des CORPS** de `lib/{installs,progress,brain}.ts` vers `fetch /api` (signatures gelées) ; re-couplage TreeAudit/MyTree sur `useInstalls()` | **`tools/verify_p6.py`** : signup → install → reload → toujours installé (row Postgres) ; `git diff --name-only apps/web/components` = SEULEMENT `tree/{TreeAudit,MyTree}.tsx` (0 réécriture UI) ; draft = **nouvelle row `proxy_calls`** dans `~/hermes-data/hermes.db` (source `skilltree-brain-draft`) + contenu non-gabarit ; 403 unpaid, 429 rate-limit, 502 si gateway KO (jamais de fallback template) ; catalogue 200 avec DB down (0-DB) ; `grep x-api-key|ANTHROPIC_API_KEY|sk-ant` = 0. Preuves `orchestration/verify/p6/{install-persist.png,dom-assert.txt,draft-proof.txt,access.txt}` |

**Contrat gateway :8765 (probé sur le vivant par le planner)** : `POST :8765/api/llm/complete`, header `X-Internal-Token: $HERMES_INTERNAL_TOKEN` (⚠️ **PAS** `Authorization: Bearer`, **PAS** `x-api-key`, **PAS** `ANTHROPIC_API_KEY` dans l'app — la gateway détient l'OAuth), body `{prompt, model, max_tokens, source}`. Cf. `~/.claude/CLAUDE.md` « Anthropic Auth » + memory `nuveo-n8n-credential-wiring-trap` (le piège header a déjà mordu côté n8n : creds « attachés » mais faux car mauvais header).

## ⚡ ADDENDUM 2026-07-09 — env chaud + 04-01 cœur FAIT + piège d'exécution

**04-01 cœur sécurité DONE + PROUVÉ + POUSSÉ** (commit `ad1a6f7`, sur `origin/main`) :
- `supabase/schema.sql` = §5 (6 tables/5 enums/RLS/policies `auth.uid()`/trigger `handle_new_user`/grants authenticated+service_role), appliqué au Supabase local.
- `supabase/tests/rls_isolation.mjs` (sans dépendance, HTTP GoTrue+PostgREST) → **PASS + counter-proof** : B authentifié voit 0 ligne de A sur les 5 tables, service-role voit les lignes de A (contrôle positif anti-table-vide), RLS retiré sur installs → B voit la ligne de A (test virerait ROUGE) → réactivé. Preuve `orchestration/verify/p6/rls-isolation.txt`. `node supabase/tests/rls_isolation.mjs` exit 0.
- `supabase/config.toml` : `[analytics] enabled=false` (vector échoue sur docker.sock de cet hôte — LAISSER off).

**⚠️ Piège d'exécution majeur : les subagents `gsd-executor` meurent à un plafond ~600s dans ce harness** (3 spawns opus morts à ~607-615s/2 tool_uses, « user interrupted » = timeout, PAS un vrai interrupt). Plan 04-01/04-02 > 10min wall-clock → **exécuter INLINE** (orchestrateur Bash, sans plafond) ou en session fraîche. Ne PAS re-déléguer à un `gsd-executor`.

**RESTE 04-01** (inline) : deps `@supabase/ssr @supabase/supabase-js` (apps/web/package.json), `lib/supabase/{server,client}.ts`, `middleware.ts` (refresh session), `app/auth/{login/page.tsx,callback/route.ts,signout/route.ts}`, `.env.example`, `pnpm build` vert. **RESTE 04-02** entier (7 routes + `/api/brain/draft` gateway `:8765` via `X-Internal-Token` seul + `/api/access` PERSONAL_MODE + swap corps des 3 stubs signatures gelées + `tools/verify_p6.py`).

**Env DÉJÀ chaud (ne pas refaire)** : Supabase local UP (10 conteneurs), DB `127.0.0.1:54322` OPEN, CLI cachée. `apps/web/.env.local` écrit (vraies clés JWT, `PERSONAL_MODE=true`, chmod 600, **gitignoré**). Appliquer le schéma = `docker exec -i supabase_db_skilltree-OS psql -U postgres -d postgres < supabase/schema.sql` (pas de psql sur l'hôte). `supabase status -o json` redonne les clés.

## Setup utilisateur requis (04-01, avant exécution wave 1)

Supabase **LOCAL** (docker), zéro compte externe :
```bash
cd /home/nuveo/projects/skilltree-OS
npx supabase start        # sort API URL + anon key + service_role key
# écrire dans apps/web/.env.local :
#   SUPABASE_URL=http://127.0.0.1:54321
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
#   SUPABASE_SERVICE_ROLE_KEY=<service_role>   # SERVER-ONLY, jamais exposé client
#   PERSONAL_MODE=true                          # force paid=true (D8)
```
Un projet Supabase hébergé n'est nécessaire qu'au déploiement (hors périmètre P4). Docker déjà présent sur le GEEKOM (28.2.2).

## Ta mission (dans l'ordre)

1. **Pousser Phase 3** si pas déjà fait : `git push origin main`.
2. **`npx supabase start`** + remplir `apps/web/.env.local` (ci-dessus).
3. **`/gsd:execute-phase 04-backend`** — wave 1 (04-01 `opus-4-8`/`high`) PUIS wave 2 (04-02 `sonnet-4-6`/`medium`). Séquentiel : 04-02 dépend du schéma/auth/clients de 04-01. Chaque plan commit atomiquement + écrit son `*-SUMMARY.md` + preuves dans `orchestration/verify/p6/`.
4. **Surveillance 04-01 (sécurité, tier fort)** : la contre-preuve RLS est le cœur. Vérifier de tes yeux que `rls_isolation.mjs` vire au ROUGE quand on désactive RLS — un PASS sur schéma sans RLS = fuite de données silencieuse. Ne pas verdir sur « exit 0 » seul.
5. **Surveillance 04-02** : (a) `git diff apps/web/components` doit rester à `tree/{TreeAudit,MyTree}.tsx` — toute autre modif = réécriture UI interdite ; (b) le draft doit produire une VRAIE row `proxy_calls` (pas un 200 nu ni un template) ; (c) `grep` anti-secret = 0. Note plan-checker : 04-02 Task 1 = 7 routes CRUD fines, surveiller le budget contexte de l'exécuteur (reprendre, jamais tronquer).
6. **Vérif phase** : `gsd-verifier` en fin d'`execute-phase` → `04-VERIFICATION.md`. `gaps_found` → `/gsd:plan-phase 4 --gaps` puis `/gsd:execute-phase 4 --gaps-only`. `passed` → valider les 4 success criteria sur rendu/requête réels puis **push `origin main`**.
7. **Planifier Phase 5** (Onboarding, `sonnet-4-6`/`medium`) : `/gsd:plan-phase 5`, puis `docs/12_HANDOFF_PHASE5.md`.

## Règles dures (non négociables)

- **Sécurité EN PREMIER (R13)** : RLS sur les 6 tables, testée par une requête qui DOIT échouer (user B ≠ user A). Le service-role est SERVER-ONLY, jamais dans le bundle client.
- **Anti-faux-positif** : aucune route « done » sur 200 seul. Preuves = row Postgres réelle (compteur avant/après), row `proxy_calls` réelle pour le draft, contre-preuve RLS rouge. Jamais `|| true`, jamais `except: return stub`, jamais de fallback template silencieux sur échec LLM (→ 502 explicite).
- **Auth Anthropic** : la gateway :8765 détient l'OAuth. L'app envoie `X-Internal-Token` UNIQUEMENT. Zéro `ANTHROPIC_API_KEY`/`x-api-key`/`sk-ant` dans le code (grep de preuve = 0).
- **Swap sans réécriture UI** : seuls les CORPS des hooks/fonctions changent (localStorage → fetch). Signatures gelées : `install/uninstall/isInstalled/useInstalls`, `useProgress`, `useBrain/draftBrain/loadBrainMap/firstUnfilledIndex/BRAIN_SECTIONS/BRAIN_SECTION_KEYS`. `git diff` composants = preuve.
- **Catalogue 0-DB** : `/api/{catalog,my-tree,skills}` n'importent aucun client Supabase ; répondent 200 avec DB down.
- **D5/D7/D8 verrouillées** — lire `docs/ARCHITECTURE.md` (§5 schéma, §6 API, §8 HERMES) avant tout arbitrage. D8 : `PERSONAL_MODE=true` force `paid`, webhook Stripe = stub non-exercé.
- **Fan-out execution** : Phase 3 a prouvé que des exécuteurs parallèles clobbent `apps/web/.next` + l'index git partagé. Ici les 2 plans sont SÉQUENTIELS → risque faible ; si jamais concurrents, isolation `worktree`.
- Commits atomiques, trailer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

## Pièges connus (report des phases précédentes)

- **Serveur de preuve** : `cd apps/web && pnpm build` (exit 0 vérifié, JAMAIS piper `| head/grep` → SIGPIPE tronque → hydratation morte) PUIS `npx next start -p 3010`. Vérifier le PID sur `ss -ltnp` (serveur stale = faux négatif). Le vrai titre process = `next-server` (pas `next start`) → tuer par PID exact, pas par `pkill -f "next start"`.
- **Playwright** : venv `/home/nuveo/.higgsfield-login-venv/bin/python`, chromium en cache `ms-playwright`, API sync. `innerText` = texte rendu (uppercase CSS inclus) → comparer en `.lower()`.
- **`next dev` ne lance pas `prebuild`** → relancer `pnpm build:catalog` après tout changement `data/*.json`.
- **Nommage des preuves** : `orchestration/verify/p6/` pour Phase 4 (suit les P-stages de `docs/PLAN.md`, P6 = backend — PAS le numéro de phase ; `p4` est déjà pris par Phase 3 Brain).

## Prompt prêt à coller (session suivante)

```
Tu es Opus 4.8, effort high, ORCHESTRATEUR du projet SkillTree-OS — reconstruction perso FR du SaaS Altari SkillTree.
cwd = /home/nuveo/projects/skilltree-OS (repo git, remote Matazarn8n/skilltree-OS). NE JAMAIS toucher /home/nuveo/.planning (autre projet).

Lis dans l'ordre : docs/11_HANDOFF_PHASE4.md (ce fichier), .planning/STATE.md, .planning/ROADMAP.md (Phase 4+5), docs/ARCHITECTURE.md (§5 schéma, §6 API, §8 HERMES, D5/D7/D8), les 2 plans .planning/phases/04-backend/04-0{1,2}-PLAN.md.

Phase 3 exécutée (à pousser si pas fait) ; Phase 4 planifiée + vérifiée (plan-checker PASSED 9/9, commit e81d009). Mission, dans l'ordre : (1) git push origin main (Phase 3, 21 commits) ; (2) npx supabase start + remplir apps/web/.env.local (SUPABASE_URL, anon, service_role SERVER-ONLY, PERSONAL_MODE=true) ; (3) /gsd:execute-phase 04-backend — wave 1 (04-01 schéma/RLS/auth, opus-4-8/high, IRRÉVERSIBLE) PUIS wave 2 (04-02 routes/draft/swap-stubs, sonnet-4-6/medium) ; (4) surveiller de tes yeux : la contre-preuve RLS vire au ROUGE sans RLS (sinon fuite données), le draft produit une VRAIE row proxy_calls (pas 200 nu ni template), git diff apps/web/components = seulement tree/{TreeAudit,MyTree}.tsx, grep x-api-key|ANTHROPIC_API_KEY|sk-ant=0 ; (5) lire 04-VERIFICATION.md, boucler gaps si besoin, valider les 4 success criteria sur requête/rendu réels, push origin main ; (6) /gsd:plan-phase 5 puis docs/12_HANDOFF_PHASE5.md. Règles dures : R13 sécurité-first (RLS testée par requête qui DOIT échouer), anti-faux-positif (row réelle jamais 200 seul), gateway :8765 via X-Internal-Token UNIQUEMENT (zéro clé Anthropic dans l'app), swap sans réécriture UI (signatures gelées), catalogue 0-DB, D5/D7/D8. Mode YOLO : prouve chaque route sur requête réelle.
```
