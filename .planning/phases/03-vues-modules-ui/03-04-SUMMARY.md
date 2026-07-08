---
phase: 03-vues-modules-ui
plan: 04
subsystem: ui
tags: [nextjs, react, localstorage, playwright, a11y]

# Dependency graph
requires:
  - phase: 03-vues-modules-ui (plan 01, Hub)
    provides: "contrat localStorage skilltree.installs.v1 + event skilltree:installs (lib/installs.ts) — LU seulement, jamais importé"
provides:
  - "Vue /tree : ConnectMachine + stats reactives + WeeklyDrops + TreeAudit reactif aux installs locaux"
  - "Vue /community : H1 + bandeau 100 premiers + feed (composer + posts)"
  - "Vue /settings : Compte (Membre 47 $/mois) + Securite + Facturation (Stripe placeholder D8) + Zone de danger, sections labellisees"
  - "tools/verify_p5.py + preuves orchestration/verify/p5/ (3 screenshots + dom-assert.txt)"
affects: [04-backend-api, phase-4-supabase-installs]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Helper local useInstalledSlugs() (TreeAudit.tsx) : lit un contrat localStorage partage par CLE+EVENT sans importer le module proprietaire (03-01/lib/installs.ts) — decouplage fan-out wave 1 sans overlap de fichiers"
    - "WeeklyDrops reutilise l'export FRESH_DROPS existant (lib/catalog) plutot que d'inventer une nouvelle source de donnees demo"

key-files:
  created:
    - apps/web/components/tree/TreeAudit.tsx
    - apps/web/components/tree/WeeklyDrops.tsx
    - tools/verify_p5.py
    - orchestration/verify/p5/dom-assert.txt
    - orchestration/verify/p5/tree.png
    - orchestration/verify/p5/community.png
    - orchestration/verify/p5/settings.png
  modified:
    - apps/web/components/tree/MyTree.tsx
    - apps/web/app/(app)/community/page.tsx
    - apps/web/app/(app)/settings/page.tsx
    - apps/web/components/settings/SettingsSection.tsx

key-decisions:
  - "TreeAudit lit le contrat localStorage skilltree.installs.v1 / event skilltree:installs via un hook local (clone du pattern lib/progress.ts), sans importer lib/installs.ts (03-01) — couplage par contrat de cle, pas par code partage"
  - "WeeklyDrops reutilise FRESH_DROPS (vide tant que P6/state reel n'existe pas) au lieu d'inventer un chiffre de drops"
  - "Community : ajout d'un H1 'Communaute' + sous-titre manquant (aucune vue n'avait de heading avant), pour coherence avec les 2 autres vues et le critere de fidelite headings"
  - "Settings : h1 'REGLAGES' (casse forcee) corrige en 'Reglages' pour coherence typographique avec Mon arbre / Communaute"
  - "Membre 47 $/mois + facturation Stripe (pas Whop) confirmes intentionnels par docs/ARCHITECTURE.md D8 — la capture montre 49 $/Whop mais c'est un choix produit deja tranche, pas une derive"

patterns-established:
  - "Fan-out wave 1 : consommer un contrat localStorage d'un plan frere sans importer son module (clé + event nommés identiquement, vérifié après coup contre lib/installs.ts une fois écrit par 03-01)"

# Metrics
duration: ~50min
completed: 2026-07-08
---

# Phase 3 Plan 04: My Tree / Community / Settings Summary

**TreeAudit réactif aux installs locaux (compteur 0→1 sans reload) via un helper localStorage découplé de 03-01, + Community/Settings alignés aux captures avec sections a11y labellisées.**

## Performance

- **Duration:** ~50 min
- **Started:** 2026-07-08T00:15:00Z (approx.)
- **Completed:** 2026-07-08T00:46:00Z
- **Tasks:** 3/3
- **Files modified:** 7 (4 créés, 3 modifiés) + 5 fichiers de preuve

## Accomplissements
- `/tree` : ConnectMachine (commande + copier) + rangée de stats réactive (« Installés N/137 ») + « Drops de la semaine » + TreeAudit qui recalcule son compteur dès qu'un skill est installé, sans reload, via un helper local qui lit (sans l'importer) le contrat localStorage de 03-01.
- `/community` : H1 + sous-titre ajoutés (absents avant ce plan), bandeau « 100 premiers » conservé, feed (composer + 6 posts, avatars initiales, âge relatif, réactions).
- `/settings` : Compte (Membre · 47 $/mois), Sécurité, Facturation (placeholder Stripe D8), Zone de danger — 4 sections désormais avec `aria-labelledby` (régions labellisées).
- Preuves Playwright réelles (`tools/verify_p5.py`) : build+serveur réel `:3010`, 6 checks tous PASS, dont le compteur TreeAudit prouvé 0→1 sans reload et « 47 $/mois » présent.

## Task Commits

