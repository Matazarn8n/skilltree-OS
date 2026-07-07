# SkillTree-OS — PLAN d'exécution (Phase 5)

> Roadmap exécutable, pilotée par `docs/ARCHITECTURE.md` (décisions D1-D9). Chaque phase : {objectif, livrable, modèle+effort GSD, dépendances, critère de succès VÉRIFIABLE}. Porte G5 par phase : livrable **observé** (screenshot/DOM/compteur), jamais un build vert seul. Commits atomiques par phase. Après P0+P1 : P2, P3, P4, P5, P5.1 = **fan-out Sonnet parallèle** (aucune dépendance croisée), revue Fable/Opus avant intégration.

## Références partagées (contrat pour tous les agents)
- Données : `data/tree.json`, `data/skills.json` (137 jobs, vérité), `data/skill_files.json` + `captures/skill_files_full/*.md` (78), `data/dashboards.json` (6), `data/chart.json` (corrigé 2026-07-07 : 7/7 secteurs, 165 jobs, 36 human-led ; `Sales.stages=[]` → fallback `stage_name` skills.json).
- Visuels de référence : `captures/dashboards/*_full.png`, `captures/chart/*__matrix.png|__expanded.png`, `captures/map_zoom/*.png`, `captures/map_panel/*.png`, `captures/lessons/*`, `captures/dynamic/*`.
- Règles : contenu FR **réécrit** (jamais verbatim) ; chaque écran gère loading/vide/erreur ; a11y (clavier, AA, `prefers-reduced-motion`) ; deux régimes de données jamais mélangés (catalogue statique vs state user).
- Vérification : `cd apps/web && pnpm build && pnpm typecheck` obligatoire mais **insuffisant** — chaque critère ci-dessous s'observe sur rendu réel (Playwright screenshot ou DOM assert contre le dev server).

---

## P0 — Consolidation données + rebranchage scaffold
- **Objectif** : une seule source de vérité catalogue générée + le prototype `apps/web` adopté (tracké git) et branché dessus (D1, D2, D9).
- **Livrable** :
  1. `tools/build_catalog.mjs` : lit `data/*.json` (chart.json corrigé = source CHART directe) → émet `apps/web/lib/catalog/` (JSON typé + `types.ts`) : sectors(7), functions(34), jobs(137, id=slugify(nom source), req résolus en ids, stage 1-4 + stage_name, ladder, level), skills(78, lié aux md), chart (165 dont extras `origin='chart'`, stages Sales dérivés de `stage_name` skills.json), dashboards(6).
  2. `tools/assert-graph.mjs` (appelé par build) : échec si comptes ≠ manifeste (137/78/7 + chart 165/human 36), req non résolu, skill sans md, incohérence summaries CHART.
  3. `apps/web` : suppression de `lib/data.ts` hardcodé, pages branchées sur `lib/catalog/`, `d3-force` retiré des deps si inutilisé, tout tracké git.
- **Modèle+effort** : sonnet-4-6 / medium (script + rewire) ; revue fable-5.
- **Dépend de** : — (dataset G2 déjà pass).
- **Critère de succès** : `node tools/assert-graph.mjs` imprime `sectors=7 functions=34 jobs=137 skills=78 chart_extras=N req_unresolved=0 orphans=0` ; `pnpm build` vert ; dev server : `/hub` et `/modules` rendent depuis le catalogue réel (assert DOM : un nom de job réel présent, ex. « Market Mapping » traduit, plus aucun slug inventé du prototype) ; screenshot des 2 pages sauvé dans `orchestration/verify/p0/`.

## P1 — Constellation (hero, vue MAP) + ViewSwitcher
- **Objectif** : la roue-constellation fidèle : 7 fans, branches radiales par fonction, 137 nœuds, hub central « Cerveau d'entreprise » ; shell 3 vues (MAP · DASHBOARDS · CHART) avec `?view=` (D6).
- **Livrable** : `components/constellation/` (Wheel, Sector, Branch, Node, NodeTooltip, JobPanel), layout radial trigo (`W_STEP=360/7`), couleurs `tree.json` ; tooltip hover ; clic → JobPanel (desc FR, ladder, replaces, prérequis cliquables, skills → fiches) ; LOWFX <700px + `prefers-reduced-motion` ; nav clavier + `aria-label` par nœud ; placeholders DASHBOARDS/CHART (EmptyState) derrière le switcher.
- **Modèle+effort** : fable-5 ou opus-4-8 / high (géométrie + interaction + a11y = le composant le plus risqué) ; sous-tâches mécaniques sonnet-4-6.
- **Dépend de** : P0.
- **Critère de succès** : screenshot `/map` comparé à `captures/map_zoom/*.png` (7 fans visibles, hub central, couleurs secteur exactes) ; DOM assert : 137 nœuds focusables, `aria-label` non vides ; émulation `prefers-reduced-motion` → 0 animation (assert computed style) ; viewport 390px → mode LOWFX actif ; Tab parcourt secteur→job et Enter ouvre le JobPanel d'un job réel. Preuves dans `orchestration/verify/p1/`.

