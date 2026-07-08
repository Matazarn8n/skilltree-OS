# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-08)

**Core value:** La roue-constellation rend le catalogue 137 jobs navigable et fidèle à l'original, en FR — si tout le reste échoue, la Map + le catalogue consolidé doivent fonctionner.
**Current focus:** Phase 2 — Hero constellation (roue Map)

## Current Position

Phase: 3 of 6 (Vues & modules UI) — EN EXÉCUTION (fan-out wave 1, 5 exécuteurs parallèles)
Plan: 03-02 (Modules) + 03-03 (Brain) + 03-04 (My Tree/Community/Settings) exécutés et vérifiés — 03-01/03-05 en cours en parallèle (voir leurs SUMMARY respectifs)
Status: Phase 2 poussée origin/main. Phase 3 planifiée (5 plans 03-01..03-05, 0 overlap, 14/14 requirements) puis mise en exécution fan-out. 03-02 (Modules) complet : coverage.md 18/18, stepper/reader branchés progress.ts, verify_p3.py 8/8 PASS. 03-03 (Brain) complet : wizard 8 sections, 2 chemins IA/manuel, draftBrain() stub, verify_p4.py 19/19 PASS. 03-04 (My Tree/Community/Settings) complet : TreeAudit réactif aux installs locaux (compteur 0→1 sans reload, contrat localStorage lu sans importer lib/installs.ts de 03-01), Community H1 ajouté, Settings sections labellisées, verify_p5.py 6/6 PASS.
Last activity: 2026-07-08 — 03-04-PLAN.md exécuté (3 tâches, 3 commits 17bcce4/5db1a9e/7eb1090) + vérifié (build exit 0, verify_p5.py 6/6 PASS, dont compteur TreeAudit prouvé 0→1 sans reload). Voir .planning/phases/03-vues-modules-ui/03-04-SUMMARY.md.

Progress: [███░░░░░░░] 27%+ (3/8 plans exécutés avant Phase 3 ; 03-02+03-03/5 plans Phase 3 confirmés exécutés, décompte final après fan-out complet)

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: ~29 min
- Total execution time: ~1.0 hour

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 1 | ~25min | ~25min |
| 2 | 1 | ~33min | ~33min |

**Recent Trend:**
- Last 5 plans: 01-01 (~25min), 02-01 (~33min)
- Trend: stable

*Updated after each plan completion*
| Phase 02-hero-constellation P01 | 33min | 3 tasks | 17 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table (D1-D9).
Recent decisions affecting current work:

- D1: Adopter prototype `apps/web` + rebrancher (pas refondre) — 18 leçons FR déjà payées.
- D2: Vérité = skills.json 137 ; extras CHART tagués `origin='chart'`.
- D9: Ids jobs = slugs anglais stables, FR = affichage ; req résolus au build, échec = échec build.

**Décisions Plan 01-01 (Phase 1) :**
- Sortie build_catalog.mjs verrouillée = `apps/web/lib/catalog/{catalog.json,types.ts}` (types.ts généré, bandeau ne-pas-éditer) ; `lib/types.ts` devient un simple ré-export.
- `apps/web/lib/catalog/index.ts` = accesseur unique du catalogue (remplace `lib/data.ts`, supprimé) ; 10/10 sites de consommation rebranchés.
- Ligne PASS d'assert-graph.mjs reformattée aux 8 tokens exacts (`jobs=`/`chart_total=`/`chart_human=`) sans toucher aux invariants internes.
- [Phase 02-hero-constellation]: Géométrie constellation paramétrée (sectors/jobs en args) = source unique testable Node strip-types et importable Next
- [Phase 02-hero-constellation]: SectorSlug 'back-office' (générateur + contracts corrigés — bug zod 500 latent sur /api/catalog)
- [Phase 02-hero-constellation]: Roue : labels secteur radialement à R_MAX+45, labels jobs masqués en vue roue (aria-label les porte), R_SECTOR_MAX=1000
- [Phase 03-vues-modules-ui Plan 02]: Stepper.tsx repurposé (module-selector statique → stepper de leçons dans un module, wired sur useProgress().isComplete/countDone) ; compteur X/N + aria-current="step" + clic navigue.
- [Phase 03-vues-modules-ui Plan 02]: LessonReader.tsx a son propre bouton "Marquer comme terminé" (idempotent, sans navigation) distinct du bouton "terminé & continuer" de LessonNav — découple marquage/navigation pour une preuve Playwright non-racée.
- [Phase 03-vues-modules-ui Plan 02]: 1 seul gap réel sur 18 leçons (start-here/tool-stack, section Meetings/Fireflies) — comblé en FR neuve, anti-verbatim vérifié.
- [Phase 03-vues-modules-ui Plan 03]: Eyebrows sections 2-8 traduits depuis l'enum `brain_section` (pas les captures — `brain_section_2..8.json` sont identiques à la section 1, capture originale bloquée sur validation, jamais progressée).
- [Phase 03-vues-modules-ui Plan 03]: Vérification de build isolée dans un git worktree détaché + port dédié — le fan-out parallèle sur `apps/web/.next` partagé provoque des `ChunkLoadError` si plusieurs plans buildent/servent en même temps sur le même dossier.
- [Phase 03-vues-modules-ui Plan 04]: TreeAudit lit le contrat localStorage `skilltree.installs.v1`/`skilltree:installs` (03-01) via un helper local, sans importer `lib/installs.ts` — couplage par clé/event, pas par code partagé, conforme au wave 1 sans dépendance de fichier.
- [Phase 03-vues-modules-ui Plan 04]: Build partagé `apps/web/.next` en fan-out : un retry loop tolérant les échecs de build concurrents (autres agents mid-édition) + build/start immédiats l'un après l'autre suffit, pas besoin systématique de worktree isolé si on retente rapidement.

### Pending Todos

None yet.

### Blockers/Concerns

- Incohérence de comptage source : REQUIREMENTS.md annonçait « 27 total » mais contient 30 IDs de requirements v1 distincts. Corrigé dans la traceability (coverage 30/30). À vérifier si des reqs manquent au regard du périmètre.

## Session Continuity

Last session: 2026-07-08
Stopped at: 03-04-PLAN.md (Phase 3, My Tree/Community/Settings) exécuté et vérifié — voir .planning/phases/03-vues-modules-ui/03-04-SUMMARY.md
Resume file: None — les autres plans du fan-out (03-01/03-05) s'exécutent en parallèle ; après leur complétion, lire orchestration/verify/p{1,3,4,5}/ + les SUMMARY restants, puis suivre docs/10_HANDOFF_PHASE3.md (revue fidélité tier-fort, gsd-verifier, push origin main).
