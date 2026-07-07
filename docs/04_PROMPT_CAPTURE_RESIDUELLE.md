# Prompt reprise — capture résiduelle SkillTree (nouvelle session)

Coller tel quel en nouvelle session. Modèle : Fable5/Opus orchestration, **délègue à des agents Sonnet**. Effort high.

---

Reprends la capture de **SkillTree-OS** (`~/projects/skilltree-OS`). Lis d'abord `docs/03_HANDOFF.md`, `docs/01_CARTE_COMPORTEMENTALE.md`, `docs/02_MASTER_PLAN.md`. Data déjà parsée dans `data/*.json` (137 jobs, 78 skills, 7 secteurs). Login prouvé dans `tools/crawl.py` (creds `.env.md`, NE JAMAIS logger le password ; interpréteur `~/.higgsfield-login-venv/bin/python`). Fidélité = structure exacte + FR réécrit.

Il reste à capturer ces éléments. Lance des **agents Sonnet** en parallèle (partitionner pour éviter conflit de session — 1 seul compte : garder chaque agent navigateur sur UNE session séquentielle, les agents parse sont sans navigateur donc parallélisables librement).

## Agent A — pages dynamiques restantes (Playwright, 1 session)
Screenshot full_page retina (device_scale_factor=2) + scrape {url,title,headings,buttons,text} dans `captures/dynamic/` :
- `/brain` : état initial PUIS les 2 chemins — bouton "Draft my base with AI" et "I'll type it myself". Le brain a **8 sections** — capture chaque section affichée (brain_ai, brain_manual, brain_section_N).
- `/tree` (My tree) : "connect your machine", stats, "Browse this week's drops", et déclenche le **SkillTree Audit** ("your tree, computed") si bouton.
- `/community` : feed complet.
- `/settings` : compte (NE PAS scraper le password).
- Onboarding : `pg.request.get(BASE+"/api/onboarding")` → `captures/dynamic/api_onboarding.json` ; screenshot `/onboarding` et `/preview` ; capture le tour guidé 6 étapes (overlay STEP X OF 6) s'il se déclenche, + la réservation Cal.com "30-Minute Strategy Call".
Anti-faux-positif : chaque PNG >30KB sinon page vide → retry (fonction `settle` de crawl.py). Rapporter honnêtement réussi/vide.

