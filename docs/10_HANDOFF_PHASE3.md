# HANDOFF — Phase 3 (Vues & modules UI) → exécution fan-out

> **Modèle cible : Opus 4.8 ou Fable 5 en ORCHESTRATEUR (effort `high`)** — `/gsd:execute-phase 3` spawne 5 exécuteurs `sonnet-4-6 / medium` (impl standard) ; `haiku-4-5 / low` pour les lookups mécaniques (batch 78 fiches en 03-01, matrice leçons en 03-02). La **revue avant intégration** (fidélité captures + anti-verbatim + compteurs) reste au tier fort. · cwd OBLIGATOIRE : `/home/nuveo/projects/skilltree-OS` · repo git standalone, remote `origin = git@github.com:Matazarn8n/skilltree-OS.git` (push autorisé sur `main`). · Rédigé 2026-07-08 en clôture de session Opus (Phase 2 wave 2 livrée + poussée, Phase 3 planifiée + vérifiée).
>
> ⚠️ NE JAMAIS toucher `/home/nuveo/.planning` — c'est un AUTRE projet (hermes-os). Tous les `.planning/` ci-dessous sont sous `/home/nuveo/projects/skilltree-OS`.

## État — ce qui est FAIT et prouvé

| Quoi | Preuve |
|---|---|
| **Phase 1 COMPLETE + VERIFIED** | catalogue `apps/web/lib/catalog/{catalog.json,types.ts}` (137 jobs/7 secteurs/34 fonctions), `assert-graph` PASS |
| **Phase 2 COMPLETE + VERIFIED 4/4** | roue-constellation + JobPanel. Commits `65f373d`→`fda93d0`, poussés `origin/main`. Preuves réelles : `tools/verify_p1.py` **15/15 PASS** (137 `<button>` aria-labelisés, 7 couleurs secteur exactes, Tab secteur→job, Enter→JobPanel complet, BUILDS ON navigue, régression null, contraste AA mesuré 8.01:1, reduced-motion 0 anim, 390px→LOWFX, `?view=` shareable). `orchestration/verify/p1/{dom-assert.txt,map.png,sector-zoom.png,panel.png,lowfx-390.png}`. Vérif indépendante `gsd-verifier` = **passed 4/4**. `.planning/phases/02-hero-constellation/02-VERIFICATION.md` |
| **Phase 3 PLANIFIÉE + VÉRIFIÉE** | 5 plans `.planning/phases/03-vues-modules-ui/03-0{1..5}-PLAN.md` (fan-out wave 1, `depends_on: []`). `gsd-plan-checker` = **VERIFICATION PASSED** (14/14 requirements couverts, 0 overlap de `files_modified`, anti-faux-positif encodé). Commit `5c3de2d` |

Progress : 3/8 plans exécutés (Phase 1 + Phase 2 ×2). Phase 3 = 5 plans à exécuter.

## Ce que Phase 2 a livré (à réutiliser en Phase 3)

- `components/constellation/JobPanel.tsx` : panneau job latéral complet (role=dialog, focus-return, sections nullables gardées, BUILDS ON `onNavigate`). Réutilisable si une vue Phase 3 ouvre un job.
- `tools/verify_p1.py` : **gabarit de preuve** — Playwright sync API, helper contraste WCAG, DOM asserts + screenshots, exit 1 au 1er FAIL, dom-assert.txt écrit seulement si tout PASS. Les 5 plans clonent ce style.
- Stubs/accesseurs existants : `lib/catalog/index.ts` (catalogue), `lib/progress.ts` (progression leçons, pattern event+hook localStorage), `lib/db.ts`, `lib/contracts.ts`, `lib/lessons.ts`. **Étendre, ne pas réinventer.**
- `components/map/MapView.tsx` : 2 branches placeholder (`dashboards`/`chart`) que **03-05 remplit** (seul plan Phase 3 touchant ce fichier).

## Les 5 plans (fan-out parallèle, aucune dépendance croisée)

