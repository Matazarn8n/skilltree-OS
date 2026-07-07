# SkillTree-OS — Master plan & architecture

> Raisonnement lead tech sur 5 ans. Décisions tranchées + tradeoffs notés. Priorité : simplicité qui scale, pas de sur-ingénierie prématurée.

## 0. Contrainte de départ = la donnée dicte l'archi

Le produit d'origine sert **toute sa donnée en fichiers statiques** (`content.js`, `app-map.html`, `skill-meta.js`, `skill-previews.js`) + quelques APIs minces (`/api/access`, `/api/onboarding`, `/api/token`). Le state utilisateur (progression, paid) est côté serveur mince. **Insight** : le catalogue skill-tree est **quasi-statique, lecture massive, écriture rare** (drops hebdo). La progression user est petite et par-utilisateur. → deux régimes de données opposés, à ne pas mélanger.

## 1. Décisions d'architecture (tranchées)

| # | Décision | Choix | Tradeoff |
|---|---|---|---|
| A1 | Rendu | **Next.js (App Router) + React** | SSR/SSG pour le SEO des pages skill + streaming pour les leçons. Le produit d'origine est déjà Next sur Vercel — pas de raison de diverger. |
| A2 | Catalogue skill-tree (secteurs/fonctions/jobs/skills/edges) | **Contenu versionné en fichiers (JSON/MDX) buildés en statique**, pas en DB | Lecture massive + écriture rare (drops) = un CMS/DB serait de la complexité inutile. `git = source de vérité`, build = ISR. Upgrade path : passer en DB quand les drops deviennent multi-auteurs/temps réel. `ponytail: fichiers d'abord, DB si l'édition devient collaborative`. |
| A3 | State utilisateur (progression, brain, installs) | **Postgres (Supabase)** | Petit, relationnel, par-user. Le produit d'origine tourne déjà Supabase-friendly. |
| A4 | Auth | **Supabase Auth** (email/password + magic link) | Le produit d'origine a `/api/token` + email/password. Pas réinventer. |
| A5 | Paiement | **Stripe** (abonnement Member) | `/api/access` renvoie `paid`. 1 webhook → flag `paid` en DB. |
| A6 | La Map (roue constellation) | **SVG + animation CSS, données injectées au build**, dégradé LOWFX < 700px | C'est le hero. Le rendu d'origine est SVG (pas canvas/WebGL) avec `LOWFX` mobile. On garde SVG (accessible, stylable, pas de dépendance graphe). `ponytail: pas de lib de graphe, layout radial = trigo`. |
| A7 | Brain (interview 8 sections) | **Form + endpoint LLM optionnel** (draft-with-AI) | Le "draft" appelle un LLM ; le "type myself" est un simple form. LLM = 1 endpoint, gated derrière `paid`. |

## 2. Modèle de données

### 2a. Catalogue (statique, buildé) — `data/*.json` (produit par l'agent parse)
```
Sector   { id, name, sub, color, intro, order }
Function { id, sectorId, name, order }
Job      { id, functionId, name, desc, human, replaces, req:[jobId],
           ladder:{manual,assisted,autonomous}, notes, skillSlugs:[], integrations:[] }
Skill    { slug, title, what, needs, category, previewMd, jobId }
Edge     = dérivé de Job.req (job → prereq). HUB='company-knowledge-base' = racine.
```
Invariant : `req` référence des jobs existants ; validé au build (script `assert-graph.mjs`).

### 2b. State utilisateur (Postgres)
```sql
users(id, email, paid bool, plan, created_at)
progress(user_id, lesson_id, status enum(locked,in_progress,done), completed_at)   -- 18 lessons
installs(user_id, skill_slug, installed_at)                                          -- skills "installés"
brain(user_id, section enum(...8), content text, source enum(ai,manual), updated_at) -- 8 sections
tree_state(user_id, job_id, level enum(manual,assisted,autonomous,none))             -- avancement par job
onboarding(user_id, path enum(agency,business,company,exploring), step int, done bool)
```
Index : `progress(user_id)`, `installs(user_id)`, `tree_state(user_id)`. Tout est par-user et petit → pas de sharding, pas de cache distribué avant longtemps.

## 3. API (endpoints)
| Méthode | Route | Rôle | Source |
|---|---|---|---|
| GET | `/api/tree` | catalogue complet (secteurs→jobs→skills) | **statique/ISR** (pas la DB) |
| GET | `/api/skill/[slug]` | preview markdown d'un skill | statique |
| GET | `/api/me` | user + paid + progression agrégée | DB |
| POST | `/api/progress` | marque une leçon done | DB |
| POST | `/api/install` | installe un skill | DB |
| GET/PUT | `/api/brain` | lire/écrire les 8 sections | DB |
| POST | `/api/brain/draft` | draft LLM depuis site+notes (gated paid) | LLM |
| GET/POST | `/api/onboarding` | parcours + étape | DB |

