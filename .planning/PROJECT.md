# SkillTree-OS

## What This Is

Reconstruction perso FR de **SkillTree** (SaaS Altari, altari.ai/skilltree, abonnement Member actif) : plateforme d'apprentissage gamifiée pour monter une « AI workforce » avec Claude Code — carte-constellation de 137 jobs sur 7 secteurs, 78 skills installables, 18 leçons, module Brain. Fidélité = structure exacte + contenu FR **réécrit** (jamais verbatim). Intégrable à terme dans l'écosystème HERMES-OS ; visé multi-tenant revendable (gate : perso stable).

## Core Value

La roue-constellation (hero) rend l'ensemble du catalogue 137 jobs navigable et fidèle à l'original, en FR — si tout le reste échoue, la Map + le catalogue consolidé doivent fonctionner.

## Requirements

### Validated

- ✓ Dataset capturé + agrégé + vérifié (G1/G2 pass) : 7 secteurs, 34 fonctions, 137 jobs, 78 skills, 6 dashboards, chart 165/36 human-led — existing (phases 1-2 pipeline)
- ✓ Docs d'architecture tranchées D1-D9 (`docs/ARCHITECTURE.md`), plan P0-P8 (`docs/PLAN.md`), spec visuelle observée (`docs/07_VISUAL_SPEC.md`) — existing
- ✓ Prototype `apps/web` Next 15 : shell sidebar, 9 routes, 18 leçons FR réécrites — existing (à rebrancher, D1)

### Active

- [ ] Catalogue consolidé buildé depuis `data/*.json` avec invariants assertés (137/78/7, chart 165/36)
- [ ] Vue MAP : roue-constellation SVG 7 fans, 137 nœuds, panel job complet, a11y + LOWFX
- [ ] Vues DASHBOARDS (6 command centers démo déterministe) et CHART (matrice rollout stage×level)
- [ ] Hub : checklist, drops, most installed, community pulse, ⌘K, modale install
- [ ] Modules : 18 leçons FR + stepper + progression
- [ ] Brain : wizard 8 sections, chemins IA/manuel
- [ ] My Tree, Community, Settings
- [ ] Backend : Supabase (RLS), auth, routes user, Stripe-ready (PERSONAL_MODE), draft LLM via gateway :8765
- [ ] Onboarding : tour 6 étapes + parcours + Cal.com

### Out of Scope

- Copie verbatim du contenu (prose leçons/fiches) — réinterprétation FR uniquement, produit tiers sous abonnement
- Drip-release simulé des skills (13/78 live) — tout exposé en perso ; champ `released_at` conservé pour réactiver en SaaS
- Sync Brain ↔ Cortex Obsidian — frontière state produit / mémoire infra (export one-way éventuel plus tard)
- Multi-tenant au-delà du RLS — gate : perso stable 30 j (aligné milestone SaaS HERMES)
- Redis / cache distribué — state user petit, mesurer avant

## Context

- Source de vérité data : `data/skills.json` (137, stage+stage_name mergés), `data/tree.json`, `data/skill_files.json` + `captures/skill_files_full/*.md` (78), `data/dashboards.json` (PRNG exécuté, seed 20260611, déterministe), `data/chart.json` (corrigé 2026-07-07 : 7/7, 165, 36 human-led ; `Sales.stages=[]` → fallback stage_name). Manifeste : `orchestration/dataset.json`.
- Références visuelles : `captures/**` (roue, panels, dashboards, chart, brain wizard, hub, leçons) — index dans `docs/07_VISUAL_SPEC.md`.
- Deux régimes de données jamais mélangés : catalogue statique buildé (ISR/CDN) vs state user (Postgres/Supabase, jamais caché CDN).
- Écosystème : gateway LLM HERMES `:8765` (OAuth Max) pour `/api/brain/draft` ; repo standalone `~/projects/skilltree-OS` (convention projets), remote Matazarn8n à créer.
- Pipeline amont (capture/agrégation) : `docs/05_ORCHESTRATION_SPEC.md`, phases 1-3 faites et vérifiées.

## Constraints

- **Légal/éthique** : produit tiers payant — structure fidèle OK, prose réécrite obligatoire, pas de redistribution d'assets
- **Tech stack** : Next.js 15 App Router + TS + Tailwind 4 (prototype existant, original aussi Next/Vercel) ; Supabase Postgres + Auth ; Stripe (flag) ; pas de lib de graphe (SVG + trigo)
- **Perf** : roue 137 nœuds a crashé mobile Safari chez l'original → LOWFX <700px + `prefers-reduced-motion` dès P1, non négociable
- **Vérification** : anti-faux-positif global — chaque phase prouvée sur rendu réel (screenshot/DOM/rows DB), jamais build vert seul
- **Modèles (GSD)** : opus-4-8/high = archi (P1 géométrie, P6 schéma+RLS) ; sonnet-4-6/medium = impl ; haiku-4-5/low = lookups ; handoff auto si changement de modèle inter-phases

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| D1 Adopter prototype `apps/web` + rebrancher (pas refondre) | 18 leçons FR déjà payées, shell/tokens réutilisables ; data hardcodée seule à jeter | — Pending |
| D2 Vérité = skills.json 137 ; extras CHART tagués `origin='chart'` | roue jamais polluée par la réconciliation ; total rollout 165 comme l'original | — Pending |
| D3 Dashboards = démo déterministe (seed 20260611) jusqu'à P6+ | comportement exact de l'original ; swap de source derrière `CommandCenterData` | — Pending |
| D4 Catalogue fichiers buildés (pas DB) ; upgrade si édition collaborative | lecture massive écriture rare ; git = source de vérité | — Pending |
| D5 Supabase RLS par user dès le schéma initial | multi-tenant natif, coût nul aujourd'hui | — Pending |
| D6 Hero = 3 vues natives (MAP/DASHBOARDS/CHART) derrière switcher `?view=` | pas d'iframe ; livrables indépendants | — Pending |
| D7 LLM via gateway :8765, provider swappable | zéro clé dans l'app ; rate-limit/user obligatoire (quota partagé crons) | — Pending |
| D8 Stripe P6 derrière `PERSONAL_MODE=true` | schéma Stripe-ready sans complexité opérationnelle avant la version vendue | — Pending |
| D9 Ids jobs = slugs anglais stables, FR = affichage | stabilité liens + traçabilité source ; req résolus au build, échec = échec build | — Pending |
| Repo standalone (sorti du repo $HOME) | convention projets (~/projects = repos dédiés, remote Matazarn8n) ; historique amont reste dans $HOME jusqu'à e2c8aa5 | — Pending |

---
*Last updated: 2026-07-07 after initialization (contexte importé de docs/ARCHITECTURE.md + PLAN.md + 07_VISUAL_SPEC.md)*
