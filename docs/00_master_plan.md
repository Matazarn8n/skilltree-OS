# SkillTree-OS — Plan maître (tech lead, horizon 5 ans)

> Reconstruction perso FR de SkillTree, intégrable HERMES-OS. Raisonnement lead technique :
> décisions, tradeoffs, risques de scaling, priorités. Fondations qui scalent sans sur-ingénierie.

## 0. Contrainte de cadre

Réinterprétation visuelle/comportementale FR — **pas** un clone du bundle ni copie verbatim du contenu de cours.
Structure/UX/états reproduits à l'identique ; prose des leçons/skills **réécrite en FR**. Données perso via compte payant propre.

## 1. Stack — décision & tradeoffs

L'original tourne sur **Next.js (SPA) + Supabase (auth Postgres + edge functions) + Vercel + PostHog**.
Décision : **s'aligner** dessus. Pourquoi — c'est déjà le chemin qui scale, l'écosystème HERMES-OS est déjà Supabase/Vercel-friendly, et ça évite d'inventer une infra.

| Couche | Choix | Alternative écartée | Raison |
|---|---|---|---|
| Front | **Next.js 15 App Router + React 19 + TS** | Vite SPA | SSR/SSG pour SEO marketing + RSC pour data, une seule codebase |
| Style | **Tailwind v4 + CSS variables (thème)** | CSS-in-JS | thème sombre/clair par variables, zéro runtime, cf. skill tailwind-theme-builder |
| Viz map | **SVG + D3-force (layout) rendu React** | Canvas/WebGL, lib graphe lourde | 7 secteurs × ~30 nœuds = petit ; SVG = nœuds DOM cliquables + a11y + no WebGL |
| État client | **URL + TanStack Query** | Redux/Zustand global | l'état = données serveur + route ; pas de store maison |
| Data/DB | **Supabase (Postgres + RLS + Auth)** | DB maison | RLS = multi-tenant natif (visé revendable), auth incluse |
| Contenu leçons | **MDX en repo** (versionné) | CMS | 18 leçons = contenu éditorial, MDX = DX + diff + pas d'appel réseau |
| Catalogue skills | **table Postgres `skills`** (seed JSON) | hardcodé | drops hebdo = données, pas du code |
| Cache | **RSC cache + Query staleTime + `unstable_cache` sur le catalogue** | Redis d'emblée | YAGNI Redis tant qu'un seul nœud ; upgrade path noté |

**ponytail** : pas de Redis, pas de microservices, pas de GraphQL au palier 1. Monolithe Next.js + Supabase. Le catalogue skills et l'état map (lus souvent, changent peu) → `unstable_cache`/ISR ; passer à Redis/edge-cache seulement si le trafic le prouve.

## 2. Modèle de données (le choix qui fait ou casse le scaling)

Le skill tree est **un graphe** (secteurs → skills, skills → prérequis). Piège à éviter : un JSON monolithique imbriqué (impossible à requêter/paginer/droper). → **tables relationnelles + arêtes explicites.**

```
sectors(id, slug, name, tagline, color, order_index)
skills(id, slug, name, sector_id, summary, autonomy, status,        -- status: live|drop|soon
       icon, install_count, published_at, build_guide_id, command_center_id)
skill_edges(from_skill_id, to_skill_id, kind)                        -- prérequis/branche (DAG)
skill_stages(skill_id, stage)                                        -- Foundation|Capture|Generate|Orchestrate (vue grille)
build_guides(id, skill_id, steps_jsonb)                              -- étapes numérotées + code
command_centers(id, skill_id, title, metrics_jsonb, layout_jsonb)   -- dashboard produit

users(id=auth.uid, email, plan, persona, created_at)
user_skills(user_id, skill_id, installed_at)                        -- "My tree"
modules(id, slug, title, subtitle, order_index)
lessons(id, module_id, slug, title, order_index, mdx_ref, est_min)  -- corps = MDX en repo
user_progress(user_id, lesson_id, completed_at)
brains(user_id, sections_jsonb, source_url, drafted_by)             -- 8 sections
community_posts / community_events                                  -- v2
```

Positions de la map : **calculées** (D3-force seedé déterministe par `sector.order_index` + `skill_edges`), pas stockées — évite le drift et rend le layout responsive. `seed` fixe = layout stable entre sessions.

Décisions clés :
- **Arêtes séparées** (`skill_edges`) → droper un skill = 1 insert, pas une réécriture d'arbre.
- **`status`** porte les « fresh drops » : requête `status='drop' order by published_at`.
- **RLS** dès le départ : `user_skills`/`user_progress`/`brains` scoping par `auth.uid()` → multi-tenant gratuit.
- **JSONB** seulement pour ce qui est vraiment sans schéma (steps de guide, metrics de dashboard), pas pour les entités.

## 3. Flux de données (utilisateur → progression → brain → persistance)

```
Onboarding → POST /api/persona (what brings you here) → users.persona
Map (/) → GET catalogue (sectors+skills+edges, caché) → D3 layout → render SVG
  clic nœud → panneau skill (build_guide + command_center, cachés)
  Install → POST /api/skills/:id/install → user_skills (RLS)
Modules → MDX statique + GET /api/my-progress → marque lesson done → user_progress
Brain → POST /api/brain/draft {url,notes} → LLM (gateway HERMES :8765) → brains.sections (8)
My tree → GET /api/my-tree = user_skills ⨝ skills ; audit = diff catalogue/installés
```

