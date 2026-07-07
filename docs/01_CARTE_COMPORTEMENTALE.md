# SkillTree — Carte comportementale + état de reconstruction

> Reconstruction perso FR d'un SaaS tiers (compte payant, creds locaux). Produit réel = **Altari** (`altari.ai/skilltree`), hébergé `skilltree-hub.vercel.app`. Réinterprétation UX + contenu FR réécrit — pas une redistribution.

## Décisions actées (session 2026-07-07)

1. **ShowUI-Aloha écarté** (ponytail). Agent vision-GUI lourd inutile : on a un DOM authentifié + APIs. Playwright scripté = plus fiable, moins cher, reproductible.
2. **Capture** = crawl auto Playwright (moi) + utilisateur en filet sur le 10% inatteignable. Validé par l'utilisateur.
3. **Fidélité contenu** = structure fidèle à l'identique + contenu d'apprentissage FR **réécrit** (pas de copie verbatim de la prose du cours). Validé.
4. **Modèles** = Fable 5 (orchestration/archi/revue) + sous-agents Sonnet (impl/parse/capture spécifiés) + Haiku (lookups). GSD tiering.
5. **Dossier de travail** = `~/projects/skilltree-OS` (réutilise le dossier existant qui porte `.env.md`, au lieu de créer `skilltree-os`).

## Le produit (compris de la vidéo 13min30 + crawl authentifié)

Plateforme d'apprentissage gamifiée : apprendre à monter une agence IA / une "AI workforce" avec Claude Code. Ton premium, dark theme, typo sérif pour les titres de secteurs.

**Nav gauche (sidebar "WORKSPACE")** : Map · Hub (badge 13) · Modules · My tree · Brain · Community · [avatar → Settings].

### Modules & routes réelles (SPA, client-routing)
- `/` et `/map` → **la Map** (constellation). Rendu SVG "roue" : 7 fans sur un cercle, branches radiales, "company brain" au centre. **Flaky en headless** (canvas/anim lourd) → capturer via données statiques, pas via clic de nœud.
- `/hub` → dashboard : "13 skills live", "Your first week in five steps" (checklist), Modules (cartes), **Fresh drops**, **Featured this week**, **Most installed**, **Community pulse**, **Build logs**. Recherche ⌘K. Skills cliquables → modale "Install skill →".
- `/modules` → "your path to an AI workforce · 3 modules live, 18 lessons". Stepper 01 Start Here / 02 Foundations / 03 Second Brain / Your workforce.
- `/modules/<module>/<lesson>` → leçon (contenu long-form). **18 leçons capturées** (texte+PNG) dans `captures/lessons/`.
- `/tree` (My tree) → "connect your machine" (commande git), stats (0/0/1w), "Browse this week's drops", SkillTree Audit ("your tree, computed").
- `/brain` → "a 10-minute interview writes it for you · Let AI draft your brain". 8 sections. 2 chemins : "Draft my base with AI" vs "I'll type it myself".
- `/community` → feed ("You're one of the first 100…").
- `/settings` → compte (email, Member · $47/mo, Stripe billing, logout). `/api/access` = `{paid:true,...}`.
- **Onboarding** : tour guidé 6 étapes (overlay STEP X OF 6 : the map → path → open a job → that's the skill), sélection de parcours (agency/business/company/exploring), + réservation Cal.com "30-Minute Strategy Call" (FR-localisée). `/api/onboarding`. Landing post-login = `/preview`.

### Modèle de données (SOURCE COMPLÈTE trouvée — fichiers statiques servis à la session)
Pas besoin de cliquer les nœuds. Tout est dans :
- **`/content.js`** → `const PLAYBOOK = { 'JobName': {files, human, replaces, req:[prereqs], ladder:{manual,assisted,autonomous}, notes} }` — **137 jobs**. `req` = arêtes du graphe. `HUB='Company Knowledge Base'` = nœud central.
- **`/app-map.html`** → `const TREE = [ {name, sub, color, intro, functions:[F(fn,[L(job, desc, [skillSlugs], [integrations])])]} ]` — **7 secteurs** : Sales(#FF9D5C), Deals, Marketing, Operations, Intelligence, Customer, Back Office. Hiérarchie **Secteur → Fonction → Job → Skills + intégrations**. Rendu = roue (W_STEP=360/7).
- **`/skill-meta.js`** → `SKILL_META['skills/x.md'] = {title, what, needs}` — **78 skills**.
- **`/skill-previews.js`** → `window.SKILL_PREVIEWS[slug] = markdown` — 78 extraits (fichiers complets gated).
- **`/chart.html`** (104KB) = template Command Center (dashboards : HubSpot Pipeline, Insta+TikTok Content, Mission Control Client Delivery, Meta Ads).
- Fichiers bruts sauvés dans `captures/raw/`.

### Concepts clés
- **Skill / Job** : nœud "métier" (ex. ICP Definition, Email Verification, Carousel Production, Billing Manager). Souvent "Fully autonomous". Échelle manual→assisted→autonomous. Remplace un coût FTE.
- **Command Center** : dashboard produit qu'un skill fait tourner (ex. HubSpot Sales Pipeline avec vrais chiffres).
- **Brain** = Company Knowledge Base, le hub dont tout dépend (`req:[HUB]`).

## État de capture

| Élément | État | Emplacement |
|---|---|---|
| Vidéo parcours → frames/planches | ✅ | scratchpad/watch_skilltree, sheet_A/B/C |
| Constellation retina (visuel) | ✅ | captures/01_after_login.png, home.png |
| 18 leçons (texte+PNG) | ✅ | captures/lessons/ |
| Hub/Modules/Brain/Community/Settings/Tree (texte) | ✅ | captures/content/ |
| Data statique (TREE/PLAYBOOK/META/PREVIEWS/chart) | ✅ brut | captures/raw/ |
| **Parse → JSON structuré** | ⏳ agent Sonnet | data/*.json (en cours) |
| **Dynamique live (modales hub, brain flow, onboarding…)** | ⏳ agent Sonnet | captures/dynamic/ (en cours) |

## Reste à faire (post-capture)
- [ ] Master plan + archi (data model, API, schéma DB, cache) — doc 02.
- [ ] Reconstruction UI FR : composants réutilisables, states loading/vide/erreur, a11y. Hero = la roue/constellation. Fan-out Sonnet par module.
- [ ] Backend : schéma (sectors, functions, jobs, skills, edges, progression, users), API (tree/brain/onboarding/modules), cache états de tree.
- [ ] Roadmap GSD séquencée par module.

## Outils
- `tools/capture.py` (login+routes), `tools/crawl.py` (login+settle+scrape prouvé), `tools/deep_crawl.py` (leçons), `tools/data_hunt.py` (trouve les fichiers data), `tools/parse_data.js` (agent), `tools/capture_dynamic.py` (agent).
- Login: interpréteur `~/.higgsfield-login-venv/bin/python`. Pattern login prouvé dans crawl.py (wait_for_function sortie de /login).
