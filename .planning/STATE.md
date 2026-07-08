# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-08)

**Core value:** La roue-constellation rend le catalogue 137 jobs navigable et fidèle à l'original, en FR — si tout le reste échoue, la Map + le catalogue consolidé doivent fonctionner.
**Current focus:** Phase 2 — Hero constellation (roue Map)

## Current Position

Phase: 3 of 6 (Vues & modules UI) — 5/5 PLANS EXÉCUTÉS (fan-out wave 1 complet)
Plan: 03-01 (Hub) + 03-02 (Modules) + 03-03 (Brain) + 03-04 (My Tree/Community/Settings) + 03-05 (Dashboards/Chart) tous exécutés et vérifiés
Status: Phase 2 poussée origin/main. Phase 3 planifiée (5 plans 03-01..03-05, 0 overlap, 14/14 requirements) puis mise en exécution fan-out — les 5 plans sont maintenant complets. 03-01 (Hub) complet : 6 sections /hub (GET STARTED progression X/5, Modules, Fresh drops+Featured, Most installed, Community pulse, Build logs), install(slug) local (lib/installs.ts, localStorage skilltree.installs.v1 + event skilltree:installs), InstallModal FR branchée sur ⌘K (CommandBar rebranché sur les 78 SKILL_FILES), 78/78 fiches skills réécrites en français (content/skills/*.md), verify_p2.py 12/12 PASS. 03-02 (Modules) complet : coverage.md 18/18, stepper/reader branchés progress.ts, verify_p3.py 8/8 PASS. 03-03 (Brain) complet : wizard 8 sections, 2 chemins IA/manuel, draftBrain() stub, verify_p4.py 19/19 PASS. 03-04 (My Tree/Community/Settings) complet : TreeAudit réactif aux installs locaux (compteur 0→1 sans reload, contrat localStorage lu sans importer lib/installs.ts de 03-01), Community H1 ajouté, Settings sections labellisées, verify_p5.py 6/6 PASS. 03-05 (Dashboards/Chart) complet : CommandCenters (6 dashboards, seed 20260611) + RolloutMatrix (7 secteurs x 4 étapes x 3 niveaux, N of M recalculé via lib/chart.ts, jamais copié — 165/36 tombent du calcul, grep=0), les 2 derniers placeholders de MapView.tsx câblés, verify_p51.py 10/10 PASS.
Last activity: 2026-07-08 — 03-01-PLAN.md exécuté (3 tâches, commits ea90a57/9aa60d6/8ae1832 + correctif e37cd79) + vérifié (build exit 0, typecheck propre, verify_p2.py 12/12 PASS : 6 sections Hub, ⌘K→InstallModal→install(slug) persisté→réouverture "Installé", 78/78 fiches recomptées, anti-verbatim x3 ≤4 mots communs). Voir .planning/phases/03-vues-modules-ui/03-01-SUMMARY.md. Phase 3 fan-out wave 1 est maintenant COMPLET (5/5) — reste : gsd-verifier phase, revue fidélité tier-fort, push origin main (cf. docs/10_HANDOFF_PHASE3.md).

Progress: [████░░░░░░] 35% (3/8 plans exécutés avant Phase 3 + 5/5 plans Phase 3 exécutés = 8 plans exécutés/dénominateur à recalculer avec le total réel du projet 6 phases)

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