Le **Brain draft** = seul appel LLM ; il passe par la gateway OAuth HERMES (`:8765`, jamais Smart Router). Reste = CRUD Postgres.

## 4. Design API (routes)

```
POST /api/auth/*            Supabase (délégué)
GET  /api/catalog           sectors + skills + edges + stages   (cache 5 min, public)
GET  /api/skills/:slug      détail + build_guide + command_center
POST /api/skills/:id/install / DELETE                          (RLS)
GET  /api/my-tree           skills installés + audit
GET  /api/my-progress ; POST /api/lessons/:id/complete
POST /api/persona ; GET/POST /api/onboarding
POST /api/brain/draft ; GET/PUT /api/brain
GET  /api/community/*       (v2)
```
Contrats typés partagés (Zod) front/back. Erreurs normalisées `{error, code}`.

## 5. Architecture des composants (front)

```
app/
  (marketing)/            landing publique (SSG, SEO)
  (app)/                  shell authentifié
    layout.tsx            <Sidebar/> + <CommandBar ⌘K/> + <ThemeToggle/>
    map/                  <SkillMap/> (hero)
    hub/                  <Hub/> (drops, featured, most-installed, pulse)
    modules/[m]/[l]/      <LessonReader/> (MDX)
    tree/  brain/  community/  settings/
components/
  map/  SkillMap · Sector · SkillNode · SkillPanel · MapControls · StageGrid
  skill/ SkillCard · InstallButton · AutonomyBadge · BuildGuide · CommandCenter
  ui/    Sidebar · CommandBar · Button · Sheet · Tabs · Stepper · ProgressBar · EmptyState · Skeleton
  lesson/ LessonReader · LessonNav · CodeBlock · Callout
```

Principes (ingénieur senior, pas mur de props booléens) :
- Composants pilotés par **données** (`skill`, `sector`) + **variants** (cva), pas 10 flags.
- **États explicites partout** : `loading` (Skeleton) / `empty` (EmptyState : « aucun skill installé ») / `error` (retry) / edge (0 nœud, secteur vide, leçon verrouillée).
- **A11y** : map = SVG avec `role=tree`, nœuds focusables clavier + `aria-label`, panneau = `Sheet` focus-trap, contraste AA sur les deux thèmes, `prefers-reduced-motion` coupe les animations de constellation.
- **DX** : chaque composant a une API typée + un exemple d'usage (`.stories`-like en commentaire ou fichier `examples`).

## 6. Séquençage du build (roadmap GSD, par modules)

| Phase | Livrable | Modèle/effort | Dépend de |
|---|---|---|---|
| **P0** Fondations | scaffold Next+TS+Tailwind, thème sombre/clair, Sidebar+CommandBar shell, tokens design | Fable5/high | — |
| **P1** Data+API | schéma Supabase + seed catalogue (skills capturés) + routes catalog/skills/my-tree + Zod | Fable5/high | P0 |
| **P2** Map (hero) | SkillMap SVG + D3-force, 7 secteurs, SkillNode, SkillPanel, StageGrid, états | Fable5/high | P1 |
| **P3** Hub | Hub : fresh drops, featured, most-installed, community pulse, quick-install | Sonnet/medium | P1,P2 |
| **P4** Modules | LessonReader MDX, stepper, progress, 18 leçons FR réécrites | Sonnet/medium // | P1 |
| **P5** Brain | interview 8 sections, draft LLM (gateway), review/edit | Sonnet/medium | P1 |
| **P6** My tree + onboarding | connect machine, audit, tour 6 étapes, persona | Sonnet/medium // | P2,P4 |
| **P7** Settings/Community/polish | compte, billing stub, community feed, a11y pass, e2e | Sonnet/medium | tous |

Parallélisable (sous-agents Sonnet) : P4, P6 indépendants ; P3/P5 après P1. P0-P2 = moi (archi/hero).

## 7. Risques de scaling anticipés

- **Layout map** : D3-force en O(n²) — OK à 200 nœuds, pré-calcul serveur + cache si le catalogue explose. `ponytail: force layout côté client tant que <300 nœuds, sinon layout pré-calculé caché.`
- **Catalogue lu à chaque map** : caché (ISR/`unstable_cache`), invalidé au drop. Pas de N+1 (une requête jointe).
- **Contenu leçons en MDX** : scale éditorialement mais un CMS deviendra utile >50 leçons — upgrade path, pas maintenant.
- **Multi-tenant (revendable)** : RLS dès P1 ; le jour SaaS = ajouter `org_id`, pas refondre.
- **LLM Brain** : coût/quota — gater derrière la gateway + rate-limit par user (cf. règles HERMES cron/quota).

## 8. Ce qu'on ne construit PAS au palier 1 (YAGNI explicite)

Redis · microservices · GraphQL · websockets community temps réel · éditeur de skills · builder de command center custom · i18n multi-langue (FR seul) · app mobile native. Chacun a un point de déclenchement noté ; aucun n'est pré-câblé.
