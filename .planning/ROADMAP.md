# Roadmap: SkillTree-OS

## Overview

Reconstruction perso FR de SkillTree en 6 phases, dérivées du plan d'exécution `docs/PLAN.md` (P0-P8). On part d'une source de vérité data consolidée + le prototype `apps/web` rebranché (Phase 1), on livre le hero constellation fidèle (Phase 2), puis toutes les vues et modules UI en fan-out parallèle sur stubs locaux (Phase 3), on remplace les stubs par un vrai backend Supabase/auth/LLM (Phase 4), on ajoute l'onboarding (Phase 5), et on gèle v1 après une revue fidélité écran-par-écran (Phase 6). Fil rouge : anti-faux-positif — chaque phase est prouvée sur rendu réel (screenshot / assert DOM / row DB / compteur `assert-graph`), jamais sur un build vert seul.

## Phases

**Phase Numbering:**
- Integer phases (1-6): Planned milestone work (v1-perso)
- Decimal phases (2.1, …): Urgent insertions (marked INSERTED)

- [x] **Phase 1: Fondations data + scaffold** - Catalogue consolidé buildé + invariants assertés + prototype rebranché
- [ ] **Phase 2: Hero constellation** - Roue-constellation 137 nœuds + ViewSwitcher, a11y + LOWFX
- [ ] **Phase 3: Vues & modules UI** - Hub, Modules, Brain, Tree/Community/Settings, Dashboards/Chart (5 plans parallèles)
- [ ] **Phase 4: Backend** - Supabase RLS + auth + routes user + LLM draft + Stripe-ready
- [ ] **Phase 5: Onboarding** - Tour 6 étapes + sélection parcours + Cal.com
- [ ] **Phase 6: Revue & gel v1** - Passe fidélité + a11y + chasse verbatim, tag v1-perso

## Phase Details

### Phase 1: Fondations data + scaffold
**Goal**: Une seule source de vérité catalogue générée depuis `data/*.json` et le prototype `apps/web` adopté (tracké git) et branché dessus, plus aucune donnée hardcodée (D1, D2, D9).
**Depends on**: Nothing (first phase — dataset G2 déjà pass)
**Requirements**: DATA-01, DATA-02, DATA-03
**Model/Effort**: sonnet-4-6 / medium (script + rewire) ; revue fable-5
**Success Criteria** (what must be TRUE):
  1. `node tools/assert-graph.mjs` imprime `sectors=7 functions=34 jobs=137 skills=78 chart_extras=N req_unresolved=0 orphans=0` et fait échouer le build sur tout invariant violé (comptes, req non résolu, skill sans md, chart≠165/human≠36).
  2. `pnpm build` vert et `/hub` + `/modules` rendent depuis `apps/web/lib/catalog/` réel (assert DOM : un nom de job réel présent, ex. « Market Mapping » traduit, aucun slug inventé du prototype).
  3. `lib/data.ts` hardcodé supprimé, aucune donnée catalogue en dur ne subsiste ; screenshots des 2 pages sauvés dans `orchestration/verify/p0/`.
**Plans**: 1 plan

Plans:
- [ ] 01-01: build_catalog.mjs + assert-graph.mjs + suppression lib/data.ts + rewire pages (P0)

