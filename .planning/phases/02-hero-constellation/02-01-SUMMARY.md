---
phase: 02-hero-constellation
plan: 01
subsystem: ui
tags: [nextjs, react, svg, trigonometry, a11y, playwright, tailwind]

# Dependency graph
requires:
  - phase: 01-fondations-data-scaffold
    provides: "catalogue consolidé (catalog.json 137 jobs/7 secteurs/34 fonctions, accesseur lib/catalog, assert-graph)"
provides:
  - "lib/constellation/geometry.ts : computeWheelLayout + computeSectorLayout, trigo pure paramétrée (SECTORS/SKILLS en args), W_STEP=360/7, PRNG mulberry32(20260611)"
  - "lib/constellation/useLowFx.ts : hook LOWFX (<700px | prefers-reduced-motion), marqueur data-lowfx"
  - "components/constellation/ : ConstellationWheel, SectorView, JobNode, HubCore, ViewSwitcher"
  - "/map réécrit : roue 7 fans + zoom secteur + shell 3 vues ?view= (D6, shareable)"
  - "tools/test-geometry.mjs : assertions déterministes sur le layout (strip-types)"
  - "preuve rendu réel orchestration/verify/p1/{wheel-smoke.txt,wheel.png}"
affects: [02-02 (JobPanel remplace SkillPanel provisoire, preuves MAP-03/04), phase-3 (vues dashboards/chart derrière les placeholders)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SVG décor + calque HTML de <button> positionnés en % depuis la même géométrie (a11y réelle, pas de <g> focusable)"
    - "géométrie pure paramétrée (données en args) = source unique testable Node strip-types ET importable Next"
    - "vue pilotée par l'URL ?view= via <Link> (jamais un state local) — shareable"
    - "déterminisme SSR : PRNG seedé, jamais Math.random nu"

key-files:
  created:
    - apps/web/lib/constellation/geometry.ts
    - apps/web/lib/constellation/useLowFx.ts
    - apps/web/components/constellation/ConstellationWheel.tsx
    - apps/web/components/constellation/SectorView.tsx
    - apps/web/components/constellation/JobNode.tsx
    - apps/web/components/constellation/HubCore.tsx
    - apps/web/components/constellation/ViewSwitcher.tsx
    - tools/test-geometry.mjs
    - orchestration/verify/p1/wheel-smoke.txt
    - orchestration/verify/p1/wheel.png
  modified:
    - apps/web/components/map/MapView.tsx
    - apps/web/app/(app)/map/page.tsx
    - apps/web/lib/contracts.ts
    - tools/build_catalog.mjs
  deleted:
    - apps/web/components/map/SkillMap.tsx
    - apps/web/components/map/StageGrid.tsx
    - apps/web/lib/map-layout.ts

key-decisions:
  - "Géométrie paramétrée (sectors/jobs en arguments) plutôt qu'import du barrel catalog : seule forme testable par node --experimental-strip-types sans dupliquer de constante"
  - "R_SECTOR_MAX=1000 (plan disait 1250) : 1250·cos(-150°) sortait du viewBox 2000"
  - "Labels secteur de la roue placés radialement à R_MAX+45 (au-delà des fans, comme la capture) : à R_SECTOR+52 ou au-dessus du nœud ils se chevauchaient"
  - "Labels de jobs masqués en vue roue (densité 137, aria-label les porte) ; visibles en vue secteur"
  - "SectorSlug corrigé 'backoffice'→'back-office' dans le générateur + contracts (bug latent zod 500 sur /api/catalog)"

patterns-established:
  - "Preuve smoke = sortie réelle citée (curl SSR + Playwright DOM + screenshot), jamais build vert seul"
  - "Serveur de preuve : pnpm build puis npx next start -p 3010 ; toujours vérifier le pid qui tient le port (piège stale server)"

# Metrics
duration: ~33min
completed: 2026-07-08
---

# Phase 2 Plan 01: Roue-constellation Summary

**Roue 7 fans trigo pure (W_STEP=360/7) avec 137 `<button>` focusables + zoom secteur + switcher `?view=` shareable, prouvée sur rendu réel (curl 137 data-node, Playwright aller-retour secteur, screenshot).**

## Performance

- **Duration:** ~33 min
- **Started:** 2026-07-07T23:02:55Z
- **Completed:** 2026-07-07T23:22:29Z (+ vérifs)
- **Tasks:** 3 (+1 fix pré-tâche)
- **Files modified:** 17

## Accomplishments

- MAP-01 (structure) : roue fidèle — 7 fans aux hex exacts du catalogue autour du hub « Cerveau d'entreprise » (90 particules mulberry32 seedées, 24 en LOWFX), 137 nœuds jobs, 34 branches-fonctions ; vue zoom secteur avec retour, compteur honnête « 0 sur N en ligne », labels de fonction, chevrons prev/next, filigrane serif.
- MAP-05 : pills MAP · DASHBOARDS · CHART en vrais `<Link>` pilotés par `?view=` — URL directe testée (200 + placeholder FR + `aria-current` correcte pour les 3 vues).
- Fondation MAP-03/04 : 137 `<button data-node>` avec aria-label non vide (0 manquant, vérifié DOM), ordre DOM secteur→fonction→job, hook `useLowFx` + marqueur `data-lowfx` observable.
- Géométrie 100 % déterministe testée : `[test-geometry] PASS nodes=137 sectors=7 branches=34 minDist=52.74` ; invariant cassé volontairement → exit 1.
- Ancien code map supprimé (`SkillMap`, `StageGrid`, `map-layout`) — grep imports = 0 ; deep-link `?skill=` préservé via `skillBySlug`.

## Task Commits

1. **Fix pré-tâche (Rule 1)** — `7a2de88` (fix) : SectorSlug `back-office`
2. **Task 1: Géométrie pure + hook LOWFX + test node** — `3d05ea3` (feat)
3. **Task 2: Composants constellation + /map réécrit** — `d27bd08` (feat)
4. **Task 3: ViewSwitcher ?view= + preuve smoke** — `eb110f0` (feat)

## Files Created/Modified

- `apps/web/lib/constellation/geometry.ts` — trigo pure sans React/DOM ; wheel + sector layouts, particules seedées, constantes exportées
- `apps/web/lib/constellation/useLowFx.ts` — matchMedia 700px + reduced-motion, sync post-hydratation (zéro mismatch)
- `apps/web/components/constellation/*` — Wheel (svg arêtes + calque boutons), SectorView, JobNode (chip crème + point secteur), HubCore, ViewSwitcher
- `apps/web/components/map/MapView.tsx` — réécrit : `view` + `initialSkill`, `data-lowfx`, SkillPanel provisoire (remplacé au 02-02)
- `apps/web/app/(app)/map/page.tsx` — searchParams Promise, normalisation `view`
- `tools/test-geometry.mjs` — assertions layout, source unique via strip-types
- `orchestration/verify/p1/{wheel-smoke.txt,wheel.png}` — preuve rendu réel

## Decisions Made

- Géométrie **paramétrée** (`computeWheelLayout(sectors, jobs)`) au lieu d'importer le barrel `../catalog` : Node strip-types ne résout ni l'import de répertoire ni le JSON sans attribut — c'est la seule forme « source unique » sans dupliquer de constante (option explicitement laissée ouverte par le plan).
- Labels secteur de la roue à `R_MAX+45` radial (fidèle à `captures/01_after_login.png`) après deux itérations visuelles (chevauchements constatés au screenshot).
- Labels de jobs masqués en vue roue (densité), portés par l'aria-label ; visibles en vue secteur.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SectorSlug `backoffice` ≠ données réelles `back-office`**
- **Found during:** chargement de contexte (avant Task 1)
- **Issue:** `types.ts` généré + `contracts.ts` déclaraient `backoffice` ; `catalog.json` émet `back-office` → `CatalogResponse.parse` échoue → `/api/catalog` 500 silencieux (prouvé par `safeParse` : `invalid_enum_value received 'back-office'`)
- **Fix:** template de `build_catalog.mjs` + enum zod corrigés, `types.ts` régénéré
- **Verification:** `safeParse` → `success: true` ; typecheck + assert-graph verts
- **Committed in:** `7a2de88`

**2. [Rule 3 - Blocking] Géométrie paramétrée au lieu d'importer `../catalog`**
- **Found during:** Task 1
- **Issue:** l'import du barrel (répertoire sans extension + JSON sans `with {type:"json"}`) est irrésoluble par `node --experimental-strip-types` — le test exigé par le plan ne pouvait pas tourner
- **Fix:** `computeWheelLayout(sectors, jobs)` / `computeSectorLayout(sectors, jobs, slug)` ; composants passent `SECTORS`/`SKILLS` de `@/lib/catalog` (key_link préservé)
- **Committed in:** `3d05ea3`

**3. [Rule 1 - Bug] `R_SECTOR_MAX` 1250 → 1000**
- **Found during:** Task 1
- **Issue:** avec les valeurs du plan, `1250·cos(-150°)` place des nœuds à x<0 (hors viewBox 2000) sur les branches extrêmes du zoom secteur
- **Fix:** rayon max 1000 ; test coords finies vert, screenshot secteur conforme à la capture
- **Committed in:** `3d05ea3`

**4. [Rule 1 - Bug] Labels secteur de la roue : chevauchements**
- **Found during:** Task 3 (screenshot réel)
- **Issue:** à `R_SECTOR+52` radial les labels chevauchaient leurs nœuds ; « au-dessus du nœud » les faisait se chevaucher entre eux (INTELLIGENCE/OPÉRATIONS)
- **Fix:** placement radial à `R_MAX+45` clampé (au-delà des fans, comme l'original)
- **Verification:** screenshot wheel.png — aucun chevauchement de labels
- **Committed in:** `eb110f0`

---

**Total deviations:** 4 auto-fixed (3 × Rule 1, 1 × Rule 3)
**Impact on plan:** corrections nécessaires à la justesse (enum, viewBox, résolution Node) et à la fidélité visuelle. Aucun scope creep.

## Issues Encountered

- **Serveur stale sur :3010** : un `next start` de la Phase 1 tenait encore le port → premier smoke servait l'ANCIEN build (137 data-node = 0, RSC payload de l'ancienne page). Débusqué en lisant le log (`EADDRINUSE`) et `ss -ltnp`. Leçon consignée dans wheel-smoke.txt.
- **Build tronqué par SIGPIPE** : `pnpm build | grep | head -5` a fermé le pipe en cours de génération → chunks 400, page non hydratée, clics morts. Rebuild complet (exit=0 vérifié) puis re-vérification intégrale.
- Les deux incidents auraient produit des faux verts si la vérification ne lisait pas la sortie réelle (règle anti faux-positif respectée).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02-02 (JobPanel) peut brancher directement `onSelectJob` — le SkillPanel provisoire est le seul point à remplacer (`components/map/MapView.tsx`).
- Preuves complètes MAP-03/MAP-04 (clavier, LOWFX mobile) attendues au 02-02 ; le marqueur `data-lowfx` et les 137 boutons aria-labellisés sont en place.
- Placeholders DASHBOARDS/CHART prêts à recevoir les vraies vues (Phase 3) via le même `?view=`.

---
*Phase: 02-hero-constellation*
*Completed: 2026-07-08*

## Self-Check: PASSED

- 11/11 fichiers créés présents ; 3/3 suppressions effectives ; 4/4 commits trouvés
- ConstellationWheel.tsx = 92 lignes (min_lines 80 ✓)
- `[test-geometry] PASS nodes=137 sectors=7 branches=34 minDist=52.74`