| Plan | Construit | Preuve clé |
|---|---|---|
| **03-01** Hub | 6 sections (GET STARTED 5 étapes, Modules, Fresh drops+Featured, Most installed, Community pulse, Build logs) + ⌘K→InstallModal + `install(slug)` local (`lib/installs.ts`) + **batch réécriture 78 fiches skills FR** | `verify_p2.py` : ⌘K→résultat→modale→install persisté ; `content/skills/*.md`=78/78 ; anti-verbatim ×3 ; `orchestration/verify/p2/` |
| **03-02** Modules | matrice 18/18 leçon↔capture (`coverage.md`), compléments FR, stepper + reader branché sur `lib/progress.ts` | `verify_p3.py` : mark done→stepper X→X+1 + persiste reload ; anti-verbatim ×2 ; `orchestration/verify/p3/coverage.md` |
| **03-03** Brain | wizard 8 sections une-par-écran, 2 chemins IA/manuel, save+badge source `ai\|manual`, stub `draftBrain()` (`lib/brain.ts`) | `verify_p4.py` : 8 sections (eyebrow 1→8), edit→reload persiste, badge ; `orchestration/verify/p4/` |
| **03-04** Tree/Community/Settings | My Tree (ConnectMachine, stats, WeeklyDrops, **TreeAudit réactif à install**), Community (feed « first 100 »), Settings (Member **47 $/mo**, billing Stripe-ready) | `verify_p5.py` : 3 screenshots vs captures, TreeAudit compteur N→N+1 sur install (semé par `page.evaluate`), « 47 $ » ; `orchestration/verify/p5/` |
| **03-05** Dashboards + Chart | 6 command centers (chiffres = `data/dashboards.json` seed 20260611) + RolloutMatrix 7 secteurs × 4 stages × 3 niveaux, « N of M » **recalculés** via `lib/chart.ts` ; câble les 2 placeholders de `MapView.tsx` | `verify_p51.py` : chiffres dashboards = données ; N of M par secteur + totaux 165/36 **non codés en dur** (`grep 165\|36 lib/chart.ts` → 0) ; MAP reste 137 ; `orchestration/verify/p51/` |

**Couplage unique du fan-out :** l'état install. 03-01 **écrit** `lib/installs.ts` (clé `localStorage['skilltree.installs.v1']` + event `skilltree:installs`) ; 03-04 **lit** le même contrat via un helper local (SANS importer le fichier de 03-01, sans overlap de `files_modified`). 03-04 reste vérifiable en isolation (sa preuve sème l'install elle-même). Phase 4 remplace les deux par `/api/install`+`/api/me` sans réécrire l'UI.

## Ta mission (dans l'ordre)

1. **Exécuter** : `/gsd:execute-phase 3` — les 5 plans en wave 1 parallèle (exécuteurs sonnet-4-6/medium). Chaque exécuteur commit atomiquement + écrit son `*-SUMMARY.md` + ses preuves dans `orchestration/verify/p{2,3,4,5,51}/`.
2. **Surveiller le batch 78 fiches (03-01 Task 3)** : gros volume (sous-batché 4×20, haiku/low). Si l'exécuteur manque de contexte en cours → **reprendre, jamais tronquer** les 78 fiches en silence (note du plan-checker). Vérifier le compteur réel `ls content/skills/*.md | wc -l` = 78 en fin de plan.
3. **Revue fidélité + anti-faux-positif (tier fort, TOI)** : pour chaque plan, ouvrir ses screenshots `orchestration/verify/pN/` et comparer aux captures (`nav_hub.png`, `nav_modules.png`, `nav_brain.png`, `nav_tree.png`, `nav_community.png`, `nav_settings.png`, `dashboards/*`, `chart/*`). Contrôler : anti-verbatim réel (spot-check leçons + fiches), Chart « N of M » = valeurs `assert-graph` (165/36) recalculées et non copiées, dashboards = seed 20260611 étiqueté. Piège serveur stale :3010 + SIGPIPE (cf. ci-dessous).
4. **Vérif phase** : le `gsd-verifier` tourne en fin d'`execute-phase` → `03-VERIFICATION.md`. Si `gaps_found` → `/gsd:plan-phase 3 --gaps` puis `/gsd:execute-phase 3 --gaps-only`. Si `passed` → valider les 5 success criteria sur rendu réel puis **push `origin main`**.
5. **Planifier Phase 4** : `/gsd:plan-phase 4` (backend Supabase/RLS/auth — `opus-4-8/high`, irréversible, puis routes sonnet-4-6/medium ; remplace les stubs `install`/`progress`/`draftBrain` posés en Phase 3). Puis écrire `docs/11_HANDOFF_PHASE4.md`.

## Règles dures (non négociables)

