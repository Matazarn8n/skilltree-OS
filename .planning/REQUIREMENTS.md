# Requirements: SkillTree-OS

**Defined:** 2026-07-08
**Core Value:** La roue-constellation rend le catalogue 137 jobs navigable et fidèle à l'original, en FR.

## v1 Requirements

### Data / Catalogue

- [ ] **DATA-01**: Le build génère `apps/web/lib/catalog/` typé depuis `data/*.json` (sectors 7, functions 34, jobs 137, skills 78, chart 165, dashboards 6), ids stables slugifiés, `req` résolus
- [ ] **DATA-02**: `assert-graph` fait échouer le build sur tout invariant violé (comptes, req non résolu, skill sans md, chart≠165/human≠36, incohérence summaries)
- [ ] **DATA-03**: L'app ne contient plus aucune donnée catalogue hardcodée (`lib/data.ts` supprimé, pages branchées catalogue)

### Map (hero)

- [ ] **MAP-01**: La roue affiche 7 fans + 137 nœuds + hub central, layout radial fidèle (couleurs secteur, labels serif, vue all-departments + zoom secteur)
- [ ] **MAP-02**: Clic nœud → panel job complet FR (level, desc, BREAKS INTO, BUILDS ON cliquable, WHAT IT REPLACES, LADDER 3 niveaux, THE HUMAN, fichier skill)
- [ ] **MAP-03**: Navigation clavier complète (Tab/Enter sur les 137 nœuds, aria-labels, contraste AA)
- [ ] **MAP-04**: `prefers-reduced-motion` coupe les animations et viewport <700px active LOWFX
- [ ] **MAP-05**: Switcher MAP · DASHBOARDS · CHART piloté par `?view=`, shareable

### Dashboards & Chart

- [ ] **DASH-01**: Les 6 command centers rendent stats/deltas/sparklines/tables depuis `dashboards.json`, chiffres identiques aux captures (démo déterministe étiquetée)
- [ ] **CHART-01**: Matrice rollout par secteur : 4 stages nommés × 3 bandes level, 165 jobs dont 36 human-led (badge Ongoing), tabs 7 secteurs
- [ ] **CHART-02**: Les résumés « N of M jobs run autonomously » sont recalculés depuis la donnée, pas copiés

### Hub

- [ ] **HUB-01**: Sections complètes FR : header compteur skills, GET STARTED 5 étapes, Modules, Fresh drops + Featured, Most installed, Community pulse, Build logs
- [ ] **HUB-02**: Recherche ⌘K sur jobs+skills (catalogue en mémoire) avec navigation vers résultat
- [ ] **HUB-03**: Skill cliquable → modale « Installer le skill → » qui installe (state local avant backend, interface `install(slug)`)

### Modules / Leçons

- [ ] **MOD-01**: 18 leçons FR alignées structurellement sur les captures (matrice de couverture 18/18 écrite), jamais verbatim
- [ ] **MOD-02**: Stepper 3 modules + progression : marquer une leçon done avance le stepper et persiste

### Brain

- [ ] **BRAIN-01**: Wizard 8 sections, une question par écran, barre de progression, Back/Continue
- [ ] **BRAIN-02**: Deux chemins d'entrée : « Draft avec l'IA » (interface `draftBrain()`) et « Je l'écris moi-même »
- [ ] **BRAIN-03**: Save par section avec badge source `ai|manual`, persistant au reload

### Tree / Community / Settings

- [ ] **TREE-01**: My Tree : connect machine (commande git), stats, weekly drops, TreeAudit recalculé quand un skill est installé
- [ ] **COMM-01**: Community : feed conforme à la capture (état « first 100 »)
- [ ] **SET-01**: Settings : compte, plan Member $47/mo affiché, billing placeholder, logout

### Backend