## Agent B — les 3 onglets du haut de /map : MAP / DASHBOARDS / CHART (Playwright, 1 session)
En haut de `/map` il y a une barre à 3 onglets (boutons "MAP", "DASHBOARDS", "CHART").
- **DASHBOARDS** ("Command Centers · what each department looks like when the work runs itself") = carrousel 3D de dashboards. Clique les flèches ‹ › pour faire défiler TOUS les command centers et screenshot+scrape chacun EN GRAND (clique le dashboard central pour l'ouvrir/zoomer si possible) : **Meta Ads · Paid Acquisition** ($31,587 spend, 1,049 leads, CPL, CTR, CPM, frequency, spend-by-placement, leads-by-age), **HubSpot · Sales Pipeline**, **Xero · Finance**, **Mission Control · Client Delivery**, **Instagram + TikTok · Content**, + tous les autres visibles. Fichier : `captures/dashboards/<slug>.png` + `.json` (stats, séries, tables réelles).
- **CHART** ("<Secteur> · the AI rollout · N of M jobs autonomous · X assisted · Y human-led") = matrice. 7 onglets secteur (Sales/Deals/Marketing/Operations/Intelligence/Customer/Back Office). Pour CHAQUE secteur : screenshot pleine matrice + scrape. La matrice = lignes **Human-led / Human-assisted / Fully autonomous** × colonnes rollout **1 Foundation / 2 Capture / 3 Generate / 4 Orchestrate**. Chaque cellule = carte job (ex. "Database Mining · 1·Foundation"). **IMPORTANT — interaction multi-clic** : chaque carte job se clique (parfois PLUSIEURS fois / états imbriqués) pour dérouler TOUS les skills liés à ce workflow, pas juste le premier. Pour CHAQUE carte de CHAQUE secteur : clique, capture l'état déroulé (desc + liste complète "SKILLS: …"), re-clique si un niveau supplémentaire apparaît, jusqu'à épuisement — screenshot chaque état, scrape la liste exhaustive des skills du workflow. Capture les compteurs par secteur + pour chaque job son **stage** (1-4), son **level** (human-led/assisted/autonomous) et **tous** ses skills. Fichier : `captures/chart/<sector>.png` + `captures/chart/<sector>__<job>.png` + `captures/chart/<sector>.json` (chaque job = {name, stage, level, desc, skills:[tous]}).
Note : ces onglets secteur (SALES, DEALS, …) sont interactifs et reprennent les branches du skill-tree map sous forme d'"OS par onglet" — capturer l'exhaustivité des skills par workflow est le but.

## Agent C — data hunt + parse (sans navigateur, ou request.get authentifié)
- **Chasser la source des dashboards** : les chiffres démo (ex. "31,587", "Paid Acquisition", "Cost per Lead", "HubSpot") ne sont PAS dans `captures/raw/*` déjà récupérés. Rejoue un data_hunt (cf. `tools/data_hunt.py`) en chargeant `/map` onglet DASHBOARDS et en enregistrant toutes les réponses JS/JSON contenant ces marqueurs → sauver dans `captures/raw/`. Puis parser en `data/dashboards.json` (1 entrée par command center : nom, département, sous-titre, stats[], séries[], tables[]).
- **Parser stage+level par job** : `captures/raw/skilltree_hub_vercel_app_app_map_html.txt` contient déjà les mentions Foundation/Capture/Generate/Orchestrate + human-led/assisted/autonomous. Extraire le **stage rollout (1-4)** et le **level** de chaque job et les MERGER dans `data/skills.json` (ajouter champs `stage`, confirmer `level`). Vérifier : chaque job a un stage ∈{1,2,3,4} et un level.

## ## ⚠️ MAP — le contenu des nodes est DÉJÀ capturé (ne pas refaire 200 screens)
Le panneau contextuel d'un node (clic secteur → zoom branche → clic node → fenêtre "FULLY AUTONOMOUS / desc / BREAKS INTO / WIRED INTO / BUILDS ON / WHAT IT REPLACES / THE LADDER / THE HUMAN / BUILD NOTES / TAKE THE SKILL / YOUR STATUS") = **1:1 avec `data/skills.json`** (137 jobs). Mapping vérifié sur "Contact Enrichment" :
`desc`=desc · `skills`=BREAKS INTO · `integrations`=WIRED INTO · `req`=BUILDS ON · `replaces`=WHAT IT REPLACES · `ladder`=THE LADDER · `human`=THE HUMAN · `notes`=BUILD NOTES · `files`=TAKE THE SKILL. Fonctions par secteur (TARGETING/LEAD SOURCING/ENRICHMENT/OUTREACH WRITING/SEQUENCING & SEND…) = déjà dans `data/tree.json`.
→ **NE PAS** faire ~200 screenshots de nodes pour le contenu. Faire seulement :

## Agent D — fichiers skills complets + référence visuelle map
- **Fichiers skill .md COMPLETS** (net-new, seul contenu manquant) : on n'a que les previews gated (`skill_previews.js`). Le bouton "Take it ↓ / READ · SKILL.MD" télécharge le fichier entier. Trouver l'URL/endpoint de download (clique "Take it" sur 1 node, observe la requête réseau — probable `/skills/<slug>.md` ou `/api/skill/<slug>` en session authentifiée `paid:true`). Récupérer les **78 fichiers** → `captures/skill_files_full/<slug>.md`. Vérifier : 78 fichiers, chacun > sa preview.
- **Référence visuelle (échantillon, PAS l'exhaustivité)** : screenshot de chaque **zoom-secteur** (7 vues : clic sur chaque secteur → branche déployée avec fonctions+nodes) + **2-3 panneaux de node** par secteur (état déroulé + état scrollé montrant THE HUMAN/BUILD NOTES/TAKE THE SKILL/YOUR STATUS) → assez pour reconstruire le composant panneau. `captures/map_zoom/<sector>.png` + `captures/map_panel/<sector>__<node>.png`. Capturer aussi les 3 états YOUR STATUS (Not started / In development / Live).
- (Optionnel, si l'utilisateur insiste sur la fidélité pixel node-par-node : boucler clic-node→screenshot sur les 137, mais c'est du polish, le contenu est déjà en JSON.)

## Vérification finale (obligatoire, anti-faux-positif)
Lister `ls -la captures/dashboards/ captures/chart/ captures/dynamic/`, compter les fichiers non-vides, et afficher : 1 dashboard complet (Meta Ads), la matrice CHART Sales (compteurs + 3 jobs avec stage+level), 1 section brain. Rapport honnête : quoi réussi, quoi vide/manquant. Committer `data/` (avec `-f`, .gitignore parent l'ignore) + `docs/`.

Ensuite → passer au **build** (roadmap `02_MASTER_PLAN.md §6`, P0 scaffold → P1 constellation FR → fan-out Sonnet). Le CHART et les DASHBOARDS deviennent 2 vues de plus dans la reconstruction (onglets MAP/DASHBOARDS/CHART).
