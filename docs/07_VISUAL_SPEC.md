# Spec visuelle observée (captures assimilées 2026-07-07)

> Contrat de fidélité pour les agents P1-P5.1 et P7. Source : lecture directe des PNG (`captures/`). Complète ARCHITECTURE.md §3 — ce qui suit est **observé**, pas déduit des JSON. Texte UI cité en anglais = source ; l'implémentation le réécrit en FR.

## Shell global (toutes vues)
- Sidebar gauche fixe, fond noir profond, logo SKILLTREE (glyphe arbre + wordmark lettres espacées), label `WORKSPACE`, nav : Map · Hub (badge count) · Modules · My tree · Brain · Community. Item actif = fond légèrement éclairci, coins arrondis.
- Bas de sidebar : carte avatar (initiales rondes claires, email tronqué, `Member · Settings`), puis bouton `Light mode` (icône lune).
- Bouton `Feedback` flottant bas-droit sur toutes les vues. Typo : serif pour titres display (secteurs, gros titres), sans-serif géométrique pour UI ; tracking large + uppercase pour eyebrows/labels.

## Vue MAP (page /map, vue par défaut)
- Topbar : bouton plein-écran ; champ `Search jobs` ; **switcher central MAP · DASHBOARDS · CHART** (pill actif clair) ; lien `NAVIGATION` ; bouton `Book a call` (icône calendrier).
- Vue « all departments » : roue complète — 7 fans autour d'un **centre = amas dense de particules** (le company brain), labels secteurs **serif uppercase espacé** + sous-titre 3 mots minuscule dessous (ex. `SALES / targeting · outreach · sequencing`). Nœuds hub de secteur = cercle coloré (couleur secteur). Chevrons ‹ › en bas pour tourner. Fond bleu-noir avec étoiles/poussière subtiles.
- Vue secteur (zoom) : `← ALL DEPARTMENTS` en haut-gauche ; compteur haut-droit `0 OF 22 LIVE · YOUR TREE` (par secteur) ; **labels de fonction** en uppercase espacé flottants (`TARGETING`, `LEAD SOURCING`, `ENRICHMENT`, `OUTREACH WRITING`, `SEQUENCING & SEND`) avec `N JOBS` dessous ; nœud secteur central bas (cercle + icône, nom serif + sub) ; jobs = **chips circulaires crème avec pictogramme ligne** reliés par segments fins, petits points terminaux (sub-skills) ; navigation secteur précédent/suivant = libellés verticaux `BACK OFFICE` / `DEALS` + chevrons sur les bords ; contrôle zoom bas-droit (`? − NN%`) ; nom du secteur en filigrane géant serif derrière le graphe.
- Panel job (clic nœud, panneau latéral droit sombre) : eyebrow `FULLY AUTONOMOUS` (ou level) ; titre display (`ICP Definition`) + badge outline `START HERE` le cas échéant ; breadcrumb `Sales · Targeting` ; desc ; **carte CTA téléchargement** `1 runnable skill file · yours to download` + `Take it ↓` ; sections : `BREAKS INTO` (chips slugs skills), `BUILDS ON` (chips prérequis, icône maison pour Company Knowledge Base), `WHAT IT REPLACES` (encadré citation), `THE LADDER` (3 lignes HUMAN-LED / HUMAN-ASSISTED / FULLY AUTONOMOUS avec texte par niveau), `THE HUMAN` (paragraphe). Bouton fermer ✕. Variantes status capturées : dev / live / notstarted (`map_panel/sales__icp-definition_status_*.png`).

## Vue DASHBOARDS
- Topbar : `Search panels`, switcher (DASHBOARDS actif), nom du center à droite, bouton `Build your AI workforce`.
- `← ALL DASHBOARDS` ; titre display + icône intégration (ex. logo Meta) + bouton `>_ Build guide + one-shot prompt` ; sélecteur période `7d 14d 30d 90d` (pill).
- Rangée 6 **stat tiles** : icône + label, valeur XL, delta coloré (↗ vert/↘ rouge + %), phrase d'état (`Trending up ↗`) + **sparkline**.
- Bandeau `⚡ Signals` : 3 signaux icônés (alerte rouge / check vert / horloge) en colonnes, texte riche avec chiffres en gras.
- Grille : grand graphe aire+ligne (`Spend & cost per lead`, axes $, légende dots) ; colonnes latérales : barres horizontales (`Spend by placement` par canal avec montants ; `Leads by age`) ; `Budget pacing` (barres + badge `101% On pace`) ; `Creative leaderboard` (table : Creative, Quality badge, Thumbstop, Hook, Spend, Leads, CPL).
- Navigation dashboard précédent/suivant : libellés verticaux `DELIVERY` / `PIPELINE` + dot coloré, chevrons bords.

