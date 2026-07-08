---
phase: 03-vues-modules-ui
plan: 05
subsystem: ui
tags: [nextjs, react, tailwind, playwright, recompute, dashboards, chart]

requires:
  - phase: 02-hero-constellation
    provides: "roue-constellation + JobPanel + ViewSwitcher ?view= (MAP·DASHBOARDS·CHART)"
  - phase: 01-hub (Phase 1 catalogue)
    provides: "catalogue reconcilie apps/web/lib/catalog/{catalog.json,types.ts} (137 map + 28 extras chart, 6 dashboards)"
provides:
  - "CommandCenters : 6 command centers rendus depuis data/dashboards.json (seed 20260611), stat tiles + tables + nav prev/next"
  - "RolloutMatrix : matrice 7 secteurs x 4 etapes x 3 niveaux, resume N of M RECALCULE (jamais copie) via lib/chart.ts"
  - "lib/chart.ts : sectorSummary/chartTotals/groupByStageLevel/stagesFor — accesseur reutilisable pour toute vue future consommant les comptes CHART"
  - "MapView.tsx completement branche (les 3 vues MAP/DASHBOARDS/CHART sont maintenant reelles, plus de placeholder)"
affects: [phase-04-backend, gsd-verifier]

tech-stack:
  added: []
  patterns:
    - "Recompute-not-copy : tout chiffre affiche vient d'une fonction pure sur CHART_JOBS, jamais d'une capture ou d'un litteral (verifie par grep de preuve)"
    - "Table generique { label, value } vs table riche (colonnes derivees des cles de la donnee) dans CommandCenters"
    - "Verification isolee via git worktree jetable pour contourner la contention .next/port partagee entre executeurs paralleles d'un meme fan-out"

key-files:
  created:
    - apps/web/lib/chart.ts
    - apps/web/components/chart/RolloutMatrix.tsx
    - apps/web/components/chart/JobCard.tsx
    - apps/web/components/dashboards/CommandCenters.tsx
    - apps/web/components/dashboards/StatTile.tsx
    - tools/verify_p51.py
    - orchestration/verify/p51/dom-assert.txt
    - orchestration/verify/p51/dashboards.png
    - orchestration/verify/p51/chart.png
  modified:
    - apps/web/components/map/MapView.tsx

key-decisions:
  - "Ligne Human-led de la matrice CHART badge toujours « En continu » (jamais un numero d'etape), meme pour les jobs origin='map' qui portent un stage réel en base (ex. win-loss-analysis) — fidele a la capture source ou TOUS les human-led affichent Ongoing (docs/07_VISUAL_SPEC.md §Vue CHART)"
  - "Les 4 colonnes etape (Foundation/Capture/Generate/Orchestrate) sont derivees globalement depuis CHART_JOBS (stageName distincts, jamais des litteraux) et toujours affichees meme vides pour un secteur (fidele a captures/chart/marketing__matrix.png qui montre des colonnes vides en tiret)"
  - "Verification finale servie depuis un git worktree jetable (meme commit, node_modules/captures symlinkes) car le port 3010/.next reel etait rendu instable par les rebuilds concurrents des 4 autres plans du fan-out wave 1 (chunks 400, hydratation morte) — documente explicitement dans dom-assert.txt, aucune valeur inventee"

# Metrics
duration: ~40min
completed: 2026-07-08
---

# Phase 3 Plan 05: Dashboards + Chart Summary

**RolloutMatrix (7 secteurs x 4 etapes x 3 niveaux) avec resumes « N of M » recalcules par `lib/chart.ts` (jamais copies), et CommandCenters (6 dashboards) branches sur les 2 derniers placeholders de MapView.tsx.**

## Performance

- **Duration:** ~40 min
- **Started:** 2026-07-08T00:15Z (approx.)
- **Completed:** 2026-07-08T00:52Z
- **Tasks:** 3/3 complete
- **Files modified:** 10 (6 created, 1 modified, 3 preuves)

## Accomplishments
- `lib/chart.ts` recalcule tout depuis `CHART_JOBS` : `sectorSummary()` (par secteur), `chartTotals()` (controle 165/36), `stagesFor()`/`groupByStageLevel()` (grille etape x niveau). Zero litteral 165/36 dans le fichier (verifie par grep).
- `RolloutMatrix.tsx` + `JobCard.tsx` : tabs 7 secteurs (`role=tab`/`aria-selected`), titre + resume recalcule, legende 3 niveaux, 4 colonnes etape toujours affichees, cartes job avec badge etape·points ou « En continu » pour Human-led. Extras `origin='chart'` inclus.
- `CommandCenters.tsx` + `StatTile.tsx` : les 6 command centers lus depuis `DASHBOARDS` (data/dashboards.json, seed 20260611) — stat tiles (valeur+delta colore), tables (simples label/value ou generiques), nav prev/next, etiquette demo deterministe.
- `MapView.tsx` : les 2 branches placeholder (`EmptyState` "bientot") remplacees par les composants reels — les 3 vues du hero (MAP/DASHBOARDS/CHART) sont maintenant toutes fonctionnelles derriere `?view=`.
- `tools/verify_p51.py` : 10 checks Playwright reels, tous PASS — chiffres dashboards = donnee, 7 tabs dont Ventes, N of M recalcule pour Deals (19/28/4/5) et Sales (19/26/3/4), totaux 165/36, `grep 165|36 lib/chart.ts` = 0, MAP toujours 137 nœuds.

## Task Commits

Each task was committed atomically:

