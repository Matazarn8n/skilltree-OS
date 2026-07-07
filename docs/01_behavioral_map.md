# SkillTree — Carte comportementale (source: vidéo parcours + crawl authentifié)

> Reconstruction perso FR. Source vérité : `enregistrement_parcours_skill_tree_hub.mp4` (13:30, 60 frames)
> + crawl authentifié `skilltree-hub.vercel.app` (captures/ + captures/content/*.json).
> Statut contenu : **exact/verbatim capturé** = ✅ · **observé frames seulement** = 👁 · **inféré** = ~

## 1. Nature du produit

Plateforme d'apprentissage **gamifiée** (« skill tree ») pour monter une agence IA / une force de travail IA avec **Claude Code**. Modèle : abonnement (Member · $47/mo, Stripe). Thème sombre premium, une constellation radiale comme hero. Positionnement (verbatim Hub) : *« The build path, in order. Get Claude Code running, build the brain everything reads from, then hire your AI employees from the map and stand up your command centers. »*

## 2. Navigation (sidebar gauche, persistante) ✅

`SKILLTREE` (logo → /map) · **WORKSPACE** : Map · Hub `13` · Modules · My tree · Brain · Community
Bas de sidebar : avatar `RA` · email · `Member · Settings` · toggle `Light mode`.
Barre de commande globale : `Search the tree, find a skill, or jump to a job… ⌘K`.

| Item | Route | Rôle |
|---|---|---|
| Map | `/map` (et `/`) | Constellation des skills (hero) |
| Hub | `/hub` | Tableau de bord : drops, featured, most installed, community pulse |
| Modules | `/modules` | Parcours d'apprentissage (3 modules, 18 leçons) |
| My tree | `/tree` | Ton arbre perso : connect machine, drops hebdo, audit |
| Brain | `/brain` | Constructeur de base de connaissance (8 sections) |
| Community | `/community` | Forum / feed communautaire |
| Settings | `/settings` | Compte, plan, billing Stripe, logout |
| — | `/preview`, `/onboarding` | Post-login, tour guidé |

## 3. Onboarding 👁 (overlay 6 étapes + Cal.com)

1. **Welcome to SkillTree — "What brings you here?"** : *Start or grow an AI agency* / *Get AI built for my business* / *Bring AI into the company I work at* / *Just exploring for now*.
2. Tour guidé « STEP n OF 6 » en tooltips (The map → open a job → that's the skill …), boutons Skip / Next.
3. **Path reveal** : *"You're building the thing businesses pay $5–15k for."* → CTA `Show me the agency path →`.
4. **30-Minute Strategy Call** (widget Cal.com, FR-localisé) : form First/Last name, Work Email, Phone, Company, Website URL, Annual Business Revenue, *"Have you worked with an AI agency before?"* Yes/No → *« Votre réservation a été envoyée »*.
5. **Start Here checklist** (5 étapes) : Get Claude Code running · Install your first skill (Carousel Designer / Cold Email Copywriter / Knowledge Base) · Connect Claude to your stack · Start your brain (Build Your Brain / Get the starter CLAUDE.md).

## 4. Map / constellation (hero) ✅👁

- Vue radiale : **7 secteurs** disposés en cercle, chacun un hub coloré lumineux :
  **OPERATIONS, INTELLIGENCE, CUSTOMER, BACK OFFICE, SALES, DEALS, MARKETING** (pagination ‹ › en bas).
- Chaque secteur = sous-titre 3 mots (ex. INTELLIGENCE : « … »), un nœud central icône, des branches de nœuds-skills.
- **Nœud skill** au clic → panneau détail latéral : titre, badge `FULLY AUTONOMOUS`, description, sous-onglets, guide de build (code), CTA. Exemples de nœuds capturés/vus : Email Verification, Account Enrichment, Contact Enrichment, Data Enrichment Specialist, Carousel Production, Ad Creative, Cover Design, Visual Generation, Web & Maps Scraping, Audience Analysis, Competitor Analysis (« Competitive Intelligence Analyst »), Trend Monitoring, Performance Mining, Competitor Teardown.
- Zoom secteur (ex. MARKETING) : watermark du nom du secteur en fond, branches (BRAND…), nœuds icônes reliés.
- Vue alternative **grille par étape** (module Sales) : colonnes **Foundation → Capture → Generate → Orchestrate**, cartes-skills « Fully autonomous » (ICP Definition, Market Mapping, Database Mining, Lead Scoring, Cold Draft, LinkedIn Messaging, Campaign Orchestration, Email Optimization, Social Mining, Video Prospecting…).
- Toggle vue (graph ⇄ grille), filtre secteur, `Browse all`.

## 5. Skill detail + Command Centers ✅👁

- **Guide de build** : étapes numérotées avec blocs de code. Ex. *« Build the Instagram + TikTok · Content dashboard »* : 1. Install & connect the Instagram Graph API + TikTok Display API ; 2. Build the dashboard.
- **Command Centers** = dashboards produits par les skills, présentés en carrousel (« when the work runs itself ») :
  - **HubSpot · Sales Pipeline** : $277,500 / $175,900 / $86,500 / 27% / 47 days ; pipeline by stage (barres) ; pipeline by source.
  - **Instagram + TikTok · Content** : 2,285,290 / 999,822 / 68,147 / +1,394 / 163,553 ; daily views, TikTok traffic, signals.
  - **Mission Control · Client Delivery** : 6 / 14 / 92% / 23 / 3.1h ; signals ; engagements (barres colorées).
  - **META ADS · Paid Acquisition**.

## 6. Hub ✅

H1 `13 skills live · new drops this week · pick up where you left off`.
- **Your first week, in five steps** (checklist, reprend le Start Here).
- **Modules** : cartes Start Here / Claude Code Foundations / Build Your Brain.
- **Fresh drops** (verbatim, avec secteur · date · description · installs · bouton Install) :
  - `Deals · 3 days ago` **Deal Room Producer** — *Assembles everything a prospect needs to say yes: proposal, proof, pricing, in one room.* 4 installs
  - `Sales · 7 days ago` **ICP Strategist** — *Turns your win/loss history into ideal-customer profiles your agents can actually act on.* 6 installs
  - `Operations · 9 days ago` **Brain Sync** — *The bridge that makes every skill read your Notion or Obsidian Cortex…* 7 installs
  - `Deals · 10 days ago` **Inbound Response Manager** — *Every form fill, email and DM answered in minutes, qualified and routed while it's hot.* 5 installs
- **Featured this week** : Lead Sourcing Manager.
- **Most installed** : Meeting Intelligence Engineer, Lead Sourcing Manager, Brain Sync, Knowledge Base.
- **Community pulse** : membres installant des skills (feed).
- **Build logs**.
- Skill quick-install modal : Carousel Designer / Cold Email Copywriter / Knowledge Base → `Install skill →`.

## 7. Modules ✅

H1 `Modules · your path to an AI workforce`. *« 3 modules live, 18 lessons. »* Stepper `01 Start Here → 02 Foundations → 03 Second Brain → Your workforce`.
- **01 Start Here** (RESUME) — *Get the mindset and the map before you open a terminal.* Leçons vues : « AI-Enhanced vs AI-Native » (table comparative), « The context window », « You Don't Need To Be Technical », « Where AI Is Right Now and Where It's Going ».
- **02 Claude Code Foundations** — leçons : Install and Configure Claude Code · How Claude Code Actually Works · Setting Up Your CLAUDE.md (Global CLAUDE.md setup + code) · Your Skills Work · MCPs: Connecting Claude to Your Stack. Barre de progression.
- **03 Build Your Brain** — leçons : Why You Need a Brain · Build Your Brain in Motion · The Capture Workflow · Prompting Your Brain.
- Chaque leçon : contenu long-form, blocs de code, quotes, `Mark complete & continue`, nav leçon précédente/suivante.

## 8. My tree ✅👁

H : connecter sa machine — commande git (`github.com/…` / skill que tu possèdes), *« syncs every skill you own »*. Stats : `0 / 0 / 1w / —`. **SkillTree Audit — your tree, computed** (état loading → résultat : longue liste de skills détectés). `Browse this week's drops`.

## 9. Brain ✅

H `Brain · a 10-minute interview writes it for you` → *« Let AI draft your brain. »*
*« Drop your website and ramble a little about your business — offers, customers, how you sound. Claude drafts all eight sections, you just review and fix. Two minutes instead of ten. »*
Inputs : YOUR WEBSITE, ANYTHING (texte libre). Boutons : `I'll type it myself` / `Draft my base with AI`. Produit : **Company Knowledge Base — Brain** (8 sections, catégorisées).

## 10. Community 👁

*« Welcome! You're one of the first 100, and this is the room where … »* — feed/forum, posts, `Open in [chat]`.

## 11. Settings ✅

Upload photo · email · **Plan : Member · $47/mo** · changement mot de passe · **Manage billing on Stripe** · **Log out**.

## 12. Design system (observé)

- Thème **sombre** par défaut (toggle Light mode). Fond quasi-noir bleuté, dégradés radiaux subtils.
- Typo : serif display pour les labels de secteurs (OPERATIONS, MARKETING…) en capitales espacées ; sans-serif pour l'UI.
- Accents colorés par secteur (hubs lumineux cyan/rouge/or/violet…).
- Nœuds : pastilles rondes claires avec icône, reliées par lignes fines lumineuses.
- Cartes-skills : sombres, bord subtil, badge `Fully autonomous`, tag secteur, méta (date, installs).
- Panneaux latéraux glissants pour le détail skill. Overlays tooltip pour l'onboarding.
