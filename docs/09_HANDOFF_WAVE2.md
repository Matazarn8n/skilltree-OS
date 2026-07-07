# HANDOFF — Phase 2 wave 2 → Phase 3 (session suivante)

> **Modèle cible : Fable 5 ou Opus 4.8, effort `high`** (composant le plus risqué : JobPanel + a11y clavier + LOWFX ; sous-tâches mécaniques → sonnet-4-6). · cwd OBLIGATOIRE : `/home/nuveo/projects/skilltree-OS` · repo git standalone, remote `origin = git@github.com:Matazarn8n/skilltree-OS.git` (push autorisé sur `main`). · Rédigé 2026-07-08 en clôture de session Fable (Phase 2 wave 1 livrée + poussée).
>
> ⚠️ NE JAMAIS toucher `/home/nuveo/.planning` — c'est un AUTRE projet (hermes-os). Tous les `.planning/` ci-dessous sont sous `/home/nuveo/projects/skilltree-OS`.

## État — ce qui est FAIT et prouvé

| Quoi | Preuve |
|---|---|
| **Phase 1 COMPLETE + VERIFIED 7/7** | catalogue `apps/web/lib/catalog/{catalog.json,types.ts}` (137 jobs/7 secteurs/34 fonctions), `node tools/assert-graph.mjs` PASS |
| **Phase 2 plans créés + révisés (checker PASS)** | `.planning/phases/02-hero-constellation/{02-01,02-02}-PLAN.md` ; 1 blocker + 2 warnings du checker corrigés (commit `8bd410d`) |
| **Phase 2 wave 1 (02-01) COMPLETE — roue-constellation** | 5 commits (`7a2de88`→`530e32d`), poussés `origin/main` @ `530e32d`. Preuves réelles : 137 `data-node` en SSR curl ET DOM Playwright (0 aria-label vide), 7 hex secteur exacts, aller-retour secteur (22 sales→137), `?view=dashboards/chart` URL directe 200+placeholder FR. `orchestration/verify/p1/{wheel-smoke.txt,wheel.png}`, SUMMARY Self-Check PASSED. `[test-geometry] PASS nodes=137 sectors=7 branches=34 minDist=52.74` |

Progress : 2/11 plans (wave 1 de Phase 2 faite ; **wave 2 = 02-02 reste à exécuter**).

## Ce que wave 1 a livré (à connaître pour wave 2)

