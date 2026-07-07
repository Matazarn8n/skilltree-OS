---
phase: 02-hero-constellation
plan: 02
subsystem: ui
tags: [nextjs, react, a11y, playwright, tailwind, wcag]

# Dependency graph
requires:
  - phase: 02-hero-constellation (wave 1, plan 01)
    provides: "roue-constellation (ConstellationWheel/SectorView/JobNode/HubCore), MapView avec SkillPanel provisoire, /map ?view= shareable"
provides:
  - "components/constellation/JobPanel.tsx : panneau job complet FR fidèle aux captures map_panel/ (eyebrow niveau, titre serif + badge, breadcrumb, desc, carte fichier skill, SE DÉCOMPOSE EN, S'APPUIE SUR cliquable, CE QUE ÇA REMPLACE, L'ÉCHELLE 3 niveaux, L'HUMAIN)"
  - "navigation BUILDS ON intra-panel (onNavigate → skillBySlug, hub non cliquable)"
  - "a11y clavier : tab order secteur→SES jobs, Échap contextuel (panel ferme / sinon retour all-departments), focus rendu au nœud d'origine"
  - "gardes 0-animation : reduced-motion + [data-lowfx] (globals.css)"
  - "tools/verify_p1.py : suite Playwright reproductible (15 checks) + preuves orchestration/verify/p1/{dom-assert.txt,map.png,sector-zoom.png,panel.png,lowfx-390.png}"
affects: [phase-3 (JobPanel réutilisé quand les 78 fiches skills FR seront branchées ; les placeholders dashboards/chart restent à remplir)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "panel = role=dialog aria-modal ; focus ✕ à l'ouverture, restore de document.activeElement à l'unmount (navigation intra-panel préserve l'ouvreur)"
    - "Échap partagé sans conflit : JobPanel ferme (window), SectorView garde-fou `!selectedSlug` avant onBack"
    - "tab order = ordre DOM : nœuds jobs rendus SOUS leur bouton secteur (interleave) plutôt qu'en bloc séparé"
    - "contraste AA mesuré en test (luminance WCAG calculée sur couleurs computed), pas déclaré"

key-files:
  created:
    - apps/web/components/constellation/JobPanel.tsx
    - tools/verify_p1.py
    - orchestration/verify/p1/dom-assert.txt
    - orchestration/verify/p1/map.png
    - orchestration/verify/p1/sector-zoom.png
    - orchestration/verify/p1/panel.png
    - orchestration/verify/p1/lowfx-390.png
  modified:
    - apps/web/components/map/MapView.tsx
    - apps/web/components/constellation/ConstellationWheel.tsx
    - apps/web/components/constellation/SectorView.tsx
    - apps/web/app/globals.css
  deleted:
    - apps/web/components/skill/SkillPanel.tsx
---

# Plan 02-02 — JobPanel + a11y/LOWFX + preuves — SUMMARY

## Ce qui est livré (3 tâches)

1. **JobPanel FR complet** branché sur la roue. Structure fidèle à `captures/map_panel/sales__icp-definition_top.png` — vérifié à l'œil sur `panel.png`. Les 11 blocs du plan présents ; sections nullables omises proprement (`sop-generation` human-led → pas de « L'humain », 0 « undefined »). Navigation BUILDS ON intra-panel (`market-mapping` → chip « ICP Definition » → panel icp-definition). SkillPanel provisoire supprimé.
2. **A11y clavier + LOWFX durcis**. Tab order secteur→SES jobs (DOM interleavé). Échap : ferme le panel si ouvert, sinon retour all-departments. `role=group` sur la roue, aria-label secteur avec compte jobs. 0 animation JS (aucun `requestAnimationFrame`/`setInterval`). `globals.css` : reduced-motion + `[data-lowfx]` forcent animation/transition à 0.001ms. Taglines passées `--text-faint`→`--text-muted` pour l'AA.
3. **Suite de preuves Playwright** `tools/verify_p1.py` — 15 checks, rejouable, exit 1 au 1er FAIL.

## Preuve rendu réel (anti-faux-positif)

`pnpm build` exit=0 (prebuild assert-graph : `sectors=7 functions=34 jobs=137 skills=78`), `npx next start -p 3010`, puis `/home/nuveo/.higgsfield-login-venv/bin/python tools/verify_p1.py` → **15/15 PASS** :

- 137 nœuds `<button>` aria-labelisés (0 vide) ; 7 couleurs secteur exactes (hex catalogue).
- Tab : `Secteur Ventes — 22 jobs` → `ICP Definition — Ventes` → … (jobs du même secteur).
- Enter → JobPanel `icp-definition` complet : eyebrow « Pleinement autonome », carte « 1 fichier skill exécutable » + « Récupère-le ↓ », toutes les sections + les 3 lignes d'échelle.
- BUILDS ON `market-mapping` → clic chip → titre dialog devient « ICP Definition ».
- Régression null `sop-generation` : 0 « undefined »/« null », section « L'humain » absente.
- Contraste AA **mesuré** (luminance WCAG) : label job **8.01:1**, tagline secteur **8.01:1** (≥ 4.5).
- reduced-motion : animation/transition ≤ 1e-6 s (computed style). 390px : `data-lowfx=true`.
- `?view=chart` et `?view=dashboards` en URL directe : pill `aria-current` + placeholder.

Preuves : `orchestration/verify/p1/{dom-assert.txt, map.png, sector-zoom.png, panel.png, lowfx-390.png}`.

## Les 4 success criteria de la Phase 2

1. **Roue fidèle** (7 fans, hub, couleurs) — `map.png` vs `captures/01_after_login.png` ✅ (couleurs asserties, structure à l'œil).
2. **137 focusables + JobPanel complet clavier** — checks 1/3/4/5/5b ✅.
3. **reduced-motion 0 animation + LOWFX 390px** — checks 6/7 ✅.
4. **Switcher `?view=` shareable** — check 8 ✅.

## Écart assumé (non bloquant, hérité de wave 1)

Orientation de la roue (Ventes en haut vs Sales en bas dans l'original) et rendu des nœuds plus lumineux que les points ternes de l'original — consigné dans `wheel-smoke.txt`, sans impact sur les critères. À arbitrer éventuellement en polish Phase 3+.