1. **Task 1: lib/chart.ts + RolloutMatrix** - `318663d` (feat)
2. **Task 2: CommandCenters (DASHBOARDS)** - `60aeffa` (feat)
3. **Task 3: Wiring MapView + preuves Playwright** - `d20d2f9` (feat)

**Plan metadata:** ce fichier + STATE.md (commit de cloture a suivre)

## Files Created/Modified
- `apps/web/lib/chart.ts` - Recompute API (sectorSummary, chartTotals, stagesFor, groupByStageLevel)
- `apps/web/components/chart/RolloutMatrix.tsx` - Vue CHART complete (tabs, matrice, resume recalcule)
- `apps/web/components/chart/JobCard.tsx` - Carte job (badge etape·points ou En continu)
- `apps/web/components/dashboards/CommandCenters.tsx` - Vue DASHBOARDS complete (6 centers, nav, tables)
- `apps/web/components/dashboards/StatTile.tsx` - Stat tile (valeur XL + delta colore)
- `apps/web/components/map/MapView.tsx` - Branches dashboards/chart cablees sur les vrais composants
- `tools/verify_p51.py` - Suite de preuves Playwright (10 checks)
- `orchestration/verify/p51/{dom-assert.txt,dashboards.png,chart.png}` - Preuves rendu reel

## Decisions Made
- Ligne Human-led toujours badgee "En continu" (jamais un numero d'etape), y compris pour les jobs `origin='map'` qui portent un `stage` reel en base — fidelite a la capture source (docs/07_VISUAL_SPEC.md).
- Les 4 colonnes etape sont un ensemble canonique derive de la donnee (jamais des chaines en dur), toujours affichees meme vides par secteur.
- Distribution round-robin (`index % nombre_de_colonnes`) des jobs Human-led sur les 4 colonnes pour l'equilibre visuel (l'original ne positionne pas ces jobs par un vrai stage, juste par mise en page) — n'affecte aucun chiffre affiche.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Litteraux 165/36 dans les commentaires de lib/chart.ts**
- **Found during:** Task 3 (verification, premiere execution de `verify_p51.py`)
- **Issue:** Les commentaires du fichier citaient "165 jobs" et "165 / 36 human-led" en toutes lettres pour expliquer l'intention — le grep de preuve exige 0 occurrence de ces chiffres dans le fichier source (anti-fabrication stricte, meme en commentaire).
- **Fix:** Reformulation des commentaires pour referencer `assert-graph.mjs EXPECT.jobsChart`/`EXPECT.humanLed` par nom plutot que par valeur litterale. Aucun changement de logique/comportement.
- **Files modified:** apps/web/lib/chart.ts
- **Verification:** `grep -n "165\|36" apps/web/lib/chart.ts` → 0 matches ; check Playwright correspondant PASS.
- **Commit:** d20d2f9 (Task 3)

**2. [Rule 3 - Blocking] Contention port 3010 / `.next` partages entre les 5 executeurs du fan-out**
- **Found during:** Task 3 (verification)
- **Issue:** Les 5 plans de la Phase 3 s'executent en parallele dans le meme worktree git. Un `pnpm build` sibling (plan 03-01/03-02) a ecrase `.next/server/middleware-manifest.json` pendant que le serveur de preuve etait deja demarre, provoquant des 500/400 et une hydratation React morte (clics sans effet) — symptome identique au piege connu "chunks 400 / stale server" mais cause par la concurrence inter-plans plutot qu'un serveur perime local.
- **Fix:** Verification finale servie depuis un `git worktree` jetable checkoute sur le commit courant du plan (code strictement identique, `node_modules`+`captures` symlinkes vers l'original, aucune modification de logique), buildé et servi sur son propre process/`.next` isole — port 3010 utilise mais processus prive, pas de collision possible avec les rebuilds sibling. Worktree supprime apres capture des preuves.
- **Files modified:** aucun fichier de code (contournement d'environnement uniquement) ; documente explicitement dans `orchestration/verify/p51/dom-assert.txt`.
- **Verification:** 10/10 checks PASS sur le worktree isole ; contenu et comportement identiques a ce qui est commit.
- **Commit:** d20d2f9 (Task 3, proof note)

---

**Total deviations:** 2 auto-fixed (1 bug — Rule 1, 1 blocking — Rule 3)
**Impact on plan:** Aucun changement de portee ni de comportement fonctionnel. Le 1er corrige un artefact de commentaire pour satisfaire la regle anti-fabrication ; le 2e est un contournement d'environnement (fan-out parallele) documente pour transparence, sans impact sur la fidelite de la preuve.

## Issues Encountered
- Voir Deviations ci-dessus (contention .next/port 3010 partagee par le fan-out) — resolu par verification isolee sur git worktree jetable, sans toucher aux fichiers des plans siblings.

## User Setup Required
None - aucune configuration de service externe requise.

## Next Phase Readiness
- Les 3 vues du hero (MAP/DASHBOARDS/CHART) sont maintenant completes et prouvees sur rendu reel — Phase 3 wave 1 (5/5 plans) peut etre cloturee des que les 4 autres plans sont confirmes.
- `lib/chart.ts` expose un accesseur recompute reutilisable si Phase 4 (backend Supabase) doit un jour recalculer ces memes agregats cote serveur.
- Aucun blocker connu pour la suite.

---
*Phase: 03-vues-modules-ui*
*Completed: 2026-07-08*

## Self-Check: PASSED

All 9 claimed files found on disk. All 3 task commits (318663d, 60aeffa, d20d2f9) found in git history.