1. **Task 1: My Tree — ConnectMachine + stats + WeeklyDrops + TreeAudit réactif** - `17bcce4` (feat)
2. **Task 2: Community + Settings fidèles aux captures** - `5db1a9e` (feat)
3. **Task 3: Preuves Playwright — orchestration/verify/p5/** - `7eb1090` (test)

_Note : pas de plan metadata commit séparé distinct de la Task 3 — dom-assert.txt et les 3 PNG sont livrés dans le commit de preuve lui-même._

## Files Created/Modified
- `apps/web/components/tree/TreeAudit.tsx` - helper local `useInstalledSlugs()` (lit `skilltree.installs.v1` + `skilltree:installs`, sans importer `lib/installs.ts`) + rendu de l'audit (installés réels + fallback "autonome" étiqueté séparément)
- `apps/web/components/tree/WeeklyDrops.tsx` - bandeau « Drops de la semaine », réutilise `FRESH_DROPS` du catalogue (pas de chiffre inventé)
- `apps/web/components/tree/MyTree.tsx` - recomposition : ConnectMachine + stats réactives + WeeklyDrops + TreeAudit
- `apps/web/app/(app)/community/page.tsx` - H1 + sous-titre ajoutés, bandeau 100 premiers avec `role="note"`
- `apps/web/app/(app)/settings/page.tsx` - H1 casse corrigée (« Réglages »)
- `apps/web/components/settings/SettingsSection.tsx` - `aria-labelledby` dérivé du titre sur chaque section
- `tools/verify_p5.py` - suite Playwright (style `verify_p1.py`), 6 checks PASS/FAIL
- `orchestration/verify/p5/{dom-assert.txt,tree.png,community.png,settings.png}` - preuves rendu réel

## Decisions Made
Voir `key-decisions` en frontmatter. Le point le plus important : le TreeAudit et MyTree lisent le contrat localStorage `skilltree.installs.v1` / event `skilltree:installs` sans jamais importer `apps/web/lib/installs.ts` (propriété du plan 03-01/Hub) — vérifié après coup en lisant le fichier réel une fois écrit par l'agent parallèle, la clé et l'event correspondent exactement à ce qui était anticipé dans la NOTE du frontmatter du plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing a11y] Sections Settings sans région labellisée**
- **Found during:** Task 2
- **Issue:** `SettingsSection` rendait un `<section>` avec un `<h2>` mais sans lien `aria-labelledby`, ne satisfaisant pas explicitement la contrainte a11y « régions labellisées » du plan.
- **Fix:** Ajout d'un id dérivé du titre + `aria-labelledby` sur chaque `<section>`.
- **Files modified:** `apps/web/components/settings/SettingsSection.tsx`
- **Committed in:** `5db1a9e` (Task 2 commit)

**2. [Rule 1 - Bug/fidélité] Community sans heading H1**
- **Found during:** Task 2
- **Issue:** La page `/community` n'avait aucun titre visible (juste le bandeau), contrairement aux 2 autres vues et à la capture `nav_community.png` qui montre un H1 « Community ».
- **Fix:** Ajout d'un `<header><h1>Communauté</h1><p>...</p></header>` avant le bandeau.
- **Files modified:** `apps/web/app/(app)/community/page.tsx`
- **Committed in:** `5db1a9e` (Task 2 commit)

---

**Total deviations:** 2 auto-fixés (1 a11y, 1 fidélité visuelle/heading)
**Impact on plan:** Les deux corrections renforcent la fidélité aux captures et l'accessibilité sans ajouter de portée hors plan.

## Issues Encountered
- **Faux négatif transitoire (verify_p5.py FAIL puis PASS)** : la première exécution du Task 3 a échoué sur le check "compteur après install" alors que le code était correct — cause racine : exécution en wave 1 parallèle (5 agents sur le même worktree), un autre plan (Modules/Hub) modifiait `.next`/le code au même instant que mon `pnpm build && next start`, produisant un bundle client obsolète/mélangé. Diagnostic confirmé en isolant un test Playwright minimal avec logs `console.log` : l'event `skilltree:installs` était bien reçu par un listener brut injecté, mais le hook React ne se ré-rendait pas sur ce build précis. Après un rebuild propre (retry loop tolérant les échecs de build concurrents d'autres agents wave-1, cf. contrainte connue de l'exécution fan-out) et un redémarrage serveur isolé, le même test est repassé PASS de façon reproductible — confirmant que c'était un artefact de build partagé, pas un bug de code. Logs de debug retirés avant commit (aucun `console.log` résiduel).
- **`pkill -f "next start"` provoquait un abort du outil Bash (exit 144)** sans raison apparente (aucun process ne matchait pourtant) — contourné en tuant le process par PID exact via `ss -ltnp` plutôt que par pattern-match, et en démarrant le serveur avec `nohup ... & disown` plutôt qu'un sous-shell backgroundé. Aucun impact sur le code livré, juste sur la mécanique d'exécution locale.

## User Setup Required
None - aucune configuration de service externe requise.

## Next Phase Readiness
- Les 3 vues restantes de la Phase 3 sont livrées et prouvées ; avec 03-01/03-02/03-03/03-05 (exécutés en parallèle dans la même fenêtre), la Phase 3 est proche de complétion totale (vérifier `.planning/phases/03-vues-modules-ui/` pour les 5 SUMMARY).
- Point d'attention Phase 4 (Supabase/API réel) : le contrat `skilltree.installs.v1` (clé + event) devra être remplacé par `/api/me` côté TreeAudit ET côté Hub simultanément — actuellement découplé par choix (wave 1 sans dépendance de fichier), à re-coupler explicitement à ce moment-là.
- Aucun blocage.

---
*Phase: 03-vues-modules-ui*
*Completed: 2026-07-08*

## Self-Check: PASSED

- 11/11 fichiers déclarés trouvés sur disque (TreeAudit.tsx, WeeklyDrops.tsx, MyTree.tsx, community/page.tsx, settings/page.tsx, SettingsSection.tsx, tools/verify_p5.py, dom-assert.txt, tree.png, community.png, settings.png).
- 3/3 commits de tâche trouvés dans l'historique git (`17bcce4`, `5db1a9e`, `7eb1090`).
- `pnpm build` + `pnpm typecheck` verts avant le dernier commit.
- `tools/verify_p5.py` exécuté sur serveur réel `:3010` : 6/6 checks PASS, exit 0.