- [ ] **BACK-01**: Schéma Supabase conforme ARCHITECTURE §5, RLS sur toutes les tables (user B ne lit pas user A — testé)
- [ ] **BACK-02**: Auth Supabase (email/password + magic link), session persistante
- [ ] **BACK-03**: Routes user réelles (`/api/me|progress|install|tree|brain|onboarding`) remplacent les stubs locaux ; routes catalogue sans requête DB
- [ ] **BACK-04**: `/api/brain/draft` appelle la gateway :8765 server-side, gated paid, rate-limit par user
- [ ] **BACK-05**: `/api/access` Stripe-ready derrière `PERSONAL_MODE=true` (paid forcé en perso)

### Onboarding

- [ ] **ONB-01**: Tour 6 étapes (overlay STEP X OF 6) persistant : reload à l'étape N reprend à N, skip → done
- [ ] **ONB-02**: Sélection de parcours (agency/business/company/exploring) + CTA Cal.com

### Qualité / Gel

- [ ] **QA-01**: Revue fidélité écran-par-écran vs captures + audit a11y + chasse verbatim, findings bloquants fixés, tag `v1-perso`

## v2 Requirements

### Extension

- **EXT-01**: Dashboards branchés sur vraie data user (swap derrière `CommandCenterData`)
- **EXT-02**: Stripe live (webhook actif, PERSONAL_MODE=false) + multi-tenant au-delà du RLS
- **EXT-03**: Export one-way Brain → notes markdown (Obsidian)
- **EXT-04**: Drip-release réactivé via `released_at` (mode SaaS)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Copie verbatim prose leçons/fiches | produit tiers sous abonnement — réécriture FR uniquement |
| Sync bidirectionnel Brain ↔ Cortex Obsidian | frontière state produit / mémoire infra |
| Redis / cache distribué | state user petit ; mesurer avant d'ajouter |
| Lib de graphe (d3-force…) | layout radial = trigo pure, SVG suffit |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 — Fondations data + scaffold | Pending |
| DATA-02 | Phase 1 — Fondations data + scaffold | Pending |
| DATA-03 | Phase 1 — Fondations data + scaffold | Pending |
| MAP-01 | Phase 2 — Hero constellation | Pending |
| MAP-02 | Phase 2 — Hero constellation | Pending |
| MAP-03 | Phase 2 — Hero constellation | Pending |
| MAP-04 | Phase 2 — Hero constellation | Pending |
| MAP-05 | Phase 2 — Hero constellation | Pending |
| HUB-01 | Phase 3 — Vues & modules UI | Pending |
| HUB-02 | Phase 3 — Vues & modules UI | Pending |
| HUB-03 | Phase 3 — Vues & modules UI | Pending |
| MOD-01 | Phase 3 — Vues & modules UI | Pending |
| MOD-02 | Phase 3 — Vues & modules UI | Pending |
| BRAIN-01 | Phase 3 — Vues & modules UI | Pending |
| BRAIN-02 | Phase 3 — Vues & modules UI | Pending |
| BRAIN-03 | Phase 3 — Vues & modules UI | Pending |
| TREE-01 | Phase 3 — Vues & modules UI | Pending |
| COMM-01 | Phase 3 — Vues & modules UI | Pending |
| SET-01 | Phase 3 — Vues & modules UI | Pending |
| DASH-01 | Phase 3 — Vues & modules UI | Pending |
| CHART-01 | Phase 3 — Vues & modules UI | Pending |
| CHART-02 | Phase 3 — Vues & modules UI | Pending |
| BACK-01 | Phase 4 — Backend | Pending |
| BACK-02 | Phase 4 — Backend | Pending |
| BACK-03 | Phase 4 — Backend | Pending |
| BACK-04 | Phase 4 — Backend | Pending |
| BACK-05 | Phase 4 — Backend | Pending |
| ONB-01 | Phase 5 — Onboarding | Pending |
| ONB-02 | Phase 5 — Onboarding | Pending |
| QA-01 | Phase 6 — Revue & gel v1 | Pending |

**Coverage:**
- v1 requirements: 30 total (le header initial annonçait 27 — recomptage réel = 30 IDs distincts)
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-08*
*Last updated: 2026-07-08 after roadmap creation (traceability, 30/30 mapped)*
