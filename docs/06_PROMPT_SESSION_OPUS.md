# Prompt — Session OPUS (Phases 1→3 : collecte → agrégation → prompt Fable 5)

Coller en nouvelle session Opus 4.8. Objectif : orchestrer les agents de collecte résiduelle, agréger en dataset unique, puis PRODUIRE le prompt de la session Fable 5. NE PAS lancer le build (ça = après le PLAN de Fable 5).

---

Tu es l'orchestrateur (Opus 4.8) du pipeline SkillTree-OS. Repo : `~/projects/skilltree-OS`. Lis d'abord `docs/05_ORCHESTRATION_SPEC.md` (le pipeline), `docs/03_HANDOFF.md`, `docs/04_PROMPT_CAPTURE_RESIDUELLE.md`, `docs/02_MASTER_PLAN.md`. Data déjà parsée : `data/*.json` (137 jobs, 78 skills, 7 secteurs). Login prouvé `tools/crawl.py` (creds `.env.md`, **jamais logger le password** ; python `~/.higgsfield-login-venv/bin/python`). Anti-faux-positif : PNG >30KB, JSON non vides, relecture, rapport honnête. Délègue à des agents **Sonnet** (navigateur = 1 session séquentielle chacun ; parse = parallèle).

## PHASE 1 — Collecte (fan-out Sonnet, cf. doc 04)
- **Agent A** : `/brain` (initial + "Draft with AI" + "type myself", 8 sections) · `/tree` (connect machine, SkillTree Audit, weekly drops) · `/community` · `/settings` (pas le password) · onboarding (`/api/onboarding` + tour 6 étapes + Cal.com). → `captures/dynamic/`.
- **Agent B** : onglets du haut de `/map`. **DASHBOARDS** = carrousel command centers, capturer chacun en grand (Meta Ads·Paid Acquisition, HubSpot·Sales Pipeline, Xero·Finance, Mission Control, Instagram+TikTok…) → `captures/dashboards/`. **CHART** = matrice, 7 onglets secteur ; chaque carte job se clique plusieurs fois → dérouler TOUS les skills du workflow → `captures/chart/<sector>.json`.
- **Agent C** (parse/hunt, sans navigateur) : chasser la source JS des dashboards ("31,587","Paid Acquisition","Cost per Lead","HubSpot") → `data/dashboards.json`. Parser stage(1-4)+level par job depuis `captures/raw/…app_map_html.txt` → merger dans `data/skills.json`.
- **Agent D** : le contenu des nodes est DÉJÀ en JSON (pas de 200 screens). Récupérer les **78 fichiers skill .md complets** (URL download via "Take it ↓", session `paid:true`) → `captures/skill_files_full/`. + réf visuelle : 7 zoom-secteurs + 2-3 panneaux node/secteur + 3 états YOUR STATUS → `captures/map_zoom/`, `captures/map_panel/`.
- **Porte G1** : chaque lot vérifié (PNG>30KB, JSON contentful). Rapport réussi/vide/échec par lot.

## PHASE 2 — Agrégation (dataset unique)
- Normaliser tous les artefacts en `data/*.json` cohérent (skills+stage+level+dashboards, skill_files_full liés aux jobs via `files[].path`).
- Écrire le manifeste `orchestration/dataset.json` : {chemins, comptes (jobs=137, skills=78, dashboards=N, secteurs=7), checksums}.
- **Porte G2** : comptes conformes, 0 référence orpheline (chaque `files[].path` a son .md complet), manifeste relu.

## PHASE 3 — Produire le prompt Fable 5 (via skill `fable5-prompting`)
- Invoquer le skill `fable5-prompting` pour construire un prompt optimisé qui charge : le dataset agrégé (`data/*.json` + `orchestration/dataset.json`), l'arbo repo, `docs/02_MASTER_PLAN.md`, `docs/01_CARTE_COMPORTEMENTALE.md`, le périmètre (reconstruction FR fidèle, structure exacte + contenu réécrit).
- Le prompt DOIT demander à Fable 5 de livrer : (a) **assimilation** intégrale projet+repo, (b) **mapping architecture globale** (composants, flux de données user→tree→brain→persistance, dépendances, 3 onglets MAP/DASHBOARDS/CHART), (c) **évaluation des modalités d'intégration** dans l'écosystème HERMES-OS, (d) **PLAN d'exécution détaillé** (phases séquencées, chaque phase = livrable + critère vérifiable + modèle/effort GSD, dépendances acycliques), exécutable par agents Opus/Sonnet.
- Écrire le résultat dans `orchestration/fable5_prompt.md`.
- **Porte G3** : le prompt référence des chemins réels existants + énonce explicitement les 4 livrables ci-dessus.

## Fin de session Opus
Committer `data/`, `docs/`, `orchestration/` (`-f` car .gitignore parent). Rapport final : état des portes G1/G2/G3, chemin du `fable5_prompt.md`, et la commande pour lancer la session Fable 5.
→ Étape suivante (hors cette session) : coller `orchestration/fable5_prompt.md` dans une session **Fable 5** = Phase 4 (PLAN + ARCHITECTURE). Puis Phase 5 = exécution Opus/Sonnet.
