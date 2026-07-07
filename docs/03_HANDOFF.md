# HANDOFF — SkillTree-OS (reprise session propre)

> Contexte saturé en fin de session capture/plan (2026-07-07). Ce doc est auto-suffisant pour reprendre au **build**. Modèle cible reprise : **Fable 5 / Opus 4.8** (archi+revue), effort **high**. Impl déléguée à **Sonnet**.

## Driver réutilisable (nav + clic + download) — `tools/skilltree.py`
Module prouvé (self-check live OK). Les agents IMPORTENT au lieu de re-scripter :
```python
from skilltree import driver, goto, scrape, shot, save_json, click_and_shot, expand_all, carousel_walk, capture_downloads
with driver(record_json=True) as (pg, BASE):      # login auth déjà fait
    goto(pg, BASE+"/hub"); shot(pg, "captures/dynamic/hub.png")
    click_and_shot(pg, "text=Carousel Designer", "captures/dynamic/hub_modal.png", out_json="captures/dynamic/hub_modal.json")
    expand_all(pg, ".job-card", "captures/chart", "sales")           # CHART : multi-clic cartes → tous les skills
    carousel_walk(pg, "button[aria-label=next]", lambda i: shot(pg, f"captures/dashboards/{i}.png"))  # DASHBOARDS
    capture_downloads(pg, "text=Take it", "captures/skill_files_full")  # skill .md complet
```
Primitives : `login`(auto via driver), `settle`(anti-flaky), `scrape`, `goto`, `shot`(alerte si <30KB), `click_and_shot`, `expand_all`(cartes multi-clic), `carousel_walk`(flèches), `capture_downloads`(event download Playwright). Sélecteurs exacts (`.job-card`, `aria-label`, `text=Take it`) à ajuster par l'agent selon le DOM réel — inspecter d'abord.
Interpréteur : `~/.higgsfield-login-venv/bin/python`.

## Où on en est (DONE ✅)

- **Capture terminée** (méthode = Playwright authentifié, pas ShowUI-Aloha). Creds: `.env.md` (jamais logger). Interpréteur: `~/.higgsfield-login-venv/bin/python`. Login prouvé dans `tools/crawl.py` (fonction `settle` + `wait_for_function` sortie de `/login`).
- **Data structurée** (`data/`) — la fondation du build :
  - `skills.json` (137 jobs : desc, sector, function, skills[], integrations[], level, human, replaces, req[], ladder{manual,assisted,autonomous}, notes, files[])
  - `tree.json` (7 secteurs → fonctions → jobs, avec `color`, `intro`, `sub`)
  - `skill_files.json` (78 skills : title, what, needs, category, previewMd)
  - `summary.json` (7 secteurs / 34 fonctions / 137 jobs / 78 skills)
- **18 leçons** intégrales (texte+PNG) : `captures/lessons/` — 3 modules (start-here 8, foundations 5, second-brain 5).
- **Dynamique capturé** : `captures/dynamic/` — hub + 3 modales skills (carousel-designer, cold-email-copywriter, knowledge-base, ~11K chars chacune) + brain_initial.
- **Visuels** : `captures/01_after_login.png`, `home.png` (constellation retina), planches `scratchpad/sheet_A|B|C.jpg`.
- **Docs** : `01_CARTE_COMPORTEMENTALE.md`, `02_MASTER_PLAN.md` (archi complète), ce handoff.

## Reste (TODO)

### Capture résiduelle (secondaire, non bloquant — top-level déjà dans `captures/content/nav_*.json`)
- [ ] Brain flow complet : états "Draft with AI" vs "type myself", 8 sections.
- [ ] My Tree (connect machine, SkillTree Audit, weekly drops), Community feed, Settings, Onboarding (`/api/onboarding`), command centers (`/chart.html`).
- Relancer un agent Sonnet capture (mêmes specs que `tools/capture_dynamic.py`) UNE session, sur ces pages. Vérifier PNG >30KB.

### Build (cœur) — roadmap `02_MASTER_PLAN.md §6, exécuter dans l'ordre
- [ ] **P0** — scaffold `apps/web` : Next 15 App Router + TS + Tailwind. Sidebar shell (Map/Hub/Modules/My tree/Brain/Community/Settings). Importer `data/*.json`. Gate `paid`. (sonnet/medium)
- [ ] **P1** — **Constellation FR** (hero) : `components/constellation/` Wheel/Sector/Branch/Node/Tooltip. Roue 7 secteurs (trigo, pas de lib graphe), SVG, node→panneau skill. States loading/vide/erreur + a11y clavier + `prefers-reduced-motion` (garde-fou LOWFX <700px dès le départ). (fable/opus design → sonnet impl)
- [ ] **P2** Hub, **P3** Modules+18 leçons FR (MDX réécrites), **P4** Brain, **P5** Tree/Community/Settings — **fan-out Sonnet parallèle** après P0.
- [ ] **P6** Backend Supabase (schéma §2b : users/progress/installs/brain/tree_state/onboarding) + routes API (§3) + Stripe + LLM draft. (fable archi, sonnet impl)
- [ ] **P7** Onboarding tour 6 étapes + Cal.com.

## Règles de reprise
- Contenu = **structure fidèle + FR réécrit** (pas de copie verbatim de la prose des leçons).
- Catalogue = **fichiers statiques buildés** (pas DB) ; state user = Postgres. Ne pas mélanger (cf. `02 §1 A2`).
- Chaque module gère loading/vide/erreur explicitement ; a11y AA ; composants pilotés par données pas par booléens.
- Vérif réelle anti-faux-positif : tester chaque module rendu, pas se fier à un build vert.

## Prompt de reprise (à coller)
> Reprends SkillTree-OS au build. Lis `docs/03_HANDOFF.md` + `docs/02_MASTER_PLAN.md`. Data prête dans `data/*.json`. Exécute P0 (scaffold Next+TS+Tailwind+sidebar+import data) puis P1 (constellation FR, le hero). Ensuite fan-out Sonnet par module. Modèle Fable5/Opus archi+revue, Sonnet impl. Ne copie pas la prose des leçons — réécris en FR.