Règle : les routes catalogue ne touchent JAMAIS la DB (cache CDN long). Les routes user ne sont JAMAIS mises en cache CDN.

## 4. Stratégie de cache (mesurée, pas spéculative)
- **Catalogue** : SSG + ISR (revalidate hebdo, aligné sur les "drops"). Sert depuis le CDN Vercel. Coût DB = 0.
- **`/api/me`, progression** : pas de cache CDN ; `SWR`/React Query côté client avec revalidation. Cache mémoire par requête.
- **`/api/tree` côté client** : mis en cache immutable (le catalogue ne change pas dans une session).
- **Brain draft LLM** : pas de cache (contenu unique). Rate-limit par user.
- `ponytail: pas de Redis avant que /api/me soit un point chaud mesuré. Le state user est trop petit et trop personnel pour un cache partagé aujourd'hui.`

## 5. Architecture composants (frontend)
```
app/(app)/
  layout.tsx            → Sidebar (nav) + shell, gate paid
  map/page.tsx          → <ConstellationWheel sectors={tree}/>  (hero)
  hub/page.tsx          → <FirstWeekChecklist/> <ModuleCards/> <FreshDrops/> <MostInstalled/> <CommunityPulse/>
  modules/page.tsx      → <ModulePath/> (stepper) + <ModuleCard/>
  modules/[m]/[l]/page.tsx → <Lesson/> (MDX) + <LessonNav/>
  tree/page.tsx         → <ConnectMachine/> <TreeAudit/> <WeeklyDrops/>
  brain/page.tsx        → <BrainInterview sections={8}/> (ai | manual)
  community/page.tsx    → <Feed/>
  settings/page.tsx     → <Account/> <Billing/>
components/
  constellation/  Wheel, Sector, Branch, Node, NodeTooltip   ← le hero, isolé
  skill/          SkillCard, SkillModal, LadderBar, CommandCenterPreview
  ui/             Sidebar, Button, Badge, Search(⌘K), EmptyState, ErrorState, Skeleton
```
Principes : composants pilotés par **données** (une prop `sector`/`skill`/`job`), pas par murs de booléens. Chaque module gère explicitement **loading (Skeleton) / vide (EmptyState) / erreur (ErrorState)**. A11y : nav clavier sur la roue (les nœuds = `<a>`/`<button>` focusables avec `aria-label`), contraste AA sur le dark theme, `prefers-reduced-motion` coupe les anims (miroir du LOWFX d'origine).

## 6. Roadmap (séquencée par module, modèle+effort GSD)

| Phase | Livrable | Modèle/effort | Dépend de |
|---|---|---|---|
| P0 | Scaffold Next+TS+Tailwind, sidebar shell, data/*.json intégrés | sonnet/medium | agent parse |
| P1 | **Constellation FR** (hero) : roue 7 secteurs, nœuds, tooltip, node→skill panel. States+a11y | fable/opus + sonnet | P0 |
| P2 | Hub FR : checklist, module cards, fresh drops, most installed, community pulse | sonnet/medium | P0 |
| P3 | Modules + 18 leçons FR (MDX, réécrites) + stepper + progression | sonnet/medium | P0 |
| P4 | Brain FR : interview 8 sections, ai/manual, states | sonnet/medium | P0 |
| P5 | My Tree + Community + Settings FR | sonnet/medium | P0 |
| P6 | Backend : Supabase schema + routes user + Stripe + LLM draft | fable/opus archi, sonnet impl | P1-P5 |
| P7 | Onboarding tour 6 étapes + Cal.com | sonnet/medium | P1 |

Chaque phase-module est indépendante après P0 → **fan-out Sonnet en parallèle**, revue Fable 5.

## 7. Risques scaling identifiés (challengés)
- **Roue à 137 nœuds × animations** : crashait mobile Safari chez l'original → `LOWFX`. On reprend le garde-fou dès P1 (pas après). `prefers-reduced-motion` + virtualisation des dots.
- **Couplage UI/brain** : garder le Brain comme *source de données* consommée par les skills (relation `req:[HUB]`), pas un état global partagé. Frontière nette : Brain = DB user, catalogue = statique.
- **Structure du skill-tree qui ne scale pas** : `req` (arêtes) en champ de job = OK tant que le catalogue est fichier. Si multi-auteurs/temps réel → migration DB (A2 upgrade path), pas avant.
- **Contenu leçons verbatim** = hors périmètre (décision #3) : réécriture FR, pas copie.
