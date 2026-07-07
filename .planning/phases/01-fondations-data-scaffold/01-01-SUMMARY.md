---
phase: 01-fondations-data-scaffold
plan: 01
subsystem: data
tags: [nextjs, typescript, catalog-generation, data-pipeline, playwright]

# Dependency graph
requires: []
provides:
  - "apps/web/lib/catalog/ — accessor unique (index.ts) + catalogue généré (catalog.json) + types générés (types.ts)"
  - "tools/assert-graph.mjs — invariants du graphe avec ligne PASS au format exact (sectors/functions/jobs/skills/chart_total/chart_human/req_unresolved/orphans)"
  - "tools/build_catalog.mjs — émet catalog.json + types.ts depuis data/*.json"
  - "orchestration/verify/p0/ — preuves de rendu réel (screenshots + DOM assert) pour /hub et /modules"
affects: [02-constellation-map, 03-skill-panel, 05-dashboards]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Source unique de vérité catalogue : data/*.json -> tools/build_catalog.mjs -> apps/web/lib/catalog/{catalog.json,types.ts} -> apps/web/lib/catalog/index.ts (accessor) -> composants"
    - "types.ts généré (bandeau ne-pas-éditer), lib/types.ts n'est qu'un ré-export -> évite la dérive de types dupliqués"
    - "prebuild hook (package.json) régénère + asserte le catalogue avant next build ; catalog.json/types.ts trackés git pour que next dev/start marchent sur un checkout frais sans prebuild"

key-files:
  created:
    - apps/web/lib/catalog/index.ts
    - apps/web/lib/catalog/types.ts (généré)
    - apps/web/lib/catalog/catalog.json (généré)
    - orchestration/verify/p0/dom-assert.txt
    - orchestration/verify/p0/hub.png
    - orchestration/verify/p0/modules.png
  modified:
    - tools/assert-graph.mjs
    - tools/build_catalog.mjs
    - apps/web/lib/types.ts
    - apps/web/lib/lessons.ts
    - apps/web/lib/db.ts
    - apps/web/lib/map-layout.ts
    - "apps/web/app/(app)/hub/page.tsx"
    - apps/web/components/skill/SkillPanel.tsx
    - apps/web/components/skill/SkillCard.tsx
    - apps/web/components/map/SkillMap.tsx
    - apps/web/components/map/StageGrid.tsx
    - apps/web/components/ui/CommandBar.tsx
    - apps/web/components/tree/MyTree.tsx

key-decisions:
  - "assert-graph PASS line reformatée aux 8 tokens exacts (jobs=/chart_total=/chart_human=) sans toucher aux invariants internes ni au exit(1)"
  - "types.ts généré par build_catalog.mjs (bandeau ne-pas-éditer) ; lib/types.ts devient un simple `export * from './catalog/types'`"
  - "lib/catalog/index.ts = déplacement verbatim de l'ancien lib/data.ts (mêmes exports/comportement), lib/data.ts supprimé"
  - "header /hub dé-hardcodé : SKILL_FILES.length (78) remplace le littéral '13 skills en ligne'"

patterns-established:
  - "Anti-faux-positif : preuve de rendu réel (curl DOM assert + screenshots Playwright) au lieu de se fier à exit 0 de pnpm build"

# Metrics
duration: ~25min
completed: 2026-07-08
---

# Phase 1 Plan 1: Fondations data + scaffold Summary

**Catalogue consolidé (137 jobs / 78 skills / 165 chart jobs) généré par tools/build_catalog.mjs vers apps/web/lib/catalog/{catalog.json,types.ts}, accédé via un accessor unique lib/catalog/index.ts, avec lib/data.ts supprimé et les 10 sites de consommation rebranchés, preuvé par build vert + DOM assert + screenshots Playwright réels.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-07-07T22:15Z (approx, avant premiers reads)
- **Completed:** 2026-07-07T22:31Z
- **Tasks:** 3/3 complétées
- **Files modified:** 12 modifiés + 6 créés (dont 3 preuves) + 1 supprimé + 5 fichiers de substrat pré-existant intégrés

## Accomplishments
- `node tools/assert-graph.mjs` imprime exactement la ligne d'invariant requise et échoue (exit 1) réellement sur violation testée (régression skills=79 -> exit=1, restaurée)
- `tools/build_catalog.mjs` émet désormais `apps/web/lib/catalog/types.ts` en plus de `catalog.json`, tous deux trackés git
- `apps/web/lib/catalog/index.ts` = accesseur unique du catalogue ; `apps/web/lib/data.ts` supprimé ; 10/10 imports rebranchés ; `pnpm typecheck` vert
- `pnpm build` vert (prebuild -> build:catalog -> next build) ; `/hub` et `/modules` rendent depuis le catalogue (78 skills, modules réels, 0 slug inventé), `/map` rend un job réel du catalogue ("Market Mapping") ; preuves écrites dans `orchestration/verify/p0/` (dom-assert.txt + 2 screenshots non vides)

## Task Commits

Chaque tâche a été committée atomiquement (+ 1 commit préparatoire pour du substrat pré-existant non committé trouvé en début de session) :

0. **Substrat pré-existant (hors périmètre des 3 tâches)** — `c8ab0d6` (chore) — couleurs secteur D9, contracts.ts sync, hook `prebuild`, retrait d3-force/d3-scale
1. **Task 1: Réaligner assert-graph + émettre types.ts** — `394bd47` (feat)
2. **Task 2: Accesseur lib/catalog + rebranchement 10 imports + suppression lib/data.ts** — `6d9e3bf` (feat)
3. **Task 3: Build vert + DOM assert + screenshots** — `256f869` (test)

_Note : `git rm apps/web/lib/data.ts` avait été exécuté avant le split des commits Task 1/Task 2 et s'est donc retrouvé dans le commit substrat (`c8ab0d6`) plutôt que dans le commit Task 2 — documenté ici pour traçabilité, la suppression est réelle et vérifiée absente à la fin de Task 2._

## Files Created/Modified
- `tools/assert-graph.mjs` - ligne PASS reformattée aux 8 tokens exacts requis
- `tools/build_catalog.mjs` - émet désormais aussi `apps/web/lib/catalog/types.ts`
- `apps/web/lib/catalog/index.ts` - accesseur catalogue unique (nouveau)
- `apps/web/lib/catalog/types.ts` - types domaine générés (nouveau, tracké git)
- `apps/web/lib/catalog/catalog.json` - catalogue consolidé généré (tracké git)
- `apps/web/lib/types.ts` - devient `export * from "./catalog/types"`
- `apps/web/lib/lessons.ts`, `apps/web/lib/db.ts`, `apps/web/lib/map-layout.ts` - import rebranché vers `./catalog`
- `apps/web/app/(app)/hub/page.tsx` - import rebranché + header dé-hardcodé (`SKILL_FILES.length`)
- `apps/web/components/skill/{SkillPanel,SkillCard}.tsx`, `apps/web/components/map/{SkillMap,StageGrid}.tsx`, `apps/web/components/ui/CommandBar.tsx`, `apps/web/components/tree/MyTree.tsx` - import rebranché vers `@/lib/catalog`
- `orchestration/verify/p0/dom-assert.txt` - assertions DOM réelles avec sorties citées
- `orchestration/verify/p0/hub.png` (91.7K), `orchestration/verify/p0/modules.png` (72.2K) - screenshots Playwright réels

## Decisions Made
- Reformater uniquement la ligne de résumé finale d'assert-graph.mjs (tokens `jobs=`/`chart_total=`/`chart_human=`), garder tous les `check()` et l'exit(1) intacts — zéro régression sur les invariants existants.
- types.ts est un artefact généré (pas maintenu à la main) pour éliminer la dérive entre catalog.json et les types TS qui le décrivent.
- lib/catalog/index.ts reprend lib/data.ts verbatim (même comportement) plutôt que de réécrire la logique — DATA-03 satisfait sans changement de contrat pour les composants.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Substrat pré-existant non committé, requis pour que le plan compile**
- **Found during:** Avant Task 1 (état constaté `git status` en début de session)
- **Issue:** Le working tree contenait déjà des modifications non committées (couleurs sector D9 dans `globals.css`, `contracts.ts` synchronisé au schéma job/skill, hook `prebuild` dans `package.json`, retrait des deps `d3-force`/`d3-scale`/`@types/d3-force`) — substrat mentionné par le PLAN comme "déjà fait" (commit `845ae82` cité dans STATE.md, absent du log git de ce dépôt) mais jamais réellement committé ici.
- **Fix:** Committé tel quel dans un commit préparatoire dédié (`c8ab0d6`), séparé des 3 tâches du plan, avec message explicite documentant l'origine.
- **Files modified:** apps/web/app/globals.css, apps/web/lib/contracts.ts, apps/web/package.json, apps/web/pnpm-lock.yaml, apps/web/tsconfig.tsbuildinfo (+ apps/web/lib/data.ts supprimé, car déjà staged par un `git rm -f` antérieur au split des commits)
- **Verification:** `pnpm typecheck` et `pnpm build` verts après ce commit et après les 3 tâches suivantes.
- **Committed in:** `c8ab0d6`

---

**Total deviations:** 1 auto-fixé (Rule 3 - substrat bloquant pré-existant, committé pour rendre le dépôt cohérent)
**Impact on plan:** Aucune dérive de scope — le contenu de ce substrat était déjà implicitement requis et décrit par le PLAN comme fait ; il a simplement fallu le committer. Les 3 tâches du plan ont été exécutées telles qu'écrites, sans modification de leur périmètre.

## Issues Encountered
- Démarrage du serveur `pnpm start -- -p 3010` a échoué (`Invalid project directory ... -p`, le passthrough d'arguments pnpm ne fonctionne pas comme attendu ici) — contourné avec `npx next start -p 3010` directement. Sans impact sur les preuves (serveur démarré, poll curl confirmé UP en 1s).
- `78 skills en ligne` n'apparaît pas comme chaîne contiguë dans le HTML brut (React sépare `{SKILL_FILES.length}` du texte par un commentaire d'hydratation `<!-- -->`) — l'assertion a été adaptée en `grep -oE "78[^0-9]{0,20}skills en ligne"` (match confirmé) plutôt que déclarée fausse sur un grep littéral naïf ; documenté dans `dom-assert.txt`.
- Observation hors périmètre (non corrigée, non demandée par le plan) : `apps/web/components/ui/Sidebar.tsx` contient un badge nav `"Hub" badge: "13"` toujours hardcodé — distinct du header `/hub` (seul hardcode ciblé par ce plan). Signalé pour une phase future si pertinent.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Fondation catalogue verrouillée et prouvée sur rendu réel : Phase 2 (roue-constellation) peut consommer `@/lib/catalog` directement (SECTORS, SKILLS, CHART_JOBS, requires résolus) sans dépendre du prototype.
- `apps/web/lib/catalog/catalog.json` régénère un `meta.builtAt` à chaque `pnpm build` (diff non-sémantique attendu, pas un problème) — normal, le fichier reste tracké git avec un contenu figé au dernier commit et se régénère au prochain build.
- Aucun blocker identifié pour la Phase 2.

---
*Phase: 01-fondations-data-scaffold*
*Completed: 2026-07-08*

## Self-Check: PASSED

All created files verified present (apps/web/lib/catalog/{index.ts,types.ts,catalog.json}, orchestration/verify/p0/{dom-assert.txt,hub.png,modules.png}) and all 4 commit hashes (c8ab0d6, 394bd47, 6d9e3bf, 256f869) verified present in `git log --oneline --all`.
