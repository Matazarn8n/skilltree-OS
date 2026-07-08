---
phase: 03-vues-modules-ui
plan: 03
subsystem: ui
tags: [nextjs, react, localStorage, playwright, wizard]

# Dependency graph
requires:
  - phase: 01-catalogue (build_catalog/assert-graph)
    provides: "apps/web build pipeline (prebuild build:catalog + assert-graph), design tokens partagés (Button, ProgressBar)"
provides:
  - "lib/brain.ts : modèle 8 sections (enum brain_section D5/ARCHITECTURE §5) + useBrain() (read/save/saveAll/all/reset, localStorage skilltree.brain.v1 + event skilltree:brain) + draftBrain(input) stub local Phase 4-ready (POST /api/brain/draft, gateway :8765, D7)"
  - "components/brain/{BrainBuilder,BrainWizard,BrainSection,BrainIntake}.tsx : wizard une-section-par-écran (intake → 8 sections → done), 2 chemins IA/manuel, badge source ai|manual, reprise de brouillon au montage"
  - "tools/verify_p4.py : 19 checks Playwright reproductibles (VERIFY_BASE env var pour pointer un serveur alternatif), preuves orchestration/verify/p4/"
affects: [phase-4 (remplace draftBrain()/useBrain() par gateway :8765 + Postgres RLS sans réécrire l'UI du wizard)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useBrain() miroir exact de lib/progress.ts (localStorage + CustomEvent + storage listener, re-render tous les hooks montés)"
    - "décision d'écran de départ lue en direct (loadBrainMap(), hors hook) pour éviter la course entre l'hydratation asynchrone de useBrain() et l'effet de montage du wizard"
    - "vérification de build isolée dans un git worktree détaché (évite la collision avec les rebuilds concurrents des autres plans du fan-out sur apps/web/.next partagé)"

key-files:
  created:
    - apps/web/components/brain/BrainWizard.tsx
    - apps/web/components/brain/BrainSection.tsx
    - apps/web/components/brain/BrainIntake.tsx
    - tools/verify_p4.py
    - orchestration/verify/p4/dom-assert.txt
    - orchestration/verify/p4/brain-section.png
    - orchestration/verify/p4/brain-manual.png
  modified:
    - apps/web/lib/brain.ts
    - apps/web/components/brain/BrainBuilder.tsx

key-decisions:
  - "Eyebrows FR traduits de l'enum (COMPANY→ENTREPRISE, OFFER→OFFRE, CUSTOMERS→CLIENTS, VOICE→TON, OPS→OPÉRATIONS, STACK→OUTILS, GOALS→OBJECTIFS, CONSTRAINTS→CONTRAINTES), cohérent avec le reste de la nav déjà en FR"
  - "Sections 2-8 : captures/dynamic/brain_section_2..8.json sont identiques à la section 1 (capture originale restée bloquée sur la validation 'Fill this in to continue', jamais progressée) — labels/questions 2-8 réécrits depuis l'enum brain_section, pas la capture (qui n'existe pas réellement au-delà de l'écran 1)"
  - "Reprise de brouillon : brouillon vide → intake ; brouillon non vide → 1re section vide (ou 'done' si les 8 sont remplies) — décidé par lecture directe loadBrainMap(), pas par le hook useBrain() (race d'hydratation)"
  - "Continue désactivé tant que le champ est vide, fidèle à la validation capturée (brain_section_2.json 'Fill this in to continue')"

patterns-established:
  - "draftBrain(input) => Record<key,string> : stub 100% local et déterministe, aucun fetch/setTimeout déguisé — Phase 4 remplace uniquement le corps de la fonction"

# Metrics
duration: ~35min
completed: 2026-07-08
---

# Phase 3 Plan 03: Brain wizard Summary

**Wizard Brain 8 sections une-par-écran (2 chemins IA/manuel), persistance localStorage avec badge source, stub `draftBrain()` prêt pour le swap Phase 4 (gateway :8765)**

## Performance

- **Duration:** ~35 min
- **Tasks:** 3/3 complétées
- **Files modified/created:** 9

## Accomplishments
- `lib/brain.ts` : modèle 8 sections (`company/offer/customers/voice/ops/stack/goals/constraints`, enum D5), `useBrain()` (read/save/saveAll/all/reset, localStorage `skilltree.brain.v1` + event `skilltree:brain`), `draftBrain()` stub local étiqueté Phase 4-ready.
- Wizard complet fidèle aux captures : écran d'entrée à 2 chemins (`brain_initial.png`), 8 écrans un-par-un avec eyebrow `<LABEL> X/8`, éditeur, Retour/Continuer, badge source, footnote "Sauvegardé au fil de l'eau…".
- Preuves Playwright réelles : 19/19 checks PASS, 8 sections cyclées (eyebrow 1→8), save→reload persistant (marqueur retrouvé après un reload complet de page), badge source `ai|manual` sur les deux chemins, chemin manuel complet (8 clés localStorage).

## Task Commits

Each task was committed atomically:

1. **Task 1: lib/brain.ts — modèle 8 sections + useBrain + draftBrain stub** - `ecc8783` (feat)
2. **Task 2: Wizard Brain — intake 2 chemins + 8 sections une-par-écran + save/source** - `03c4a6e` (feat)
3. **Task 3: Preuves Playwright — orchestration/verify/p4/** - `95b3d85` (test)

_Note: Task 3 commit also includes a small addition to `tools/verify_p4.py` for a `VERIFY_BASE` env var (see Deviations)._

## Files Created/Modified
- `apps/web/lib/brain.ts` - Modèle 8 sections, `useBrain()`, `draftBrain()` stub, `loadBrainMap()`/`firstUnfilledIndex()` (lecture directe pour la reprise de brouillon)
- `apps/web/components/brain/BrainWizard.tsx` - Machine à états intake→section(0..7)→done, progress bar, focus a11y, écran de fin (récap + jump + recommencer)
- `apps/web/components/brain/BrainSection.tsx` - Éditeur de section + badge source
- `apps/web/components/brain/BrainIntake.tsx` - Écran d'entrée (site + notes, 2 CTA)
- `apps/web/components/brain/BrainBuilder.tsx` - Orchestrateur → shell de page, délègue à `BrainWizard`
- `tools/verify_p4.py` - Suite Playwright 19 checks
- `orchestration/verify/p4/{dom-assert.txt,brain-section.png,brain-manual.png}` - Preuves rendu réel

## Decisions Made
Voir `key-decisions` en frontmatter (eyebrows FR, labels 2-8 depuis l'enum, logique de reprise de brouillon, Continue désactivé si champ vide).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Build/serveur de preuve isolés dans un git worktree détaché**
- **Found during:** Task 3 (vérification Playwright)
- **Issue:** Le fan-out Phase 3 exécute 5 plans en parallèle dans le même `apps/web/`. Un `pnpm build` concurrent d'un autre plan a écrasé `apps/web/.next/static/chunks/*` pendant que mon serveur `next start -p 3010` tournait déjà dessus → `ChunkLoadError` côté client (hash de chunk changé sous le serveur en cours), page blanche "Application error".
- **Fix:** Build + `next start` exécutés dans un `git worktree` détaché isolé (`/tmp/.../wt-p4`, pinné au commit courant, `node_modules` et `captures/` symlinkés) sur un port dédié (3014), sans toucher au `.next` partagé. Ajout d'une variable d'environnement `VERIFY_BASE` (défaut `http://localhost:3010`, inchangé) à `tools/verify_p4.py` pour pointer le runner vers ce serveur isolé sans modifier le comportement par défaut du script.
- **Files modified:** `tools/verify_p4.py` (ajout `VERIFY_BASE`, comportement par défaut inchangé)
- **Verification:** 19/19 checks PASS sur le serveur isolé (port 3014) ; worktree + serveur nettoyés après coup (`git worktree remove --force`, `kill`).
- **Committed in:** `95b3d85` (Task 3 commit)

**2. [Rule 1 - Bug] Comparaison badge source insensible à la casse**
- **Found during:** Task 3 (premier run de `verify_p4.py`)
- **Issue:** Le badge est stylé en `uppercase` (CSS) — `innerText` renvoie le texte **rendu** (`"MANUEL"`, `"IA"`), la comparaison stricte `== "Manuel"` échouait alors que le rendu était correct (piège déjà documenté côté Phase 2 : `innerText` uppercase → comparer en `.lower()`).
- **Fix:** Comparaisons badge passées en `.lower()` (`badge.lower() == "manuel"`, `badge_ai.lower() == "ia"`).
- **Files modified:** `tools/verify_p4.py`
- **Verification:** Re-run → 19/19 PASS.
- **Committed in:** `95b3d85` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking infra fan-out, 1 bug test insensible à la casse)
**Impact on plan:** Aucun impact sur le périmètre livré ; les deux corrections concernent uniquement l'infrastructure de preuve (isolation build + robustesse du test), pas le comportement applicatif.

## Issues Encountered
- Race d'hydratation entre `useBrain()` (état asynchrone) et l'effet de montage du wizard décidant l'écran de départ : résolue en ajoutant `loadBrainMap()`, une lecture directe (hors hook) de `localStorage`, utilisée une seule fois au montage (voir key-decisions).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `lib/brain.ts` expose une interface stable (`useBrain()` : read/save/saveAll/all/reset ; `draftBrain(input)`) que Phase 4 peut swapper vers `GET/PUT /api/brain` + `POST /api/brain/draft` (gateway HERMES `:8765`) sans toucher aux composants `Brain*`.
- Aucun autre plan du fan-out Phase 3 ne touche `apps/web/lib/brain.ts` ni `components/brain/*` (0 overlap `files_modified`, vérifié par le plan-checker).
- Point d'attention pour la vérification finale de phase : rebuild propre de `apps/web/.next` avant de rejouer `tools/verify_p4.py` en conditions normales (le fan-out concurrent peut avoir laissé le `.next` partagé dans un état intermédiaire d'un autre plan).

---
*Phase: 03-vues-modules-ui*
*Completed: 2026-07-08*

## Self-Check: PASSED

All 9 created/modified files verified present on disk (`apps/web/lib/brain.ts`, `apps/web/components/brain/{BrainWizard,BrainSection,BrainIntake,BrainBuilder}.tsx`, `tools/verify_p4.py`, `orchestration/verify/p4/{dom-assert.txt,brain-section.png,brain-manual.png}`). All 3 task commits (`ecc8783`, `03c4a6e`, `95b3d85`) verified present in git history.