### Phase 2: Hero constellation
**Goal**: La roue-constellation fidèle (7 fans, branches radiales par fonction, 137 nœuds, hub central « Cerveau d'entreprise ») avec panel job complet FR, plus le shell 3 vues piloté par `?view=` (D6).
**Depends on**: Phase 1
**Requirements**: MAP-01, MAP-02, MAP-03, MAP-04, MAP-05
**Model/Effort**: fable-5 ou opus-4-8 / high (géométrie + interaction + a11y = composant le plus risqué) ; sous-tâches mécaniques sonnet-4-6
**Success Criteria** (what must be TRUE):
  1. Screenshot `/map` comparé à `captures/map_zoom/*.png` : 7 fans visibles, hub central, couleurs secteur exactes (layout radial trigo).
  2. Assert DOM : 137 nœuds focusables, `aria-label` non vides ; Tab parcourt secteur→job et Enter ouvre le JobPanel d'un job réel (level, desc, BREAKS INTO, BUILDS ON cliquable, WHAT IT REPLACES, LADDER 3 niveaux, THE HUMAN, fichier skill).
  3. Émulation `prefers-reduced-motion` → 0 animation (assert computed style) ; viewport 390px → mode LOWFX actif.
  4. Switcher MAP · DASHBOARDS · CHART piloté par `?view=`, shareable (placeholders EmptyState derrière). Preuves dans `orchestration/verify/p1/`.
**Plans**: 1 plan

Plans:
- [ ] 02-01: components/constellation (Wheel/Sector/Branch/Node/JobPanel) + ViewSwitcher + a11y/LOWFX (P1)

### Phase 3: Vues & modules UI
**Goal**: Toutes les vues et modules restants, fidèles aux captures, branchés sur le catalogue et des interfaces stub locales (`install`, `progress`, `draftBrain`) en attendant le backend. 5 plans en fan-out Sonnet parallèle (aucune dépendance croisée).
**Depends on**: Phase 1 (P5.1 requiert aussi le switcher de Phase 2)
**Requirements**: HUB-01, HUB-02, HUB-03, MOD-01, MOD-02, BRAIN-01, BRAIN-02, BRAIN-03, TREE-01, COMM-01, SET-01, DASH-01, CHART-01, CHART-02
**Model/Effort**: sonnet-4-6 / medium (impl) ; haiku-4-5 / low pour lookups leçon↔capture ; revue fable/opus avant intégration
**Success Criteria** (what must be TRUE):
  1. Hub : screenshot vs `captures/nav_hub.png` (GET STARTED 5 étapes, Modules, Fresh drops+Featured, Most installed, Community pulse, Build logs) ; ⌘K sur un nom de skill réel → résultat cliquable → modale « Installer le skill → » s'ouvre (assert DOM) ; `install(slug)` en state local.
  2. Modules : matrice 18/18 leçon↔capture écrite dans `orchestration/verify/p3/coverage.md` ; marquer une leçon done avance le stepper et persiste ; aucun verbatim.
  3. Brain : 8 sections rendues (assert DOM), édition+save d'une section persiste au reload (localStorage), badge source `ai|manual`, chemin manuel complet observé.
  4. My Tree / Community / Settings : screenshots vs `nav_tree.png` / `nav_community.png` / `nav_settings.png` ; TreeAudit change quand on installe un skill (compteur avant/après) ; Member $47/mo affiché.
  5. Dashboards : 6 command centers, chiffres identiques aux captures (démo déterministe seed 20260611) ; Chart : 7 secteurs dont Sales, résumés « N of M » recalculés = valeurs `assert-graph` (165/36, pas copiés). Les 78 fiches skills FR réécrites (compteur 78/78 + spot-check anti-verbatim).
**Plans**: 5 plans (fan-out parallèle)

Plans:
- [ ] 03-01: Hub — sections + ⌘K + InstallModal (P2, inclut batch réécriture 78 fiches skills FR)
- [ ] 03-02: Modules — audit+compléments 18 leçons FR + stepper + progression locale (P3)
- [ ] 03-03: Brain — wizard 8 sections + chemins ai/manual + save par section (P4)
- [ ] 03-04: My Tree + Community + Settings (P5)
- [ ] 03-05: Dashboards (6 command centers) + Chart (RolloutMatrix) (P5.1)

### Phase 4: Backend
**Goal**: State user réel : schéma Supabase + RLS + auth + routes user + LLM draft via gateway + Stripe-ready, remplaçant les stubs locaux de Phase 3 (D5, D7, D8).
**Depends on**: Phase 2 + Phase 3 (interfaces `install`/`progress`/`draftBrain` posées)
**Requirements**: BACK-01, BACK-02, BACK-03, BACK-04, BACK-05
**Model/Effort**: opus-4-8 / high (schéma + RLS + auth = irréversible) puis sonnet-4-6 / medium (routes + wiring)
**Success Criteria** (what must be TRUE):
  1. Schéma conforme ARCHITECTURE §5, RLS sur toutes les tables — testé : user B ne lit pas les rows de user A (requête qui DOIT échouer).
  2. Auth Supabase (email/password + magic link), session persistante ; parcours réel : signup → installer un skill → reload → toujours installé (row Postgres vérifiée, compteur avant/après).
  3. Routes `/api/me|progress|install|tree|brain|onboarding|access` remplacent les stubs ; routes catalogue = 0 requête DB (assert logs).
  4. `/api/brain/draft` renvoie un draft réel via gateway `:8765` server-side (log gateway + contenu non-gabarit), gated paid, refuse au-delà du rate-limit ; `/api/access` Stripe-ready derrière `PERSONAL_MODE=true` (paid forcé en perso). Preuves dans `orchestration/verify/p6/`.
**Plans**: 2 plans

Plans:
- [ ] 04-01: schema.sql + RLS + Supabase Auth (opus-4-8 / high — irréversible)
- [ ] 04-02: routes user + /api/brain/draft (gateway :8765) + /api/access Stripe-ready + swap interfaces (sonnet-4-6 / medium)

### Phase 5: Onboarding
**Goal**: Tour 6 étapes + sélection de parcours + CTA Cal.com, fidèle à `captures/dynamic/`, persistant côté serveur.
**Depends on**: Phase 2 (le tour pointe la roue) + Phase 4 (persistance `/api/onboarding`)
**Requirements**: ONB-01, ONB-02
**Model/Effort**: sonnet-4-6 / medium
**Success Criteria** (what must be TRUE):
  1. Tour complet cliqué de 1 à 6 (overlay STEP X OF 6 : map → path → open a job → that's the skill) — séquence de screenshots.
  2. Reload à l'étape 3 → reprend à 3 (row onboarding vérifiée) ; skip → `done=true`.
  3. Sélection de parcours (agency/business/company/exploring) + CTA Cal.com + landing post-login. Preuves dans `orchestration/verify/p7/`.
**Plans**: 1 plan

Plans:
- [ ] 05-01: overlay tour 6 étapes + sélection parcours + Cal.com + persistance (P7)

### Phase 6: Revue & gel v1
**Goal**: Passe fidélité + qualité écran-par-écran avant gel, findings bloquants fixés, tag `v1-perso`.
**Depends on**: Phases 1-5
**Requirements**: QA-01
**Model/Effort**: fable-5 / high
**Success Criteria** (what must be TRUE):
  1. Rapport `orchestration/verify/p8/review.md` : comparaison écran-par-écran vs `captures/` (checklist), audit a11y (clavier complet, AA, reduced-motion), chasse au verbatim (diff sémantique spot-check fiches/leçons), perf roue (desktop fluide, LOWFX mobile).
  2. Rapport sans finding bloquant ouvert ; tout finding bloquant → fix commité + re-vérifié avant tag.
  3. Tag `v1-perso` appliqué.
**Plans**: 1 plan

Plans:
- [ ] 06-01: revue croisée fidélité + a11y + verbatim + perf, fixes bloquants, tag v1-perso (P8)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 (5 plans ∥) → 4 → 5 → 6

Dépendances (acyclique, de `docs/PLAN.md`) :
```
P1 ─┬─ P2 ─┬─ P3.05 ─┐
    ├─ P3.01 ┤        │
    ├─ P3.02 ┼─ P4 ───┼─ P5 ── P6
    ├─ P3.03 ┤        │
    ├─ P3.04 ┤        │
    └────────┘        │
```

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fondations data + scaffold | 0/1 | Not started | - |
| 2. Hero constellation | 0/1 | Not started | - |
| 3. Vues & modules UI | 0/5 | Not started | - |
| 4. Backend | 0/2 | Not started | - |
| 5. Onboarding | 0/1 | Not started | - |
| 6. Revue & gel v1 | 0/1 | Not started | - |
