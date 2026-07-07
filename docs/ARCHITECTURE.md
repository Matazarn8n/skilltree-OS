# SkillTree-OS — Architecture cible

> Phase 4 (Fable 5, 2026-07-07). Source : `orchestration/dataset.json` (G2 pass), `docs/02_MASTER_PLAN.md`, `data/*.json`, `captures/**`. Reconstruction fidèle en structure, contenu FR réécrit. Ce document tranche les forks restants et fixe l'architecture que `docs/PLAN.md` exécute.

## 0. État des lieux (constaté sur disque, pas supposé)

| Actif | État | Conséquence |
|---|---|---|
| `data/tree.json` (7 secteurs, 34 fonctions, 137 jobs), `data/skills.json` (137 jobs enrichis, stage 1-4 + stage_name mergés), `data/skill_files.json` (78 skills), `data/dashboards.json` (6 command centers, PRNG exécuté, déterministe seed 20260611), `captures/skill_files_full/*.md` (78) | ✅ vérifié (comptes conformes, 0 orphelin) | Source de vérité catalogue |
| `data/chart.json` | ⚠️ **incomplet** : 6/7 secteurs (Sales absent — présent dans `captures/chart/sales.json`, 26 jobs mais `stages:[]`) ; jobs human-led absents (0 `level=human` alors que dataset.json annonce des extras CHART) | Réconciliation obligatoire en P0 (voir §7) |
| `apps/web/` prototype Next 15 + React 19 + Tailwind 4 (non-tracké git) | ⚠️ partiel : 9 routes + ~30 composants + design tokens + **18 leçons FR déjà réécrites** (`content/lessons/`, 3 modules × {8,5,5}) ; mais `lib/data.ts` = ~20 skills inventés à la main, map = StageGrid (pas la roue), aucune lecture de `data/*.json` | **Adopter + rebrancher** (D1), pas refondre |
| `supabase/schema.sql` | ⚠️ obsolète : modélise les inventions du prototype (`skill_stage enum('foundation','capture','generate','orchestrate')`, `status`, `install_count` en catalogue) — diverge de la vraie donnée (stage 1-4 nommé par secteur, level `manual/assisted/autonomous/human`, catalogue statique hors DB) | Refonte en P6 sur le modèle §5 |

## 1. Décisions tranchées (fork → choix → tradeoff)

