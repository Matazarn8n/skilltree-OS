# SESSION FABLE 5 — SkillTree-OS : assimilation → architecture → intégration → PLAN

Tu es l'architecte de reconstruction de **SkillTree-OS** (`~/projects/skilltree-OS`), version perso FR d'un SaaS tiers (**Altari**, altari.ai/skilltree) auquel l'utilisateur est abonné. Objectif : reconstruction fidèle en structure + contenu FR réécrit (pas de copie verbatim), intégrable à terme dans l'écosystème **HERMES-OS**. La Phase 1 (capture) et 2 (agrégation) sont FAITES et vérifiées. Ta mission = produire l'architecture cible + le PLAN d'exécution que des agents Opus/Sonnet implémenteront.

## 1. Charge et assimile (lis dans l'ordre)
- `orchestration/dataset.json` — manifeste (comptes, checksums, notes de réconciliation). **Lis-le en premier.**
- `docs/02_MASTER_PLAN.md` — archi cible déjà ébauchée (data model, API, DB, cache, composants, roadmap P0-P7, risques).
- `docs/01_CARTE_COMPORTEMENTALE.md` — le produit, les modules, les routes, les concepts.
- `docs/05_ORCHESTRATION_SPEC.md` — le pipeline multi-agents.
- Data structurée : `data/tree.json` (7 secteurs→fonctions→jobs), `data/skills.json` (137 jobs : desc, skills, integrations, req, level, **stage 1-4**, ladder, human, replaces, notes, files), `data/skill_files.json` (78 skills : title/what/needs/preview), `data/dashboards.json` (6 command centers), `captures/skill_files_full/*.md` (78 fichiers skills complets).
- Captures visuelles de référence : `captures/dashboards/*_full.png`, `captures/chart/*.json`, `captures/map_zoom/*.png`, `captures/map_panel/*.png`, `captures/lessons/*`, `captures/dynamic/*`.

## 2. Mappe l'architecture globale
Produis `docs/ARCHITECTURE.md` couvrant :
- **Composants & services** : les 3 vues du hero (iframe→composant natif : MAP roue-constellation / DASHBOARDS command centers / CHART matrice rollout), Hub, Modules+leçons, Brain (8 sections), My Tree, Community, Settings, Onboarding.
- **Flux de données** : user → progression skill-tree → module Brain → persistance. Distinguer **catalogue statique** (secteurs/jobs/skills/dashboards, buildé) vs **state user** (Postgres). Ne pas mélanger.
- **API** : endpoints tree/skill/brain/onboarding/modules/progress/install (cf. master plan §3).
- **Schéma DB** : users/progress/installs/brain/tree_state/onboarding (§2b).
- **Cache** : catalogue en ISR/CDN, state user en SWR, pas de Redis prématuré.
- **Réconciliation à trancher** (cf. dataset.json) : CHART=165 jobs vs map=137 → définir la source de vérité unique (recommandation : `skills.json` 137 + jobs CHART human-led additionnels taggés). Dashboards PRNG démo → garder déterministe ou brancher vraie data.

## 3. Évalue l'intégration HERMES-OS
Section dans `ARCHITECTURE.md` : points d'ancrage (auth partagée, LLM gateway :8765, mémoire/Brain vs Cortex Obsidian existant), contraintes (multi-tenant futur), risques scaling (roue 137+ nœuds → garde-fou LOWFX/reduced-motion dès P1).

## 4. Produis le PLAN d'exécution
`docs/PLAN.md` — roadmap exécutable. Chaque phase = `{objectif, livrable, modèle+effort (GSD: opus/fable=archi, sonnet=impl, haiku=lookup), dépendances, critère de succès VÉRIFIABLE}`. Séquence : P0 scaffold Next+TS+Tailwind+sidebar+import `data/` → P1 constellation FR (hero, roue SVG, a11y, states) → P2-P5 modules en **fan-out Sonnet parallèle** (Hub, Modules/18 leçons FR, Brain, Tree/Community/Settings, + vues DASHBOARDS & CHART) → P6 backend Supabase+Stripe+LLM → P7 onboarding. Dépendances acycliques, couverture complète du périmètre.

## Contraintes
- Fidélité = structure exacte + FR réécrit. Le contenu des 137 nodes est en `data/skills.json` ; les 78 skills complets en `captures/skill_files_full/`. Réécris/traduis, ne recopie pas la prose.
- Vérif réelle anti-faux-positif à chaque phase (observer le livrable rendu, pas un build vert).
- Tranche toi-même les forks (note le tradeoff), ne multiplie pas les questions.

## Livrables attendus (fin de session)
`docs/ARCHITECTURE.md` + `docs/PLAN.md`, committés. Puis Phase 5 = exécution par agents Opus/Sonnet pilotés par `PLAN.md`.
