---
phase: 03-vues-modules-ui
plan: 01
subsystem: ui
tags: [nextjs, react, a11y, playwright, localStorage, markdown]

# Dependency graph
requires:
  - phase: 01-catalogue (Phase 1)
    provides: "lib/catalog/{catalog.json,types.ts} — SKILLS (137 jobs), SKILL_FILES (78 fiches), CHART_JOBS, SECTORS"
  - phase: 02-hero-constellation (wave 2)
    provides: "pattern de preuve Playwright (tools/verify_p1.py), pattern localStorage+event (lib/progress.ts)"
provides:
  - "page /hub complète : GET STARTED (5 étapes, progression X/5), Modules, Fresh drops + Featured this week, Most installed, Community pulse, Build logs"
  - "lib/installs.ts : interface install locale stub (localStorage skilltree.installs.v1 + event skilltree:installs) — install/uninstall/isInstalled + useInstalls(), Phase 4-ready"
  - "lib/skill-files.ts : getSkillFile(slug)/getAllSkillFiles() — lecture SERVEUR de content/skills/*.md avec fallback catalogue EN propre"
  - "InstallModal.tsx : modale a11y (role=dialog, focus géré) affichant la fiche FR, bouton Installer le skill → install(slug)"
  - "CommandBar.tsx rebranché : recherche sur les 78 SKILL_FILES, résultat cliqué ouvre l'InstallModal (plus de router.push vers /map)"
  - "content/skills/*.md : 78/78 fiches skills réécrites en français (structure fidèle, prose neuve)"
  - "tools/verify_p2.py : suite Playwright 12 checks, réutilisable"