## P2 — Hub (fan-out)
- **Objectif** : `/hub` fidèle : checklist « first week » 5 étapes, module cards, Fresh drops, Featured this week, Most installed, Community pulse, Build logs, recherche ⌘K, modale « Installer le skill → ».
- **Livrable** : composants Hub branchés catalogue ; ⌘K cherche jobs+skills en mémoire ; InstallModal (état local en attendant P6, interface `install(slug)` déjà posée) ; FR réécrit ; loading/vide/erreur.
- **Modèle+effort** : sonnet-4-6 / medium. **Dépend de** : P0 (P1 non requis).
- **Critère de succès** : screenshot vs `captures/nav_hub.png` (sections toutes présentes) ; ⌘K → taper un nom de skill réel → résultat cliquable → modale s'ouvre (assert DOM) ; 0 texte anglais copié verbatim des captures (spot-check revue). Preuves `orchestration/verify/p2/`.

## P3 — Modules + 18 leçons FR (fan-out)
- **Objectif** : parcours 01 Start Here (8) / 02 Foundations (5) / 03 Second Brain (5), stepper, LessonReader, progression locale.
- **Livrable** : audit des 18 leçons FR existantes (`apps/web/content/lessons/`) contre `captures/lessons/*` — structure (sections, callouts, blocs code) alignée, réécrit ce qui manque, jamais verbatim ; stepper + LessonNav + ProgressBar branchés sur interface `progress` (local avant P6).
- **Modèle+effort** : sonnet-4-6 / medium (audit+compléments) ; haiku-4-5 / low pour les lookups de correspondance leçon↔capture. **Dépend de** : P0.
- **Critère de succès** : matrice 18/18 leçon↔capture écrite dans `orchestration/verify/p3/coverage.md` (chaque leçon : capture source, sections couvertes, verdict) ; navigation complète d'un module au clic (assert : marquer leçon done → stepper avance) ; screenshot d'une leçon longue vs sa capture.

## P4 — Brain (fan-out)
- **Objectif** : interview 8 sections, deux chemins (« Draft avec l'IA » / « Je l'écris moi-même »), save par section.
- **Livrable** : `/brain` : 8 sections (noms finaux calés sur `captures/dynamic/brain*` + `captures/content/`), éditeur par section, badge source `ai|manual`, bouton draft branché sur interface `draftBrain()` (stub local avant P6 : renvoie un gabarit, PAS un faux appel LLM) ; states complets.
- **Modèle+effort** : sonnet-4-6 / medium. **Dépend de** : P0.
- **Critère de succès** : 8 sections rendues (assert DOM), édition+save d'une section persiste au reload (localStorage avant P6) ; chemin manuel complet observé ; screenshot vs `captures/nav_brain.png`. Preuves `orchestration/verify/p4/`.

## P5 — My Tree + Community + Settings (fan-out)
- **Objectif** : les 3 vues restantes fidèles.
- **Livrable** : `/tree` (ConnectMachine commande git, stats, Weekly drops, TreeAudit calculé depuis installs+tree_state locaux) ; `/community` (feed, état « first 100 ») ; `/settings` (compte, Member $47/mo affiché, billing placeholder, logout).
- **Modèle+effort** : sonnet-4-6 / medium. **Dépend de** : P0.
- **Critère de succès** : screenshots vs `captures/nav_tree.png`, `nav_community.png`, `nav_settings.png` ; TreeAudit change quand on installe un skill (assert compteur avant/après). Preuves `orchestration/verify/p5/`.

## P5.1 — Vues DASHBOARDS & CHART (fan-out)
- **Objectif** : les 2 autres vues du hero (D3, D6).
- **Livrable** : `<CommandCenters/>` : 6 command centers depuis `data/dashboards.json` (stats+deltas+tables, démo déterministe étiquetée) ; `<RolloutMatrix/>` : matrice stage(1-4 nommés par secteur)×level, 7 secteurs, extras `origin='chart'` inclus, résumé « N of M » recalculé depuis la donnée (pas copié).
- **Modèle+effort** : sonnet-4-6 / medium. **Dépend de** : P0 + P1 (switcher).
- **Critère de succès** : screenshot DASHBOARDS vs `captures/dashboards/*_full.png` (mêmes chiffres — la démo est déterministe, seed 20260611) ; CHART : les « N of M » affichés = ceux recalculés par `assert-graph` ; 7 secteurs présents dont Sales. Preuves `orchestration/verify/p51/`.

