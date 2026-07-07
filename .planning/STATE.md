# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-08)

**Core value:** La roue-constellation rend le catalogue 137 jobs navigable et fidèle à l'original, en FR — si tout le reste échoue, la Map + le catalogue consolidé doivent fonctionner.
**Current focus:** Phase 2 — Hero constellation (roue Map)

## Current Position

Phase: 2 of 6 (Hero constellation) — COMPLETE + VERIFIED (passed 4/4)
Plan: 2 of 2 in current phase — 02-02 complete
Status: Phase 2 terminée. Prochain : Phase 3 (5 plans fan-out parallèle) — /gsd:plan-phase 3.
Last activity: 2026-07-08 — 02-02 exécuté (JobPanel FR + a11y/LOWFX + verify_p1.py 15/15 PASS, 4 commits 65f373d→85ef7c9), vérif indépendante gsd-verifier passed 4/4. ⚠️ push origin main EN ATTENTE (bloqué par classifier auto-mode, à débloquer par l'user).

Progress: [███░░░░░░░] 27% (3/11 plans)

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

### Pending Todos

None yet.

### Blockers/Concerns

- Incohérence de comptage source : REQUIREMENTS.md annonçait « 27 total » mais contient 30 IDs de requirements v1 distincts. Corrigé dans la traceability (coverage 30/30). À vérifier si des reqs manquent au regard du périmètre.

## Session Continuity

Last session: 2026-07-08
Stopped at: 02-01-PLAN.md (Phase 2) exécuté et vérifié — voir .planning/phases/02-hero-constellation/02-01-SUMMARY.md
Resume file: None — prochaine étape : exécuter 02-02-PLAN.md (JobPanel + preuves MAP-03/04)
