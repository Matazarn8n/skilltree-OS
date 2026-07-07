# HANDOFF — Session Opus 4.8 (effort: high)

> **Modèle cible : `opus-4-8`** · cwd OBLIGATOIRE : `/home/nuveo/projects/skilltree-OS` · repo git standalone, remote `origin = git@github.com:Matazarn8n/skilltree-OS.git` (SSH, push autorisé sur `main`).
> Rédigé 2026-07-08 en clôture de session Fable 5 (assimilation → archi → GSD init → Phase 1 livrée).

## État — ce qui est FAIT et prouvé

| Quoi | Preuve |
|---|---|
| Dataset consolidé (7 secteurs, 34 fonctions, 137 jobs, 78 skills, chart 165/36 human-led, 6 dashboards) | `node tools/assert-graph.mjs` → `PASS sectors=7 functions=34 jobs=137 skills=78 chart_total=165 chart_human=36 req_unresolved=0 orphans=0` |
| Docs d'architecture tranchées | `docs/ARCHITECTURE.md` (décisions D1-D9 + §7 réconciliation), `docs/PLAN.md` (P0-P8), `docs/07_VISUAL_SPEC.md` (captures assimilées — contrat de fidélité UI) |
| GSD initialisé | `.planning/` : PROJECT.md, config.json (**YOLO, parallel, plan_check+verifier ON, research OFF, profil quality**), REQUIREMENTS.md (30 reqs), ROADMAP.md (6 phases), STATE.md |
| **Phase 1 COMPLETE + VERIFIED 7/7** | `.planning/phases/01-fondations-data-scaffold/01-VERIFICATION.md` ; catalogue généré `apps/web/lib/catalog/{catalog.json,types.ts}` (tracké) ; `lib/data.ts` supprimé, 10 imports rebranchés ; `pnpm build` vert avec prebuild assert ; screenshots `orchestration/verify/p0/` |

Progress : 1/11 plans. Prochaine phase = **Phase 2 : Hero constellation** (la tienne — opus/high).

## Ta mission (dans l'ordre)

1. **Phase 2 — Hero constellation** : `/gsd:plan-phase 2` puis `/gsd:execute-phase 2`. C'est le composant le plus risqué (géométrie roue SVG 137 nœuds, 7 fans, hub central, JobPanel, ViewSwitcher `?view=`, a11y clavier, LOWFX <700px + `prefers-reduced-motion`). Toi = planning + géométrie/archi ; délègue le mécanique à Sonnet. Fidélité visuelle : `docs/07_VISUAL_SPEC.md` §MAP + `captures/map_zoom/*.png`, `captures/map_panel/*` (variantes status), `01_after_login.png`.
2. **Phase 3 — Vues & modules UI** : 5 plans **fan-out Sonnet parallèle** (Hub / Modules / Brain / Tree+Community+Settings / Dashboards+Chart). Revue par toi avant intégration. Inclut batch réécriture FR des 78 fiches skills (source `captures/skill_files_full/*.md`, JAMAIS verbatim).
3. **Phase 4 — Backend** : toi = schéma Supabase+RLS+auth (ARCHITECTURE §5) ; Sonnet = routes + swap stubs. LLM draft via gateway HERMES `:8765` (`/api/llm/complete`, server-side, gated paid, rate-limit/user). `PERSONAL_MODE=true` force paid.
4. Phases 5 (Onboarding, sonnet) et 6 (Revue & gel `v1-perso`, tier fort).

## Règles dures (non négociables)

- **Anti-faux-positif** : aucune phase « done » sur build vert. Preuves = sorties citées, DOM asserts, screenshots dans `orchestration/verify/pN/`, rows DB. Le verifier GSD re-exécute indépendamment (config ON). Jamais `|| true`, jamais de fallback silencieux.
- **Verbatim interdit** : structure fidèle à l'identique, prose FR réécrite (produit tiers sous abonnement). 18 leçons FR existantes (`apps/web/content/lessons/`) = déjà réécrites, ne pas dégrader.
- **Deux régimes de données** : catalogue statique buildé (`lib/catalog/`, jamais de DB dessus) vs state user (Postgres, jamais de cache CDN). D1-D9 verrouillées — lire ARCHITECTURE.md avant tout arbitrage.
- **Ids jobs** = slugs anglais stables (D9) ; FR = affichage seulement.
- **GSD tiering** : opus=archi/géométrie/schéma, sonnet=impl, haiku=lookups. Handoff auto-suffisant si tu passes la main.
- Commits atomiques, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` remplacé par ta signature Opus ; push sur `origin main` après chaque phase verte.

## Pièges connus

- `data/chart.json` : `sectors.Sales.stages=[]` (trou de capture) → dériver des `stage_name` de `skills.json`, ne rien inventer. Déjà géré par `tools/build_catalog.mjs` — ne pas casser.
- Sidebar : badge `Hub: 13` encore hardcodé (`apps/web/components/ui/Sidebar.tsx`) — hors scope Phase 1, à corriger en Phase 3 (Hub).
- La roue de l'original crashait mobile Safari → LOWFX + reduced-motion dès la Phase 2, pas après.
- `pnpm start -- -p 3010` ne passe pas les args → utiliser `npx next start -p 3010`.
- `next dev` ne lance pas `prebuild` → `catalog.json`/`types.ts` sont trackés git ; relancer `pnpm build:catalog` après tout changement de `data/*.json`.

## Prompt prêt à coller (session Opus)

```
Tu es Opus 4.8 (effort high), exécutant du projet SkillTree-OS — reconstruction perso FR du SaaS Altari SkillTree.
cwd = /home/nuveo/projects/skilltree-OS (repo git, remote Matazarn8n/skilltree-OS).

Lis dans l'ordre : docs/08_HANDOFF_OPUS.md (ce fichier), .planning/STATE.md, .planning/ROADMAP.md, docs/ARCHITECTURE.md (D1-D9), docs/07_VISUAL_SPEC.md.

Phase 1 est complete + verified. Ta mission : Phase 2 (Hero constellation) via /gsd:plan-phase 2 puis /gsd:execute-phase 2, en respectant les règles dures du handoff (anti-faux-positif, verbatim interdit, D1-D9, LOWFX dès P2). Ensuite enchaîne Phase 3 (5 plans fan-out Sonnet parallèle) et Phase 4 (backend — toi sur schéma+RLS, Sonnet sur routes). Push origin main après chaque phase verte. Mode YOLO : n'attends pas de validation, prouve chaque livrable sur rendu réel.
```
