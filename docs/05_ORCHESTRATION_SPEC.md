# Spécification opérationnelle — Pipeline d'orchestration multi-agents (Capture → Synthèse → Plan → Exécution)

> Spec pilotable pour un système multi-agents. Cible : reconstruction/intégration d'un produit à partir d'une source live + repo. Rôles modèles : **Fable 5** = synthèse & planification (raisonnement, jugement, irréversible) · **Opus 4.8 / Sonnet** = exécution. Chaque étape a un contrat I/O + une porte de vérification anti-faux-positif.

## Principes invariants
- **P1 — Contrats explicites** : chaque agent reçoit {objectif, entrées, format de sortie, emplacement disque}. Sortie = artefact sur disque, jamais un simple message.
- **P2 — Vérification réelle** : aucune étape n'est "OK" sur un exit code. Preuve = fichier daté non vide, compteur attendu, relecture. Un échec d'auth/collecte FAIT échouer l'étape (exit≠0 + rapport), pas de fallback silencieux.
- **P3 — Isolation session** : agents navigateur = 1 session séquentielle chacun (compte unique) ; agents parse/synthèse = sans navigateur, parallélisables.
- **P4 — Tiering modèle** : Fable5 orchestration+synthèse+revue ; Opus/Sonnet exécution spécifiée ; secrets jamais loggés.

---

## Phase 0 — HANDOFF (amorçage)
**Rôle** : orchestrateur (Fable 5).
**Entrées** : document de handoff (état, décisions, périmètre), credentials (référence disque, jamais en clair), URL cible + repo.
**Actions** :
1. Charger le handoff + les artefacts existants (`data/`, `captures/`, `docs/`).
2. Établir la **work-list** de collecte (pages, ressources, rapports à produire).
3. Partitionner en lots indépendants et instancier les agents de Phase 1 selon P3.
**Sortie** : `orchestration/worklist.json` = [{lot, type(visual|screenshot|download|scrape), cible, agent, sortie_attendue}].
**Porte G0** : worklist non vide, chaque lot a une sortie_attendue et un agent assigné.

## Phase 1 — COLLECTE (agents exécutants, parallèle par lot)
**Rôle** : agents Opus/Sonnet (navigateur + parse).
Lots types :
- **1a · Analyse visuelle** : extraire structure/flow depuis frames/vidéo ou pages rendues → carte comportementale.
- **1b · Captures d'écran** : screenshot retina (device_scale_factor=2, full_page) de chaque état/vue → `captures/**.png`.
- **1c · Téléchargement ressources** : fichiers/artefacts servis (data JS/JSON, fichiers gated en session authentifiée) → `captures/raw/`, `captures/**`.
- **1d · Scrape rapports & contexte** : texte, headings, boutons, réponses API, DOM par page → `captures/content/**.json`.
**Contrat par agent** : {lot_id, cibles[], sélecteurs/login prouvés, format sortie, chemin}. Réutilise le pattern login éprouvé (attente stabilisation SPA + retries).
**Porte G1 (par lot)** : PNG > seuil (p.ex. 30KB) sinon page vide → retry ; JSON contentful ; rapport honnête réussi/vide/échec. Aucun lot marqué "fait" sur shell vide.

## Phase 2 — AGRÉGATION (dataset unique)
**Rôle** : agent parse (sans navigateur) + orchestrateur.
**Actions** :
1. Normaliser chaque artefact (visuels, rapports, fichiers, mémoire contextuelle) en schéma commun.
2. Fusionner en **un dataset unique** versionné : `data/*.json` (modèle structuré) + index `orchestration/dataset.json` (manifeste : chemins, comptes, checksums).
3. Valider invariants (références croisées, complétude, comptes attendus).
**Sortie** : `orchestration/dataset.json` (manifeste) + `data/` consolidé.
**Porte G2** : comptes conformes (ex. N entités attendues), 0 référence orpheline, manifeste relu et cohérent.