## P6 — Backend : Supabase + auth + Stripe-ready + LLM draft
- **Objectif** : state user réel (D5, D7, D8) ; remplacer les stubs locaux P2-P5 par la DB.
- **Livrable** : refonte `supabase/schema.sql` sur ARCHITECTURE §5 (RLS toutes tables) ; Supabase Auth (email/password + magic link) ; routes `/api/me|progress|install|tree|brain|onboarding|access` ; `/api/brain/draft` → gateway HERMES `:8765` (server-side, gated paid, rate-limit/user) ; Stripe webhook → flag `paid` derrière `PERSONAL_MODE=true` (paid forcé en perso) ; swap des interfaces locales (`install`, `progress`, `draftBrain`) vers l'API.
- **Modèle+effort** : opus-4-8 / high (schéma+RLS+auth = irréversible) puis sonnet-4-6 / medium (routes+wiring). **Dépend de** : P1-P5.1 (interfaces posées).
- **Critère de succès** : anti-faux-positif strict — parcours réel observé : signup → installer un skill → reload → toujours installé (row Postgres vérifiée par requête, compteur avant/après) ; RLS testée : user B ne lit pas les rows de user A (requête qui DOIT échouer) ; `/api/brain/draft` renvoie un draft réel via :8765 (log gateway + contenu non-gabarit) et refuse au-delà du rate-limit ; routes catalogue : 0 requête DB (assert logs). Preuves `orchestration/verify/p6/`.

## P7 — Onboarding
- **Objectif** : tour 6 étapes + parcours + Cal.com (fidèle à `captures/dynamic/`).
- **Livrable** : overlay STEP X OF 6 (map → path → open a job → that's the skill), sélection agency/business/company/exploring, persistance `/api/onboarding`, CTA Cal.com, landing post-login.
- **Modèle+effort** : sonnet-4-6 / medium. **Dépend de** : P1 (le tour pointe la roue) + P6 (persistance).
- **Critère de succès** : tour complet cliqué de 1 à 6 (screenshots séquence), reload à l'étape 3 → reprend à 3 (row onboarding vérifiée), skip → `done=true`. Preuves `orchestration/verify/p7/`.

## P8 — Revue croisée + gel v1
- **Objectif** : passe fidélité + qualité avant gel.
- **Livrable** : revue Fable/Opus : comparaison écran-par-écran vs `captures/` (checklist), audit a11y (clavier complet, AA, reduced-motion), chasse au verbatim (diff sémantique spot-check fiches/leçons), perf roue (desktop fluide, LOWFX mobile) ; rapport `orchestration/verify/p8/review.md` ; tag `v1-perso`.
- **Modèle+effort** : fable-5 / high. **Dépend de** : P0-P7.
- **Critère de succès** : rapport sans finding bloquant ouvert ; tout finding bloquant → fix commité + re-vérifié avant tag.

---

## Graphe de dépendances (acyclique)
```
P0 ─┬─ P1 ─┬─ P5.1 ─┐
    ├─ P2 ─┤        │
    ├─ P3 ─┼─ P6 ───┼─ P7 ── P8
    ├─ P4 ─┤        │
    └─ P5 ─┘        │
        (P2..P5 ∥, P5.1 après P1)
```
Couverture périmètre : hero 3 vues (P1, P5.1) ✓ · Hub (P2) ✓ · Modules+18 leçons (P3) ✓ · Brain 8 sections (P4) ✓ · My Tree/Community/Settings (P5) ✓ · backend+auth+paiement+LLM (P6) ✓ · onboarding (P7) ✓ · revue/gel (P8) ✓. Les 78 fiches skills FR sont réécrites au fil de P2 (modale), P1 (JobPanel) et P5.1 — la réécriture batch des 78 md (`captures/skill_files_full/` → `apps/web/content/skills/`) est un lot haiku/sonnet rattaché à P2, vérifié par compteur 78/78 + spot-check anti-verbatim.

## Protocole handoff (règle GSD)
Changement de modèle entre phases (ex. P1 fable→P2 sonnet, P5→P6 opus) → handoff auto-suffisant : clôture phase (critères + preuves), prompt prêt à coller, modèle cible en en-tête. `orchestration/state.json` tenu à jour par phase (statut, commit, preuves).