- **Anti-faux-positif** : aucune vue « done » sur build vert seul. Preuves = screenshots comparés aux captures + asserts DOM Playwright + **compteurs recalculés** (jamais copiés). Le verifier GSD re-exécute indépendamment. Jamais `|| true`, jamais de fallback silencieux.
- **Verbatim interdit** : 18 leçons + 78 fiches skills réécrites FR — structure fidèle, prose neuve (produit tiers sous abonnement). Spot-check anti-verbatim exigé dans les preuves (aucune fenêtre de 8 mots identique à la source).
- **Chiffres recalculés** : Chart « N of M » depuis la donnée = `assert-graph` (165 total / 36 human-led) ; dashboards = démo déterministe seed 20260611 (D3) étiquetée.
- **Ids jobs = slugs anglais stables (D9)** ; FR = affichage. Contenu jobs (desc/ladder/human) = source EN ; chrome UI = FR.
- **Interfaces stub propres** : `install`/`progress`/`draftBrain` en localStorage, posées pour que Phase 4 (Supabase) les remplace sans réécrire l'UI.
- **Fan-out** : les 5 plans ne partagent aucun `files_modified` (vérifié). Ne pas introduire d'import croisé.
- D1-D9 verrouillées — lire `docs/ARCHITECTURE.md` avant tout arbitrage.
- Commits atomiques, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` (adapter au modèle). Push `origin main` après la phase verte.

## Pièges connus

- **Serveur de preuve** : `cd apps/web && pnpm build` PUIS `npx next start -p 3010`. Toujours vérifier le pid qui tient :3010 (`ss -ltnp`) — un `next start` stale sert l'ancien build (faux négatif). Tuer le serveur en fin de vérif (`pkill -f "next start"`).
- **Jamais piper `pnpm build | head/grep`** : SIGPIPE tronque la génération → chunks 400, hydratation morte. Laisser le build finir (exit 0 vérifié) avant de vérifier. Rediriger vers un fichier log si besoin.
- `next dev` ne lance pas `prebuild` → relancer `pnpm build:catalog` après tout changement de `data/*.json` (catalog.json/types.ts trackés git).
- Playwright : venv `/home/nuveo/.higgsfield-login-venv/bin/python`, chromium en cache `ms-playwright` (vérifié Phase 1+2). API sync. `innerText` renvoie le texte **rendu** (uppercase CSS inclus) → comparer en `.lower()` (piège attrapé en 02-02).
- `orchestration/state.json` untracked (tracker informel) — ignorable, STATE.md/ROADMAP.md font foi.
- Nommage des preuves : `orchestration/verify/p{2,3,4,5,51}/` suit les P-stages de `docs/PLAN.md` (P2 Hub … P5.1 Chart), PAS le numéro de phase — c'est voulu et aligné aux success criteria.

## Prompt prêt à coller (session suivante)

```
Tu es Opus 4.8 (ou Fable 5), effort high, ORCHESTRATEUR du projet SkillTree-OS — reconstruction perso FR du SaaS Altari SkillTree.
cwd = /home/nuveo/projects/skilltree-OS (repo git, remote Matazarn8n/skilltree-OS). NE JAMAIS toucher /home/nuveo/.planning (autre projet).

Lis dans l'ordre : docs/10_HANDOFF_PHASE3.md (ce fichier), .planning/STATE.md, .planning/ROADMAP.md (Phase 3+4), docs/ARCHITECTURE.md (D1-D9), docs/07_VISUAL_SPEC.md, les 5 plans .planning/phases/03-vues-modules-ui/03-0{1..5}-PLAN.md, .planning/phases/02-hero-constellation/02-02-SUMMARY.md (pattern de preuve).

Phase 2 est complete+poussée ; Phase 3 est planifiée+vérifiée (5 plans fan-out wave 1, plan-checker PASSED). Ta mission, dans l'ordre : (1) /gsd:execute-phase 3 (5 plans parallèles, exécuteurs sonnet-4-6/medium) ; (2) surveiller le batch 78 fiches skills de 03-01 (reprendre, jamais tronquer ; compteur ls content/skills/*.md = 78) ; (3) revue fidélité tier-fort (screenshots vs captures nav_*/dashboards/chart, anti-verbatim leçons+fiches, Chart N-of-M recalculé=165/36, dashboards seed 20260611) ; (4) lire 03-VERIFICATION.md, boucler gaps si besoin, valider les 5 success criteria sur rendu réel, push origin main ; (5) /gsd:plan-phase 4 puis écrire docs/11_HANDOFF_PHASE4.md. Règles dures : anti-faux-positif (preuves réelles, pièges serveur stale/SIGPIPE/innerText-uppercase), verbatim interdit, chiffres recalculés, D1-D9, interfaces stub propres pour swap Phase 4. Mode YOLO : prouve chaque livrable sur rendu réel.
```
