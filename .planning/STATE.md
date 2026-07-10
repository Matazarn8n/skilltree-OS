# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-08)

**Core value:** La roue-constellation rend le catalogue 137 jobs navigable et fidèle à l'original, en FR — si tout le reste échoue, la Map + le catalogue consolidé doivent fonctionner.
**Current focus:** Phase 5 — Onboarding (planifiée, plan-checker 0 blocker) ; prêt pour `/gsd:execute-phase 5`

## Current Position

Phase: 5 of 6 (Onboarding) — PLANIFIÉE (05-01, plan-checker 0 blocker après fix sélecteur onb-next). Phases 1-4 COMPLETE + VERIFIED, poussées origin/main @ bae10db.
Plan: 04-01 (schéma/RLS/auth) + 04-02 (routes/draft/swap) exécutés + vérifiés (2026-07-10). 05-01 planifié, non exécuté.
Status: Phase 4 (Backend Supabase) COMPLETE + VERIFIED — gsd-verifier 5/5 + verify_p6.py 17/17 sur requêtes réelles : Supabase LOCAL docker (6 tables/5 enums/RLS auth.uid() contre-preuve rouge), auth SSR (@supabase/ssr, service-role SERVER-ONLY), 7 routes user + `/api/brain/draft` (SEUL point LLM, gateway :8765 via `X-Internal-Token` seul — 0 clé Anthropic, 403 gated / 429 rate-limit / 502 no-fallback), `/api/access` PERSONAL_MODE force paid (D8), stripe stub 501. Swap localStorage→/api signatures gelées (cache module + hook), diff composants = TreeAudit + BrainWizard seulement (MyTree 0-diff via re-export). Preuves : install row Postgres 0→1 persiste au reload, draft proxy_calls 0→1 contenu non-gabarit, catalogue 0-DB. Décision auditée : draftBrain async → await honnête dans BrainWizard (pas de fire-and-forget masquant une panne gateway). Phase 5 planifiée (05-01 : tour 6 étapes persistant /api/onboarding + 4 parcours enum + CTA Cal.com lien externe + landing gate + verify_p7).
Last activity: 2026-07-10 — Phase 4 exécutée INLINE (subagents gsd-executor meurent ~600s) : commits acce328 (04-01) + b66ff3b (04-02) + summaries + 04-VERIFICATION.md, push d1ac857. Puis `/gsd:plan-phase 5` (planner opus + plan-checker sonnet 0 blocker, fix sélecteur), push bae10db. Prochain pas : `/gsd:execute-phase 5` INLINE. Puis Phase 6 (gel v1) + refonte visuelle Fable 5 (docs/12_HANDOFF_FABLE_REFONTE_VISUELLE.md).

Progress: [██████░░░░] 67% (10/~11 plans exécutés : 01-01, 02-01/02, 03-01..05, 04-01/02 = 10 exécutés ; reste 05-01 + 06-01)

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
| Phase 03-vues-modules-ui P01 | 55min | 3 tasks | 94 files |

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
- [Phase 03-vues-modules-ui Plan 05]: Ligne Human-led de la matrice CHART toujours badgée « En continu » (jamais un numéro d'étape), même pour les jobs `origin='map'` porteurs d'un `stage` réel — fidèle à la capture source où tous les human-led affichent Ongoing.
- [Phase 03-vues-modules-ui Plan 05]: Anti-fabrication stricte même en commentaire — le grep de preuve (`165|36` sur lib/chart.ts) a détecté des chiffres cités en toutes lettres dans les commentaires d'intention ; reformulés par référence à `assert-graph.mjs EXPECT.*` plutôt que par valeur littérale.
- [Phase 03-vues-modules-ui Plan 05]: Contention `.next`/port 3010 confirmée à nouveau (cf. Plan 03) quand plusieurs plans buildent/servent en même temps ; cette fois résolue par un `git worktree` jetable dédié (au lieu du retry loop de Plan 04) car le symptôme (hydratation morte, clics sans effet) nécessitait un process totalement isolé, pas juste un rebuild réussi.
- [Phase 03-vues-modules-ui Plan 01]: `lib/skill-files.ts` (fs) ne doit JAMAIS être importé depuis un composant "use client" (bundle navigateur Next.js) — lu une seule fois dans un Server Component (`app/(app)/layout.tsx`), passé en props sérialisables aux Client Components. Pattern réutilisable pour toute future lecture fichier côté UI.
- [Phase 03-vues-modules-ui Plan 01]: CommandBar rebranché sur `SKILL_FILES` (78 fiches installables), pas `SKILLS` (137 jobs Map) — deux registres de slugs différents ; `install(slug)`/`getSkillFile(slug)` doivent pointer sur celui de `content/skills/`.
- [Phase 03-vues-modules-ui Plan 01]: Piège serveur stale confirmé une nouvelle fois : `pkill -f "next start"` ne tue pas le process (titre réel = "next-server"), toujours vérifier/tuer le PID exact via `ss -ltnp` avant de relancer une preuve.
- [Phase 03-vues-modules-ui Plan 01]: Course d'écriture git entre exécuteurs parallèles (`branching_strategy=none`) : un `git add` de dossier peut scooper un fichier untracked d'un autre plan créé entre-temps — toujours vérifier `git show --stat` du commit juste après pour repérer un fichier hors scope, corriger par `git rm --cached` immédiat si besoin.

### Pending Todos

None yet.

### Blockers/Concerns

- Incohérence de comptage source : REQUIREMENTS.md annonçait « 27 total » mais contient 30 IDs de requirements v1 distincts. Corrigé dans la traceability (coverage 30/30). À vérifier si des reqs manquent au regard du périmètre.

## Session Continuity

Last session: 2026-07-08
Stopped at: 03-01-PLAN.md (Phase 3, Hub) exécuté et vérifié — voir .planning/phases/03-vues-modules-ui/03-01-SUMMARY.md. Phase 3 fan-out wave 1 COMPLET (5/5 plans).
Resume file: None — les 5 plans de Phase 3 sont exécutés et vérifiés. Prochaine étape : lire orchestration/verify/p{1,2,3,4,5,51}/ + les 5 SUMMARY, puis suivre docs/10_HANDOFF_PHASE3.md (revue fidélité tier-fort, gsd-verifier, boucler gaps si besoin, push origin main), puis planifier Phase 4.
