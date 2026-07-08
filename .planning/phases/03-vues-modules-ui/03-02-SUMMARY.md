---
phase: 03-vues-modules-ui
plan: 02
subsystem: ui
tags: [nextjs, react, a11y, playwright, tailwind, localStorage]

# Dependency graph
requires:
  - phase: 01-catalogue (Phase 1)
    provides: "apps/web/lib/lessons.ts (ORDER + CONTENT des 18 leçons, getLesson/getAdjacent/getLessons), apps/web/lib/progress.ts (useProgress stub localStorage), apps/web/lib/lesson-types.ts, 18 fichiers content/lessons/ FR déjà écrits (D1, prototype adopté)"
provides:
  - "orchestration/verify/p3/coverage.md : matrice 18/18 leçon↔capture (17 alignées dont 6 en superset, 1 complétée : start-here/tool-stack §Meetings)"
  - "Stepper.tsx : composant réutilisable module+leçons -> useProgress(), compteur X/N, aria-current=step, clic navigue — utilisé sur /modules/[module] et en stepper latéral sticky sur /modules/[module]/[lesson]"
  - "LessonReader.tsx : bouton « Marquer comme terminé » sans navigation (markComplete + aria-pressed, re-render immédiat)"
  - "tools/verify_p3.py : 8 checks Playwright reproductibles (stepper X→X+1, persistance reload+localStorage, navigation complète 8 leçons + transition module suivant, leçon longue structurée, anti-verbatim ×2 hors-browser)"
affects: [phase-4 (lib/progress.ts sera remplacé par /api/progress — l'UI (Stepper/LessonReader) ne doit pas être réécrite, seulement le hook useProgress branché sur l'API)]

tech-stack:
  added: []
  patterns:
    - "Stepper.tsx : source unique de l'état de progression affiché (compteur + statut par leçon), toujours dérivé de useProgress().isComplete/countDone — jamais dupliqué/recalculé côté page"
    - "LessonReader « Marquer comme terminé » (idempotent, sans navigation) séparé du bouton LessonNav « terminé & continuer » (navigue) — évite la course entre re-render et navigation client dans les preuves Playwright"
    - "comparaison anti-verbatim hors-browser : fenêtres de 8 mots de la capture EN (`captures/lessons/*.json` champ text) testées comme sous-chaîne du texte FR extrait des string literals du fichier .ts de la leçon"

key-files:
  created:
    - orchestration/verify/p3/coverage.md
    - orchestration/verify/p3/dom-assert.txt
    - orchestration/verify/p3/lesson-long.png
    - orchestration/verify/p3/stepper-advance.png
    - tools/verify_p3.py
  modified:
    - apps/web/components/lesson/Stepper.tsx
    - apps/web/components/lesson/LessonReader.tsx
    - apps/web/app/(app)/modules/page.tsx
    - apps/web/app/(app)/modules/[module]/page.tsx
    - apps/web/app/(app)/modules/[module]/[lesson]/page.tsx
    - apps/web/content/lessons/start-here/tool-stack.ts

key-decisions:
  - "Stepper.tsx repurposé : de sélecteur de module (3 items statut codé en dur) à stepper de leçons dans un module (moduleSlug+lessons+activeSlug, wired sur useProgress). L'ancien usage sur /modules (index) est retiré ; ModuleCard (déjà réel, non touché) porte la progression par module sur cette page."
  - "LessonReader devient client component (bouton Marquer comme terminé sans navigation) pour permettre au Stepper voisin de se re-render immédiatement — testable sans dépendre du timing de navigation client de LessonNav."
  - "Port de vérification 3011 (pas 3010) : un exécuteur parallèle (autre plan de la Phase 3, fan-out wave 1) tenait déjà :3010 au moment de l'exécution — évite de lire un build stale d'un autre plan (piège serveur documenté dans le handoff)."

# Metrics
duration: ~35min
completed: 2026-07-08
---

# Phase 3 Plan 02: Modules Summary

**Matrice de couverture 18/18 leçon↔capture (1 gap réel comblé), Stepper/LessonReader branchés sur `useProgress()` avec compteur X/N qui avance et persiste, preuve Playwright 8/8 PASS.**

## Performance

- **Duration:** ~35 min
- **Tasks:** 3/3
- **Files modified:** 6 (+ 4 preuves + 1 outil créés)

## Accomplishments

- Audit structurel complet des 18 leçons FR contre leur capture dédiée (`captures/lessons/modules_*.json`) : 17/18 alignées (dont 6 avec une expansion FR plus détaillée que la table des matières visuelle capturée, vérifiée section par section sans rien omettre), 1/18 avec un gap réel identifié (`start-here/tool-stack` — section "Meetings"/Fireflies absente).
- Gap comblé en FR neuve (prose reformulée, jamais traduite mot à mot de la capture EN).
- `Stepper.tsx` refondu : source unique de vérité de la progression affichée (compteur X/N + statut par leçon), dérivée de `useProgress()`, utilisée comme stepper de module (`/modules/[module]`) et comme stepper latéral sticky sur la page leçon (remplace le `<details>` replié).
- `LessonReader.tsx` : bouton « Marquer comme terminé » idempotent et sans navigation, pour un re-render immédiat visible dans la même vue (complète le bouton « terminé & continuer » de `LessonNav`, inchangé).
- Suite `tools/verify_p3.py` : 8 checks — compteur 0/8→1/8, persistance après reload réel (compteur + `localStorage`), navigation complète des 8 leçons `start-here` avec transition vers `foundations`, leçon longue structurée (6 h2, 3 blocs code, 1 callout), anti-verbatim ×2.