## Phase 3 — GÉNÉRATION DU PROMPT FABLE 5
**Rôle** : orchestrateur, via le **skill `fable5-prompting`**.
**Actions** :
1. Appeler `fable5-prompting` pour construire un prompt optimisé qui charge : le dataset agrégé, l'arborescence repo, les docs d'archi, le périmètre.
2. Le prompt doit demander à Fable 5 de : (a) **assimiler** l'intégralité projet+repo, (b) **mapper l'architecture globale** (composants, flux de données, dépendances), (c) **évaluer les modalités d'intégration** (points d'ancrage, contraintes, risques scaling).
**Sortie** : `orchestration/fable5_prompt.md` (prêt à coller/injecter).
**Porte G3** : le prompt référence le dataset réel (chemins existants) + repo, et énonce explicitement les 3 livrables attendus (assimilation, mapping archi, éval intégration).

## Phase 4 — SYNTHÈSE & PLAN (Fable 5)
**Rôle** : Fable 5 (session dédiée).
**Actions** :
1. Ingérer dataset + repo via le prompt de Phase 3.
2. Produire : **cartographie d'architecture cible** + **analyse de tradeoffs/risques** + **plan d'exécution détaillé**.
3. Le plan = phases séquencées, chaque phase = {objectif, livrable, modèle+effort (GSD tiering), dépendances, critère de succès vérifiable}.
**Sortie** : `docs/PLAN.md` (roadmap exécutable) + `docs/ARCHITECTURE.md`.
**Porte G4** : chaque phase du plan a un livrable + critère de succès mesurable + modèle/effort ; dépendances acycliques ; couverture complète du périmètre.

## Phase 5 — EXÉCUTION (agents Opus/Sonnet)
**Rôle** : agents exécutants pilotés par `PLAN.md`.
**Actions** :
1. Fan-out des phases indépendantes → agents Sonnet (impl spécifiée) ; phases archi/irréversibles → Opus/Fable.
2. Chaque agent : commits atomiques, gère loading/vide/erreur, tests/vérif réelle du livrable.
3. Revue croisée sur tier fort (Fable/Opus) avant intégration.
**Sortie** : code + artefacts par phase, état mis à jour dans `orchestration/state.json`.
**Porte G5 (par phase)** : livrable exécuté et **observé** (pas seulement build vert) ; critère de succès de G4 satisfait ; revue passée.

---

## Artefacts & emplacements (contrat disque)
```
orchestration/worklist.json     # G0 : lots de collecte
captures/**                     # G1 : png, raw, content
data/*.json                     # G2 : dataset structuré unique
orchestration/dataset.json      # G2 : manifeste (chemins, comptes, checksums)
orchestration/fable5_prompt.md  # G3 : prompt Fable 5
docs/ARCHITECTURE.md            # G4 : mapping archi cible
docs/PLAN.md                    # G4 : roadmap exécutable (phase→modèle→critère)
orchestration/state.json        # G5 : avancement exécution
```

## Boucle de contrôle
Orchestrateur (Fable 5) : G0→G5 séquentiel ; à chaque porte échouée → rework du lot/phase concerné, pas de progression. Les Phases 1 et 5 fan-outent en interne ; les portes G1/G5 sont par-lot/par-phase. Un artefact vide ou un compte non conforme bloque la porte (P2).

## Résumé des rôles modèles
| Phase | Rôle | Modèle |
|---|---|---|
| 0 Handoff | orchestration, partition | Fable 5 |
| 1 Collecte | visual/screenshot/download/scrape | Opus/Sonnet |
| 2 Agrégation | normalisation, fusion, validation | Sonnet (+ orchestrateur) |
| 3 Prompt Fable5 | via skill `fable5-prompting` | Fable 5 |
| 4 Synthèse & plan | archi + tradeoffs + PLAN | Fable 5 |
| 5 Exécution | impl, tests, revue | Opus/Sonnet, revue Fable/Opus |