## Vue CHART
- Tabs secteurs horizontaux (`Sales Deals Marketing Operations Intelligence Customer Back Office`), actif souligné.
- Titre `Deals · the AI rollout` + résumé `19 of 28 jobs run autonomously · 4 assisted · 5 stay human-led` ; légende 3 swatches (Human-led / Human-assisted / Fully autonomous).
- En-tête colonnes = 4 stages : numéro cerclé + nom (`1 Foundation — Data + the company brain`, `2 Capture — Classify, extract, score`, `3 Generate — Produce work, take action`, `4 Orchestrate — Agents, monitoring, loops`) + mini-barres rollout-order ; label `ROLLOUT ORDER first → last` à gauche.
- Lignes = 3 bandes level : `Human-led — A person drives it. (N jobs)`, `Human-assisted — AI drafts, a human approves. (N jobs)`, `Fully autonomous — AI runs it unattended.` ; **les jobs human-led existent ici** (ex. Deals : Closing the Deal, Win/Loss Analysis, Discounting & Concessions, Strategic Account Calls, Proposal Final Sign-Off) avec badge `Ongoing` au lieu du badge stage.
- Cards job : icône + nom + badge `2 · Capture ●●○○` (stage + dots remplis) + chevron expand (`*__expanded.png` pour l'état ouvert).

## Hub
- Header : `13 skills live` + `new drops this week · pick up where you left off` ; badge `2,536 on the list` ; bouton `Open the map`. **Le catalogue est drip-released** (13/78 live, drops hebdo) — version perso : tout exposé, compteur recalculé (décision : pas de simulation de drip, tradeoff fidélité < utilité perso ; le composant FreshDrops reste piloté par un champ `released_at` pour pouvoir réactiver le drip en SaaS).
- Recherche pleine largeur `Search the tree, find a skill, or jump to a job… try "carousel"` + raccourci `⌘ K`.
- Carte `GET STARTED — Your first week, in five steps.` : progression `2/5` + barre ; étapes : done (check + bouton `Done` grisé) ou actives (numéro cerclé, CTAs : `Open the install guide` / `I already have it`), étape 3 avec **chips skills colorés par secteur** (Carousel Designer · Cold Email Copywriter · Knowledge Base), étape 5 `Open Build Your Brain` / `Get the starter CLAUDE.md`. Fermable ✕.
- Bannière secondaire dismissible (`Prefer a password? Set one in Settings…`).
- Section `Modules — build your AI workforce, step by step` : 3 cartes (MODULE 01 Start Here · 02 Claude Code Foundations · 03 Build Your Brain) avec desc, `N/M lessons`, barre de progression, flèche →.
- `Fresh drops — newest skills, fresh each week` + `See all 13 →` : bandeau `NEXT DROP — SEO Engineer · Marketing — lands tomorrow` ; grande carte `★ FEATURED THIS WEEK` (visuel sombre + label secteur, titre display, desc, `Added 13 days ago · 8 installs`, bouton `Install skill →`) ; grille cartes drop (icône, badge secteur coloré, âge `3 days ago`, titre, desc 2 lignes, `N installs`, bouton `Install`).
- Colonne droite : `Most installed — all time` (top 5 numéroté, `N installs`) ; `Community pulse — live` (feed avatars `ST`, `A member ran Financial Reporting Analyst · 4h ago`, ran/installed) ; `Build logs — from Ahmed` (post : titre, âge + temps de lecture, extrait).
- Footer : `SkillTree Hub · live. New skills drop every week.`

## Brain
- Wizard plein écran (sidebar visible) : titre `Brain` + sous-titre `a 10-minute interview writes it for you` ; barre de progression fine ; eyebrow `COMPANY 1/8` ; **une question par écran** (`What's your company called?`, input placeholder) ; boutons `Back` / `Continue →` ; footnote `Saved as you go. This becomes the brain every skill reads from. Only you can see it.`
- 8 sections séquentielles (screens capturés `brain_section_1..8.png` + JSON) ; entrée initiale = choix `Draft my base with AI` vs `I'll type it myself` (`brain_initial.png`, `brain_manual.png`).

## Références PNG par composant
| Composant | Fichiers |
|---|---|
| Roue complète | `01_after_login.png`, `home.png`, `nav_map.png` |
| Zoom secteur | `map_zoom/{sector}.png` (7) |
| Panel job + états | `map_panel/*_top.png`, `*_scrolled.png`, `sales__icp-definition_status_{dev,live,notstarted}.png` (31) |
| Dashboards | `dashboards/{slug}_full.png` (6) + `dash_full.png` (index) |
| CHART matrice/expanded | `chart/{sector}__matrix.png`, `__expanded.png` + `dynamic/chart_html.png` |
| Hub | `dynamic/hub.png`, `nav_hub.png` |
| Brain wizard | `dynamic/brain_initial*.png`, `brain_manual.png`, `brain_section_{1..8}.png` (+ JSON textes) |
| Leçons | `captures/lessons/*` (18 texte+PNG) |
| Community/Settings/Tree | `nav_community.png`, `nav_settings.png`, `nav_tree.png` |
