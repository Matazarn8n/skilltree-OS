# 04-02 SUMMARY — Routes + draft gateway + swap stubs (BACK-02)

**Statut : DONE + PROUVÉ** (commit `b66ff3b`). `tools/verify_p6.py` = **17/17 PASS** sur requêtes/rendus réels.

## Livré
- **7 routes user** DB-backed, scopées `auth.uid()` (RLS) : `/api/me` (profil + agrégats, upsert users filet), `/api/progress` (GET done[]/POST upsert), `/api/install` (GET/POST/DELETE, `{installed:[]}`), `/api/tree` (GET/POST upsert), `/api/onboarding` (GET/POST, endpoint prêt, UI Phase 5), `/api/access` (`{paid}`, PERSONAL_MODE force paid). `/api/stripe/webhook` stub 501 sans `STRIPE_WEBHOOK_SECRET` (aucune dep `stripe`).
- **`/api/brain`** GET (8 sections) / PUT (upsert par section). **`/api/brain/draft`** = SEUL point LLM : `POST http://localhost:8765/api/llm/complete`, header `X-Internal-Token` SEUL (zéro clé Anthropic), body `{prompt,model:"balanced",max_tokens:1200,source:"skilltree-brain-draft"}`. Gated paid (403), rate-limit **par user en mémoire process** (Map, 5 drafts/10 min → 429), **502 explicite sans fallback** si gateway KO.
- **Swap corps** `lib/{installs,progress,brain}.ts` localStorage → `fetch /api`, **signatures gelées**. Fonctions pures sync (`install/uninstall/isInstalled`) conservées via **cache module** hydraté par le hook + mutation fire-and-forget (la persistance réelle = row Postgres). `draftBrain` passe async (`Promise<Record>`).

## Re-couplages composants (diff = exactement 2 fichiers)
- `components/tree/TreeAudit.tsx` : `useInstalledSlugs()` re-pointé sur `useInstalls().installed` (source unique DB). JSX intact.
- `components/brain/BrainWizard.tsx` : `startWithAI` devient async + `await draftBrain(...)` (draftBrain est maintenant un vrai appel LLM). **1 ligne, JSX intact.** — 3e re-couple nécessaire, non prévu par le plan (qui supposait le caller déjà async). Choix audité : Option A (await honnête) vs Option B (fire-and-forget sync) — B rejetée car un échec gateway laisserait des sections vides silencieusement (viole l'anti-faux-positif « panne LLM DOIT échouer »).
- `components/tree/MyTree.tsx` : **0 diff** — consomme `useInstalledSlugs` via re-export TreeAudit.

## Preuves (orchestration/verify/p6/, verify_p6.py 17/17)
- **Persistance** : signup → `/api/install` → `installs` row **0→1** (psql) → reload `/tree` → TreeAudit « 1 skill installé ». `install-persist.png`.
- **Catalogue 0-DB** : `/api/catalog` 200 + grep = 0 import supabase dans catalog/my-tree/skills.
- **Draft réel** : 200, 8 sections, contenu non-gabarit (« Agence de growth B2B spécialisée… »), **proxy_calls 0→1** (source skilltree-brain-draft, `~/hermes-data/hermes.db`). `draft-proof.txt`.
- **Rate-limit** : séquence `[502,200,200,200,429,429]` — 429 au-delà de la fenêtre (le 502 prouve incidemment le chemin no-fallback).
- **Gate 403** : serveur PERSONAL_MODE=false (:3011), user non payé, `/api/access` paid:false (self-validation env), draft → **403**. `access.txt`.
- **Sécurité** : grep app-wide `x-api-key|ANTHROPIC_API_KEY|sk-ant|Bearer.*oat` = **0**. `tsc --noEmit` clean.

## Dettes / upgrade paths documentés
- **Rate-limit en mémoire process** (Map) → non partagé entre instances. Upgrade multi-tenant = store durable (Redis/DB).
- **Reprise wizard Brain** : `loadBrainMap()` (lecture sync hors hook) tape le cache module, vide au 1er paint (DB async) → un user avec Brain existant redémarre à l'intake au lieu de reprendre. Données intactes en DB, s'affichent une fois `useBrain()` hydraté. Raffinement Phase 5 (onboarding/reprise).
- **grep localStorage** : les 4 occurrences restantes sont des **commentaires** (historique de migration) — **0 appel API `localStorage.get/setItem`** dans les libs swappées.