## Task Commits

1. **Task 1: Audit couverture 18/18 → coverage.md** - `871b84b` (docs)
2. **Task 2: Compléter les leçons FR manquantes + brancher stepper/reader/nav** - `1a2709b` (feat)
3. **Task 3: Preuves Playwright — orchestration/verify/p3/** - `4d6db09` (test)

_Pas de commit de métadonnées séparé (celui-ci est le premier commit `docs` de cette réponse pour STATE.md/SUMMARY.md)._

## Files Created/Modified

- `orchestration/verify/p3/coverage.md` — matrice 18/18, méthode de comparaison, bilan
- `apps/web/content/lessons/start-here/tool-stack.ts` — section "Meetings" (Fireflies) ajoutée en FR neuve
- `apps/web/components/lesson/Stepper.tsx` — stepper de module branché sur `useProgress()`
- `apps/web/components/lesson/LessonReader.tsx` — bouton "Marquer comme terminé" sans navigation
- `apps/web/app/(app)/modules/page.tsx` — retrait de l'ancien stepper statique 3-modules
- `apps/web/app/(app)/modules/[module]/page.tsx` — Stepper + CTA "Entrer dans le module"
- `apps/web/app/(app)/modules/[module]/[lesson]/page.tsx` — layout colonne principale + stepper latéral sticky
- `tools/verify_p3.py` — suite Playwright reproductible (8 checks)
- `orchestration/verify/p3/{dom-assert.txt,lesson-long.png,stepper-advance.png}` — preuves rendu réel

## Decisions Made

- Voir `key-decisions` en frontmatter : Stepper.tsx repurposé (module-selector → lesson-stepper), LessonReader devenu client component pour découpler marquage/navigation, port de vérification 3011 pour éviter le serveur :3010 d'un exécuteur parallèle.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug évité] Séparation marquage/navigation pour fiabiliser la preuve**
- **Found during:** Task 2 (conception de LessonReader/LessonNav)
- **Issue:** Le plan ne spécifiait qu'un bouton combiné "terminé & continue" (déjà dans `LessonNav`, qui navigue immédiatement) — vérifier "le compteur passe X→X+1" sur la même page serait en course avec la navigation client Next.js.
- **Fix:** Ajout d'un second bouton, dédié, dans `LessonReader.tsx` ("Marquer comme terminé", idempotent, sans navigation), qui satisfait explicitement le point 3 de la Task 2 ("Après marquage, l'état se reflète immédiatement"). `LessonNav` reste inchangé pour l'enchaînement.
- **Files modified:** apps/web/components/lesson/LessonReader.tsx
- **Verification:** `tools/verify_p3.py` check "compteur avance après marquage" — PASS
- **Committed in:** 1a2709b

**2. [Rule 3 - Blocage] Port de vérification 3011 au lieu de 3010**
- **Found during:** Task 3 (lancement du serveur de preuve)
- **Issue:** `ss -ltnp` montrait déjà un `next-server` sur :3010 (exécuteur parallèle d'un autre plan de la Phase 3, fan-out wave 1) — l'utiliser aurait lu un build étranger (piège "serveur stale" documenté dans le handoff), l'arrêter aurait cassé la vérification en cours d'un autre plan.
- **Fix:** `verify_p3.py` lit le port via `PORT` (env, défaut 3010) ; exécuté avec `PORT=3011` contre un `next start -p 3011` propre à ce build.
- **Files modified:** tools/verify_p3.py (paramétrable), aucune autre
- **Verification:** `curl http://localhost:3011/modules` → 200 avant lancement des checks ; serveur tué en fin de run (`kill <pid>`, `ss -ltnp` confirmé libre)
- **Committed in:** 4d6db09

---

**Total deviations:** 2 auto-fixed (1 fiabilisation de preuve, 1 blocage d'infra partagée)
**Impact on plan:** Aucun écart de contenu/portée — les deux ajustements renforcent l'anti-faux-positif exigé par le plan (mesures réelles, jamais de course de timing, jamais de lecture d'un build étranger).

## Issues Encountered

- Premier lancement du serveur de preuve via `nohup ... &` en sous-shell Bash tué au retour de l'appel (l'outil Bash ne persiste pas les process backgroundés hors `run_in_background`) — relancé avec `run_in_background: true`, poll `curl` jusqu'à 200. Documenté pour éviter de refaire l'erreur sur les plans suivants.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `Stepper`/`LessonReader` consomment `useProgress()` sans jamais toucher `localStorage` directement dans les composants UI — Phase 4 peut remplacer le corps de `lib/progress.ts` par `/api/progress` sans réécrire l'UI (interface stub propre, conforme au handoff Phase 3).
- Les 18 leçons sont maintenant fidèles à 18/18 (0 gap restant). Aucun blocage pour les autres plans du fan-out (03-01/03-03/03-04/03-05) : aucun fichier partagé modifié en dehors de `files_modified` déclaré.

---
*Phase: 03-vues-modules-ui*
*Completed: 2026-07-08*

## Self-Check: PASSED

All 11 declared files found on disk; all 3 task commits (871b84b, 1a2709b, 4d6db09) found in git log.