- `lib/constellation/geometry.ts` : `computeWheelLayout(sectors, jobs)` + `computeSectorLayout(sectors, jobs, slug)`, **trigo pure paramétrée** (données en args, PAS d'import du barrel catalog — Node strip-types ne le résout pas). `W_STEP=360/7`, PRNG `mulberry32(20260611)`, `R_SECTOR_MAX=1000`, labels secteur à `R_MAX+45`.
- `lib/constellation/useLowFx.ts` : hook `<700px | prefers-reduced-motion` → marqueur `data-lowfx` (déjà posé, observable).
- `components/constellation/` : `ConstellationWheel`, `SectorView`, `JobNode` (137 `<button>` focusables aria-label sur calque HTML % — PAS des `<g>` SVG), `HubCore`, `ViewSwitcher`.
- `components/map/MapView.tsx` : réécrit, expose `view` + `initialSkill` + `onSelectJob`. **Contient un SkillPanel PROVISOIRE = le seul point à remplacer par le vrai JobPanel en 02-02.**
- Supprimés : `SkillMap.tsx`, `StageGrid.tsx`, `lib/map-layout.ts` (grep imports = 0). Deep-link `?skill=` préservé via `skillBySlug`.
- Fix latent : `SectorSlug` `backoffice`→`back-office` (zod 500 sur `/api/catalog`) — aligné partout.

## Ta mission (dans l'ordre)

1. **Revue wave 1** (avant d'exécuter wave 2) : ouvrir `orchestration/verify/p1/wheel.png` et le comparer à `captures/01_after_login.png` + `captures/map_zoom/*.png` (7 fans, hub central, hex secteur). Lire `wheel-smoke.txt`. Si finding bloquant fidélité → corriger AVANT wave 2 (commit atomique). Sinon noter OK et continuer.
2. **Exécuter wave 2** : `/gsd:execute-phase 2` (reprend automatiquement au premier plan sans SUMMARY = 02-02). 02-02 = `JobPanel.tsx` complet FR (eyebrow niveau, breadcrumb, carte fichier skill CTA, SE DÉCOMPOSE EN, S'APPUIE SUR cliquable, CE QUE ÇA REMPLACE, L'ÉCHELLE 3 niveaux, L'HUMAIN, focus-return) + a11y clavier durcie + gardes reduced-motion/`data-lowfx` + suite Playwright `tools/verify_p1.py` → `orchestration/verify/p1/`. Checks épinglés à respecter : panel `icp-definition` (eyebrow « Pleinement autonome » + carte « 1 fichier skill exécutable »/« Récupère-le ↓ »), BUILDS ON cliquable via `market-mapping`→clic chip→titre « ICP Definition », null-guard via `sop-generation` (human=null, pas de « undefined »), contraste AA calculé ≥4.5:1.
3. **Revue wave 2 + vérif phase** : le `gsd-verifier` tourne en fin d'`execute-phase` et écrit `02-VERIFICATION.md`. Lire son statut. Si `gaps_found` → `/gsd:plan-phase 2 --gaps` puis `/gsd:execute-phase 2 --gaps-only`. Si `passed`/`human_needed` → valider les 4 success criteria sur rendu réel (screenshots comparés aux captures), puis push `origin main`.
4. **Planifier Phase 3** : `/gsd:plan-phase 3`. Phase 3 = 5 plans **fan-out Sonnet parallèle** (Hub / Modules / Brain / Tree+Community+Settings / Dashboards+Chart), aucune dépendance croisée. Inclut le batch réécriture FR des 78 fiches skills (source `captures/skill_files_full/*.md`, **JAMAIS verbatim**). Revue par toi (tier fort) avant intégration.
5. **Écrire un handoff** auto-suffisant pour la session d'après (exécution Phase 3), format identique à ce fichier (`docs/10_HANDOFF_PHASE3.md` + prompt prêt à coller).

## Règles dures (non négociables)

- **Anti-faux-positif** : aucune phase « done » sur build vert seul. Preuves = sorties citées, DOM asserts (Playwright), screenshots dans `orchestration/verify/pN/`. Le verifier GSD re-exécute indépendamment. Jamais `|| true`, jamais de fallback silencieux. Vérifier la sortie réelle (piège serveur stale sur :3010 + build tronqué SIGPIPE — voir wheel-smoke.txt).
- **Verbatim interdit** : structure fidèle, prose FR réécrite (produit tiers sous abonnement).
- **Layout radial = trigo pure**, pas de lib de graphe. **LOWFX <700px + reduced-motion** obligatoires.
- **Ids jobs = slugs anglais stables (D9)** ; FR = affichage seulement. Contenu jobs (desc/ladder/human) = source EN telle quelle ; seul le chrome UI est FR.
- D1-D9 verrouillées — lire `docs/ARCHITECTURE.md` avant tout arbitrage.
- Commits atomiques, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` (adapter la signature au modèle). Push `origin main` après chaque phase verte.

## Pièges connus

- **Serveur de preuve** : `pnpm build` PUIS `npx next start -p 3010` (jamais `pnpm start -- -p`, args ignorés). Toujours vérifier le pid qui tient :3010 (`ss -ltnp`) — un `next start` stale sert l'ancien build (137 data-node=0 = faux négatif).
- Ne JAMAIS piper `pnpm build | head/grep` : SIGPIPE tronque la génération → chunks 400, hydratation morte. Laisser le build finir (exit 0 vérifié) avant de vérifier.
- `next dev` ne lance pas `prebuild` → `catalog.json`/`types.ts` sont trackés git ; relancer `pnpm build:catalog` après tout changement de `data/*.json`.
- Playwright : venv `/home/nuveo/.higgsfield-login-venv/bin/python`, chromium en cache `ms-playwright` (vérifié en Phase 1).
- `orchestration/state.json` est untracked (tracker de phase informel) — ignorable, ne pas s'en servir comme source de vérité (STATE.md/ROADMAP.md font foi).
- Slug `back-office` avec tiret partout (le type `SectorSlug` a été corrigé en wave 1).

## Prompt prêt à coller (session suivante)

```
Tu es Fable 5 (ou Opus 4.8), effort high, exécutant du projet SkillTree-OS — reconstruction perso FR du SaaS Altari SkillTree.
cwd = /home/nuveo/projects/skilltree-OS (repo git, remote Matazarn8n/skilltree-OS). NE JAMAIS toucher /home/nuveo/.planning (autre projet).

Lis dans l'ordre : docs/09_HANDOFF_WAVE2.md (ce fichier), .planning/STATE.md, .planning/ROADMAP.md (Phase 2+3), docs/ARCHITECTURE.md (D1-D9), docs/07_VISUAL_SPEC.md, .planning/phases/02-hero-constellation/02-01-SUMMARY.md.

Phase 2 wave 1 (roue-constellation) est complete + poussée. Ta mission, dans l'ordre : (1) revue fidélité de wave 1 (wheel.png vs captures) ; (2) /gsd:execute-phase 2 → exécute wave 2 (02-02 JobPanel + a11y/LOWFX + preuves Playwright) ; (3) lire 02-VERIFICATION.md, boucler gaps si besoin, valider les 4 success criteria sur rendu réel, push origin main ; (4) /gsd:plan-phase 3 (5 plans fan-out Sonnet ∥, dont réécriture FR 78 fiches skills, jamais verbatim) ; (5) écrire docs/10_HANDOFF_PHASE3.md. Règles dures : anti-faux-positif (preuves réelles pas build vert, pièges serveur stale/SIGPIPE), verbatim interdit, D1-D9, LOWFX, slugs anglais D9. Mode YOLO : prouve chaque livrable sur rendu réel.
```