| # | Fork | Choix | Tradeoff assumé |
|---|---|---|---|
| D1 | Prototype `apps/web` : garder ou refondre ? | **Adopter le shell** (routes, layout sidebar, tokens dark/serif, 18 leçons FR, composants lesson/settings/community) et **rebrancher la donnée** : `lib/data.ts` hardcodé → catalogue généré depuis `data/*.json`. La map StageGrid est remplacée par la constellation (P1). | On hérite de choix de nommage du prototype (slugs FR) à réaligner sur les 137 vrais jobs ; moins cher que refondre (18 leçons FR = le plus gros du contenu déjà payé). Si le rebranchage révèle un couplage trop fort, on jette `lib/data.ts` et ses consommateurs seulement — pas le shell. |
| D2 | Source de vérité catalogue : map 137 vs CHART 165 | **`data/skills.json` (137) = vérité**. Les jobs CHART absents de la map sont ajoutés au build, taggés `level='human'` + `origin:'chart'`, rendus dans la vue CHART uniquement (la roue reste à 137). | On accepte que le total « rollout » (165) ≠ total roue (137), comme l'original. Un job CHART mal réconcilié n'infecte jamais la roue. |
| D3 | Dashboards : PRNG démo vs vraie data | **Démo déterministe** (data/dashboards.json, seed figé) servie en statique jusqu'à P6 inclus. Post-P6, brancher les vrais chiffres user est un swap de source derrière la même interface `CommandCenterData`. | La démo ment (chiffres fictifs) — assumé : c'est le comportement exact de l'original, et c'est étiqueté démo. |
| D4 | Catalogue : fichiers buildés vs DB | **Fichiers versionnés buildés en statique** (git = source de vérité, ISR/CDN). Upgrade path DB uniquement si édition multi-auteurs/temps réel. | Un drop de contenu = commit + rebuild (pas d'édition en ligne). Voulu : lecture massive, écriture rare. |
| D5 | State user | **Postgres (Supabase) + RLS par user dès le schéma initial** — multi-tenant natif pour la cible revendable, coût nul aujourd'hui. | RLS = un peu de friction dev (policies à tester) ; évite une migration multi-tenant douloureuse plus tard. |
| D6 | Hero : 3 vues | **MAP / DASHBOARDS / CHART = 3 vues natives d'une même page** derrière un switcher, chacune un composant isolé consommant le catalogue. Pas d'iframe. | La vue CHART dépend de la réconciliation D2 ; elle est livrable indépendamment (P5.1) sans bloquer la roue. |
| D7 | LLM (Brain draft) | **Gateway HERMES `:8765`** (`/api/llm/complete`, OAuth Max, alias fast/balanced/deep) appelée server-side par `/api/brain/draft`. Pas de clé Anthropic dans l'app. | Couplage à l'infra perso — accepté en mono-user ; pour la version revendable, l'appel LLM est déjà isolé dans un provider swappable (une fonction, une URL). |
| D8 | Paiement | **Stripe en P6** mais derrière un flag : en mode perso `paid=true` forcé (pas de webhook actif). Le schéma et la route `/api/access` sont Stripe-ready dès P6. | On code un chemin qu'on n'exerce pas tout de suite ; le flag évite de payer la complexité opérationnelle avant la version vendue. |
| D9 | Identité des jobs | Les jobs sont keyés par **nom anglais** dans la source (`"Market Mapping"`). Au build : `id = slugify(nom_source)` **stable et immuable**, le nom FR est une traduction d'affichage. `req[]` résolu en ids au build, échec de résolution = échec de build. | Les slugs restent anglais dans les URLs — assumé : stabilité des liens > esthétique FR, et ça garde la traçabilité vers la source. |

## 2. Vue d'ensemble

```
                       ┌──────────────────────────────────────────────┐
                       │              Next.js App Router               │
                       │                                              │
  data/*.json ──build──▶  lib/catalog/  (généré, typé, validé)        │
  captures/chart/*.json │      │                                       │
        │               │      ▼                                       │
  tools/build_catalog   │  Pages statiques (SSG/ISR) :                 │
  + assert-graph        │   /map (MAP·DASHBOARDS·CHART) /hub /modules  │
                       │   /modules/[m]/[l]  (MDX FR)                 │
                       │      │                                       │
                       │      ▼            ┌────────────────────────┐ │
                       │  Routes user ────▶│ Supabase Postgres (RLS)│ │
                       │  /api/me /progress│ users progress installs│ │
                       │  /api/install     │ brain tree_state       │ │
                       │  /api/brain[/draft]│ onboarding            │ │
                       │      │            └────────────────────────┘ │
                       │      ▼                                       │
                       │  HERMES gateway :8765 (LLM draft, gated paid)│
                       └──────────────────────────────────────────────┘
```

**Deux régimes de données, jamais mélangés** :
- **Catalogue** (secteurs/fonctions/jobs/skills/edges/dashboards démo/leçons) : buildé depuis `data/`, servi statique/ISR, zéro requête DB, cache CDN long.
- **State user** (progression, installs, brain, tree_state, onboarding, paid) : Postgres, jamais caché CDN, SWR côté client.

## 3. Composants & services

### 3.1 Le hero — page `/map`, 3 vues
- **`<ViewSwitcher/>`** : MAP · DASHBOARDS · CHART (état URL `?view=`, shareable).
- **MAP — `<ConstellationWheel/>`** : roue SVG, 7 fans (`W_STEP = 360/7`), branches radiales par fonction, 137 nœuds job, hub central « Cerveau d'entreprise » (Company Knowledge Base, racine `req`). Layout radial = trigonométrie pure, **pas de lib de graphe** (d3-force retiré des deps si non utilisé). Couleurs secteur de `tree.json` (Sales #FF9D5C…). Interactions : hover tooltip (nom, level, stage), clic → `<JobPanel/>` latéral (desc FR, ladder manual→assisted→autonomous, replaces, skills → fiches, intégrations, prérequis cliquables). **Garde-fous dès P1** : `prefers-reduced-motion` + seuil LOWFX <700px (anims coupées, dots simplifiés) — l'original crashait mobile Safari sans ça. A11y : nœuds = `<button>` focusables `aria-label`, navigation clavier secteur→fonction→job, contraste AA.
- **DASHBOARDS — `<CommandCenters/>`** : les 6 command centers de `data/dashboards.json` (Meta Ads, HubSpot Pipeline, Content, Client Delivery…) : stats + deltas + tables, données démo déterministes (D3). Référence visuelle : `captures/dashboards/*_full.png`.
- **CHART — `<RolloutMatrix/>`** : matrice par secteur : 4 stages nommés par secteur (ex. Deals : Triage & route → Capture the call → Build the close → Keep pipeline honest), jobs positionnés stage × level, résumé « N of M jobs run autonomously ». Source : catalogue réconcilié D2 (137 + extras human CHART). Référence : `captures/chart/*__matrix.png`, `*__expanded.png`.

### 3.2 Modules applicatifs
- **Hub `/hub`** : `<FirstWeekChecklist/>` (5 étapes), `<ModuleCards/>`, `<FreshDrops/>`, `<FeaturedThisWeek/>`, `<MostInstalled/>`, `<CommunityPulse/>`, `<BuildLogs/>`, recherche `⌘K` (catalogue en mémoire, pas d'API), skill cliquable → `<InstallModal/>`.
- **Modules `/modules`, `/modules/[m]/[l]`** : stepper 01 Start Here (8) / 02 Foundations (5) / 03 Second Brain (5) = 18 leçons FR (déjà écrites dans le prototype, à auditer contre `captures/lessons/` pour couverture structurelle), `<LessonReader/>` + `<LessonNav/>` + progression.
- **Brain `/brain`** : interview **8 sections**, deux chemins : « Draft avec l'IA » (D7) vs « Je l'écris moi-même » (form) ; chaque section = éditeur + source (`ai|manual`) + save par section.
- **My Tree `/tree`** : `<ConnectMachine/>` (commande git), stats, `<WeeklyDrops/>`, `<TreeAudit/>` (« ton arbre, calculé » — dérivé de `tree_state` + installs).
- **Community `/community`** : feed simple (local d'abord, D5 le rend multi-user plus tard).
- **Settings `/settings`** : compte, plan (Member $47/mo affiché), billing Stripe (D8), logout.
- **Onboarding** : tour 6 étapes (overlay STEP X OF 6 : map → path → open a job → that's the skill), choix de parcours (agency/business/company/exploring), CTA Cal.com « Strategy Call ». Persisté via `/api/onboarding`.

### 3.3 Composants transverses
`components/ui/` : Sidebar (WORKSPACE : Map · Hub · Modules · My tree · Brain · Community · avatar→Settings), Button, Badge, Search(⌘K), **EmptyState / ErrorState / Skeleton** — chaque module gère explicitement loading/vide/erreur. Composants pilotés par données (prop `job`/`skill`/`sector`), pas par murs de booléens.

## 4. Flux de données

1. **Build** : `tools/build_catalog.mjs` lit `data/tree.json + skills.json + skill_files.json + dashboards.json + captures/chart/*.json` → émet `apps/web/lib/catalog/*.json` typé + validé (`assert-graph` : 137 jobs, 78 skills, 7 secteurs, req 100 % résolus, 0 orphelin — comptes du manifeste). Échec d'invariant = échec de build (P2 anti-faux-positif).
2. **Session** : pages catalogue rendues SSG/ISR ; le client reçoit le catalogue une fois, immuable en session.
3. **User → progression** : action (leçon finie, skill installé, niveau job changé) → `POST /api/progress|install|tree` → Postgres (RLS) → SWR revalide `/api/me` → UI (checklist Hub, TreeAudit, stepper) se recalcule côté client à partir de `me + catalogue`.
4. **Brain** : form → `PUT /api/brain` (par section) ; « Draft IA » → `POST /api/brain/draft` → gateway :8765 → draft pré-rempli → l'user édite → save. Le Brain est **une source de données consommée** par le reste (racine `req` du graphe), pas un état global partagé.
5. **Paid** : `GET /api/access` → `{paid}` depuis DB (webhook Stripe en mode vendu, flag forcé en mode perso, D8). Gate le draft LLM et les fichiers skills complets.

## 5. Schéma DB (Postgres/Supabase — remplace `supabase/schema.sql`)

Le catalogue **n'est pas en DB** (D4). La DB ne référence le catalogue que par identifiants stables (D9), validés au build.

```sql
create table users (
  id uuid primary key references auth.users,
  email text not null,
  paid bool not null default false,
  plan text not null default 'member',
  created_at timestamptz not null default now()
);

create type lesson_status as enum ('locked','in_progress','done');
create table progress (
  user_id uuid references users(id),
  lesson_id text not null,              -- 'start-here/welcome' … (18, validés vs catalogue au build)
  status lesson_status not null default 'in_progress',
  completed_at timestamptz,
  primary key (user_id, lesson_id)
);

create table installs (
  user_id uuid references users(id),
  skill_slug text not null,             -- 78 slugs catalogue
  installed_at timestamptz not null default now(),
  primary key (user_id, skill_slug)
);

create type brain_section as enum ('company','offer','customers','voice','ops','stack','goals','constraints'); -- 8, noms finaux calés sur captures/dynamic en P4
create type brain_source  as enum ('ai','manual');
create table brain (
  user_id uuid references users(id),
  section brain_section not null,
  content text not null default '',
  source brain_source not null default 'manual',
  updated_at timestamptz not null default now(),
  primary key (user_id, section)
);

create type job_level as enum ('none','manual','assisted','autonomous');
create table tree_state (
  user_id uuid references users(id),
  job_id text not null,                 -- slug D9
  level job_level not null default 'none',
  updated_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create type onboarding_path as enum ('agency','business','company','exploring');
create table onboarding (
  user_id uuid primary key references users(id),
  path onboarding_path,
  step int not null default 0,          -- 0..6
  done bool not null default false
);
```
RLS sur toutes les tables : `user_id = auth.uid()` (D5). Index PK composites suffisent (tout est par-user et petit) — pas de sharding, pas de cache distribué avant mesure.

## 6. API

| Méthode | Route | Rôle | Source | Cache |
|---|---|---|---|---|
| GET | `/api/tree` | catalogue complet | statique (build) | CDN long, immutable en session |
| GET | `/api/skill/[slug]` | fiche skill (markdown FR) | statique | CDN ; contenu complet gated `paid` |
| GET | `/api/me` | user + paid + agrégats progression | DB | aucun CDN ; SWR client |
| POST | `/api/progress` | leçon done | DB | — |
| POST | `/api/install` | installer un skill | DB | — |
| POST | `/api/tree` | changer level d'un job | DB | — |
| GET/PUT | `/api/brain` | lire/écrire les 8 sections | DB | — |
| POST | `/api/brain/draft` | draft LLM (gated paid, rate-limit/user) | gateway :8765 | jamais |
| GET/POST | `/api/onboarding` | parcours + étape | DB | — |
| GET | `/api/access` | `{paid}` | DB (Stripe webhook → flag) | — |

Règle absolue : routes catalogue ne touchent **jamais** la DB ; routes user ne sont **jamais** en cache CDN.

## 7. Réconciliation des données (tranchée, à exécuter en P0)

Constat disque : `data/chart.json` = 6 secteurs (Sales manquant), 115 jobs, **0 job `level=human`** — alors que `dataset.json` annonce CHART=165 avec extras human-led, et `captures/chart/sales.json` contient bien les 26 jobs Sales (mais `stages:[]`).

**Décision (D2 opérationnalisée)** — le build P0 :
1. Prend `skills.json` (137) comme base : id, stage 1-4, stage_name, level, ladder, req, skills, files.
2. Recompose la vue CHART depuis `captures/chart/*.json` (7 fichiers secteur, dont sales) ; tout job CHART absent des 137 → ajouté `level='human'`, `origin='chart'`, visible vue CHART uniquement.
3. Répare les stages Sales depuis `captures/chart/sales.json`/source brute ; si irrécupérable → stage `null` + rendu « à trancher » plutôt qu'une invention.
4. `assert-graph.mjs` fait échouer le build si : jobs≠137 base, skills≠78, secteurs≠7, `req` non résolu, slug skill sans fichier md, ou total CHART recomposé incohérent avec les summaries par secteur (« N of M jobs »).

Dashboards : `data/dashboards.json` (PRNG exécuté, reproductible) = source directe de la vue DASHBOARDS (D3), aucun re-scrape nécessaire.

## 8. Intégration HERMES-OS

**Posture : standalone d'abord, ancré par contrats minces.** SkillTree-OS tourne seul ; HERMES s'y branche par 3 points, chacun une interface remplaçable :

| Ancrage | Aujourd'hui (perso) | Demain (multi-tenant) | Risque |
|---|---|---|---|
| **LLM** | `/api/brain/draft` → gateway `:8765` (OAuth Max, aliases fast/balanced/deep) — réutilise l'existant, zéro clé dans l'app | provider par tenant (clé API dédiée) derrière la même fonction `draftBrain()` | Quota abonnement partagé avec les crons existants → rate-limit par user obligatoire dès P6 ([[llm-cron-cost-guard]]) |
| **Auth** | Supabase Auth locale au produit | SSO/partage éventuel avec le shell HERMES via JWT commun | Ne PAS fusionner les auth maintenant : couplage prématuré, Supabase RLS suffit |
| **Brain ↔ Cortex Obsidian** | **Pas de sync**. Le Brain SkillTree = 8 sections produit en Postgres ; le Cortex Obsidian = mémoire HERMES. Export one-way possible plus tard (brain → notes markdown) | connecteur optionnel par tenant | Fusionner les deux = mélanger state produit et mémoire d'infra ; on garde la frontière |

**Contraintes multi-tenant (future SaaS)** : déjà couvertes par D5 (RLS), D7 (LLM provider isolé), D8 (Stripe-ready), D4 (catalogue partagé entre tenants par construction — statique). Le milestone SaaS HERMES (gate : perso stable 30 j) s'applique ici aussi : pas de travail multi-tenant au-delà du RLS avant ce gate.

## 9. Risques scaling & garde-fous

| Risque | Garde-fou | Quand |
|---|---|---|
| Roue 137 nœuds × anims → crash mobile (observé chez l'original) | LOWFX <700px + `prefers-reduced-motion` + pas de filtre SVG coûteux par nœud ; budget : interaction fluide desktop, dégradé statique mobile | **P1, pas après** |
| Couplage UI/Brain | Brain = données consommées via `req:[HUB]`, jamais de store global partagé | P4 |
| Structure catalogue qui ne scale pas | `req` en champ job = OK en fichiers ; migration DB seulement si édition collaborative (D4 upgrade path) | jamais avant le besoin |
| Faux-positifs de livraison | chaque phase du PLAN a un critère **observé** (screenshot/DOM/compteur), jamais un build vert seul ; `assert-graph` bloque le build sur comptes faux | toutes phases |
| Quota LLM partagé | rate-limit `/api/brain/draft` par user + gated paid | P6 |
| Contenu verbatim | leçons/fiches = réécriture FR (les 18 leçons FR existent déjà ; les 78 fiches skills sont à réécrire depuis `captures/skill_files_full/`, jamais copiées) | P3/P5.1 |