affects: ["03-04 (My Tree/TreeAudit lit le même contrat localStorage skilltree.installs.v1 sans importer lib/installs.ts)", "Phase 4 (remplace lib/installs.ts par /api/install sans réécrire l'UI Hub)"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "lib/installs.ts miroir strict de lib/progress.ts (STORAGE_KEY + EVENT + read/write try-catch + hook useX())"
    - "fs (content/skills/*.md) lu UNIQUEMENT depuis un Server Component (layout.tsx/hub/page.tsx) ; le résultat sérialisable descend en props vers les Client Components (CommandBar/InstallModal/FreshDrops/MostInstalled) — jamais d'import direct de lib/skill-files.ts depuis un fichier \"use client\" (fs indisponible dans le bundle navigateur)"
    - "event window custom `skilltree:open-install` : les cartes Hub (FirstWeekChecklist chips, FreshDrops, FeaturedThisWeek) déclenchent la même InstallModal montée une fois dans CommandBar, sans dupliquer d'instance ni prop-driller une fonction Server→Client"
    - "sélections Hub (featured/freshDrops/nextDrop/buildLogs) 100% déterministes (tri secteur puis slug), aucun Math.random, aucun compteur d'install fabriqué (D3) — Most installed dérive de useInstalls() réel, EmptyState si vide"

key-files:
  created:
    - apps/web/lib/hub-data.ts
    - apps/web/lib/installs.ts
    - apps/web/lib/skill-files.ts
    - apps/web/components/hub/InstallModal.tsx
    - apps/web/components/hub/FreshDrops.tsx
    - apps/web/components/hub/FeaturedThisWeek.tsx
    - apps/web/components/hub/MostInstalled.tsx
    - apps/web/components/hub/BuildLogs.tsx
    - apps/web/content/skills/*.md (78 fichiers)
    - tools/verify_p2.py
    - orchestration/verify/p2/{dom-assert.txt,hub.png,cmdk-modal.png,skill-files-count.txt}
  modified:
    - apps/web/app/(app)/hub/page.tsx
    - apps/web/app/(app)/layout.tsx
    - apps/web/components/hub/FirstWeekChecklist.tsx
    - apps/web/components/ui/CommandBar.tsx

key-decisions:
  - "CommandBar recherche sur SKILL_FILES (78 fiches installables) et non plus sur SKILLS (137 jobs de la roue Map) — l'install(slug) et getSkillFile(slug) doivent pointer vers le même référentiel de slugs (celui de content/skills/), pas vers les jobs du catalogue Map qui ont des slugs différents."
  - "fs lu uniquement en Server Component (layout.tsx + hub/page.tsx via getAllSkillFiles()), jamais depuis un fichier \"use client\" — contrainte dure de Next.js App Router, pas une option."
  - "Cartes Hub (Fresh drops/Featured) affichent la fiche FR (via skillFiles déjà résolu), pas le texte anglais du catalogue — cohérence FR de bout en bout au-delà du strict minimum demandé par les truths (qui ne l'exigeaient que pour l'InstallModal)."
  - "Most installed = installs locaux réels de CET utilisateur (localStorage), jamais un classement communautaire fabriqué — la copie 'all time' de l'original est remplacée par une liste des installs personnels, EmptyState explicite si aucun."
  - "Âges des Fresh drops = placeholder déterministe étiqueté '(démo)', jamais un vrai historique de publication (n'existe pas côté perso)."

patterns-established:
  - "Server Component racine calcule les données nécessitant fs/DB une fois, les passe en props sérialisables aux Client Components (pattern réutilisable pour toute future lecture fichier côté UI)"

# Metrics
duration: 55min
completed: 2026-07-08
---

# Phase 3 Plan 01 — Hub Summary

**Page /hub complète (6 sections FR fidèles aux captures) + install(slug) local (localStorage) + InstallModal réelle + 78 fiches skills réécrites en français, prouvées par 12/12 checks Playwright sur rendu réel.**

## Performance

- **Duration:** ~55 min
- **Tasks:** 3
- **Files modified:** 12 fichiers de code + 78 fiches markdown + 4 fichiers de preuve

## Accomplissements

- `/hub` rend les 6 sections dans l'ordre des captures (GET STARTED progression 2/5, Modules, Fresh drops + Featured this week, Most installed, Community pulse, Build logs), toutes en français, chacune avec heading et état vide géré.
- ⌘K/Ctrl+K cherche parmi les 78 skills installables, un résultat cliqué ouvre une InstallModal réelle (`role=dialog aria-modal`, focus géré, Échap/backdrop) affichant la fiche FR (jamais l'anglais catalogue). « Installer le skill → » appelle `install(slug)`, écrit `localStorage['skilltree.installs.v1']`, et l'état passe à « Installé » — vérifié en rouvrant ⌘K sur le même skill.
- `apps/web/content/skills/` contient 78/78 fiches FR réécrites (compteur recompté à chaque run de preuve, jamais copié), structure fidèle aux sources (`captures/skill_files_full/*.md`) mais prose entièrement nouvelle — spot-check anti-verbatim sur 3 fiches : 4 mots communs max (seuil de rupture = 8).
- Interface `lib/installs.ts` strictement stub (miroir de `lib/progress.ts`), prête pour le remplacement Phase 4 par `/api/install` sans réécrire l'UI.

## Task Commits

1. **Task 1: Sections Hub + hub-data déterministe** - `ea90a57` (feat)
2. **Task 2: install(slug) local + InstallModal + CommandBar rebranché** - `9aa60d6` (feat)
3. **Task 3: 78 fiches FR + preuves Playwright p2** - `8ae1832` (feat)
4. **Correction hors-scope (course concurrente)** - `e37cd79` (chore)

## Files Created/Modified

- `apps/web/lib/hub-data.ts` — sélections déterministes Fresh drops/Featured/Build logs, dérivées de `SKILL_FILES` (78), triées secteur puis slug
- `apps/web/lib/installs.ts` — install/uninstall/isInstalled + `useInstalls()`, localStorage `skilltree.installs.v1` + event `skilltree:installs`
- `apps/web/lib/skill-files.ts` — `getSkillFile(slug)`/`getAllSkillFiles()`, lecture `fs` **serveur uniquement**, fallback catalogue EN propre
- `apps/web/components/hub/InstallModal.tsx` — modale a11y, fiche FR, bouton install
- `apps/web/components/hub/{FreshDrops,FeaturedThisWeek,MostInstalled,BuildLogs}.tsx` — nouvelles sections Hub
- `apps/web/components/hub/FirstWeekChecklist.tsx` — GET STARTED enrichi (progression, chips secteur, fermable)
- `apps/web/components/ui/CommandBar.tsx` — recherche sur 78 fiches, ouvre InstallModal
- `apps/web/app/(app)/layout.tsx` — Server Component calcule `getAllSkillFiles()`, le passe en props à CommandBar
- `apps/web/app/(app)/hub/page.tsx` — composition des 6 sections
- `apps/web/content/skills/*.md` (78) — fiches FR réécrites
- `tools/verify_p2.py` + `orchestration/verify/p2/*` — preuves

## Decisions Made

Voir `key-decisions` en frontmatter. Point le plus structurant : le plan disait « garder le filtrage `SKILLS` » pour CommandBar, mais `SKILLS` (137 jobs Map) et `SKILL_FILES` (78 fiches installables, référencées par `content/skills/<slug>.md`) sont deux registres de slugs différents — un job comme `invoice-generation` référence la fiche `billing-manager`. Pour que `install(slug)` et `getSkillFile(slug)` opèrent sur le même identifiant que celui affiché/recherché, CommandBar a été rebranché sur `SKILL_FILES`. Documenté ici plutôt que traité en silence.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `lib/skill-files.ts` ne peut pas être importé depuis un composant "use client"**
- **Found during:** Task 2 (conception InstallModal/CommandBar)
- **Issue:** Le plan décrivait `InstallModal.tsx -> lib/skill-files.ts via getSkillFile(slug)`. `getSkillFile` lit `content/skills/<slug>.md` via `node:fs`. `InstallModal`/`CommandBar` sont des Client Components ("use client", interactivité ⌘K/focus/état) ; `fs` n'existe pas dans le bundle navigateur Next.js — un import direct aurait cassé `pnpm build` ou renvoyé un module vide au runtime.
- **Fix:** `getAllSkillFiles()` est appelé une seule fois dans `app/(app)/layout.tsx` (Server Component, ancêtre de toutes les routes `(app)`), qui passe le résultat déjà résolu (JSON sérialisable) en props à `CommandBar`. `CommandBar` transmet `fiche={skillFiles[modalSlug]}` à `InstallModal`. Les Hub cards (Fresh drops/Featured/chips) déclenchent la modale via un event `window` custom (`skilltree:open-install`) plutôt que par prop-drilling d'une fonction non-sérialisable.
- **Files modified:** apps/web/app/(app)/layout.tsx, apps/web/components/ui/CommandBar.tsx, apps/web/components/hub/InstallModal.tsx, apps/web/lib/skill-files.ts
- **Verification:** `pnpm build` exit 0, `pnpm typecheck` propre, `tools/verify_p2.py` 12/12 PASS (InstallModal affiche bien la fiche FR réelle, pas de crash)
- **Committed in:** 9aa60d6 (Task 2 commit)

**2. [Rule 1 - Bug] CommandBar cherchait sur le mauvais référentiel (SKILLS/137 jobs au lieu de SKILL_FILES/78 fiches)**
- **Found during:** Task 2
- **Issue:** Le scaffold existant (`CommandBar.tsx` avant ce plan) filtrait `SKILLS` (jobs de la roue Map, ex. `invoice-generation`) et routait vers `/map?skill=`. Le flux Install cible des **fiches** (`billing-manager`, `carousel-designer`…) référencées par `job.files[].slug` — un identifiant différent. Chercher sur `SKILLS` et appeler `install(job.slug)` aurait cassé le lien avec `content/skills/<slug>.md` (aucune fiche ne porte le slug d'un job).
- **Fix:** Recherche rebranchée sur `Object.values(skillFiles)` (78 fiches), résultat cliqué ouvre l'InstallModal sur le slug de la fiche.
- **Files modified:** apps/web/components/ui/CommandBar.tsx
- **Verification:** `tools/verify_p2.py` check "recherche « carrousel » -> résultats" + "localStorage skilltree.installs.v1 écrit" avec le bon slug (`carousel-designer`)
- **Committed in:** 9aa60d6 (Task 2 commit)

**3. [Rule 3 - Blocking, environnement] Course d'écriture git avec l'exécuteur parallèle 03-05**
- **Found during:** commit final Task 3
- **Issue:** `branching_strategy=none` (config.json) : les 5 plans du fan-out wave 1 committent sur `main` dans le même repo. Un `git add` du dossier `orchestration/verify/p2/` a scoopé par accident un fichier `.planning/phases/03-vues-modules-ui/03-05-SUMMARY.md` créé en parallèle par l'exécuteur du plan 03-05 (entre mon `git add` et mon `git commit`), incluant son contenu dans mon commit `feat(03-01)`.
- **Fix:** Commit correctif immédiat `git rm --cached` (le fichier reste intact sur disque, redevient untracked) pour que l'exécuteur 03-05 le committe lui-même dans son propre historique.
- **Files modified:** aucun fichier de contenu — retrait d'un tracking git erroné.
- **Verification:** `git status` confirme le fichier untracked après correction, contenu disque inchangé (`ls -la` avant/après).
- **Committed in:** e37cd79

---

**Total deviations:** 3 auto-fixed (1 blocking architecture Next.js, 1 bug de référentiel, 1 incident d'environnement multi-exécuteur concurrent)
**Impact on plan:** Les 2 premiers déviations étaient nécessaires à la correction fonctionnelle (sans elles, build cassé ou install(slug)/getSkillFile(slug) désynchronisés). La 3e est un artefact de l'environnement d'exécution parallèle (aucun impact sur le contenu livré). Aucune fuite de scope vers un autre plan.

## Issues Encountered

- **Serveur de preuve stale (piège connu, cf. hard_rules) :** un premier `next start -p 3010` lancé avant le rebuild final servait encore l'ancien manifeste de chunks → 400 sur les assets statiques → CommandBar silencieusement cassé côté client (aucune erreur serveur visible). Diagnostiqué via `page.on('response')` (chunks 400) puis confirmé par le PID sur `ss -ltnp` identique à l'ancien process. Résolu en tuant le PID exact puis relançant `next start` après le build final.
- Process `next start` lancé en arrière-plan via `(cmd &)` s'est arrêté seul entre deux appels Bash (le shell parent se termine à chaque appel d'outil) — relancé avec `nohup … & disown` pour survivre entre les appels.

## Next Phase Readiness

- Le contrat `localStorage['skilltree.installs.v1']` + event `skilltree:installs` est posé et stable — 03-04 (My Tree/TreeAudit) peut le lire via son propre helper local sans import croisé.
- Phase 4 (Supabase) remplace `lib/installs.ts` par `/api/install` : signatures `install/uninstall/isInstalled/useInstalls` à conserver telles quelles.
- `getSkillFile`/`getAllSkillFiles` sont conçus pour être remplacés par une lecture Supabase/CDN sans changer la forme `SkillFileContent` ni le point d'appel (Server Component racine).

---
*Phase: 03-vues-modules-ui*
*Completed: 2026-07-08*

## Self-Check: PASSED

Tous les fichiers clés vérifiés présents sur disque (13 fichiers de code/preuve + 78 fiches
`content/skills/*.md` recomptées à 78) et les 4 commits (`ea90a57`, `9aa60d6`, `8ae1832`,
`e37cd79`) confirmés dans `git log --oneline --all`.
