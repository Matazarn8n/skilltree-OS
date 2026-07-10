# HANDOFF — Refonte identité visuelle originale (dé-risque contrefaçon) → Fable 5

> **Modèle : Fable 5, effort `high`** (direction créative/design). Nouvelle phase, orthogonale au backend. cwd OBLIGATOIRE : `/home/nuveo/projects/skilltree-OS`. NE JAMAIS toucher `/home/nuveo/.planning` (autre projet). Rédigé 2026-07-09.

## Pourquoi cette phase existe

L'UI actuelle a été reconstruite **fidèle en structure** à un SaaS tiers (Altari SkillTree). Le **texte** est réécrit (anti-verbatim OK sur 18 leçons + 78 fiches), mais l'**identité visuelle est restée celle de la source** — c'est l'exposition juridique d'un produit revendable. Les `captures/` + la « revue fidélité » (ancienne Phase 6) étaient un **échafaudage pour la parité fonctionnelle**, PAS la cible de livraison. La cible revendable exige une identité **propre**.

### Ressemblances à casser (constaté sur disque)

| Élément | État actuel | Risque |
|---|---|---|
| Palette secteurs | hexes **copiés à l'identique** (`app/globals.css` : `--color-sector-sales #ff9d5c`, deals `#ef4444`, marketing `#a78bfa`, +4) | 🔴 max |
| Typo | Fraunces (serif display) + Inter — pairing signature source | 🔴 |
| Fond/ambiance | dark space-navy `#060810`, accent `#7aa2ff`, radius 0.75rem | 🟠 |
| Roue-constellation | géométrie radiale 7 fans + hub central « Cerveau » — hero signature | 🟠 (fonction générique, traitement visuel = source) |
| Layout/hiérarchie/microcopy/icônes/animations | calqués sur captures | 🟠 |

Terrain : ~50 composants (13 dossiers `components/**`), 10 routes, **tokens centralisés dans `app/globals.css`** → un reskin passe d'abord par les tokens, pas 50 fichiers.

## Placement roadmap

**Nouvelle Phase 6 « Refonte identité visuelle originale »** ; l'actuelle Phase 6 (gel v1) devient **Phase 7**. Séquence : **après P4 (backend) + P5 (onboarding)** — pour que TOUS les écrans reçoivent la nouvelle identité, et éviter le churn de tokens/classes pendant le wiring backend. Indépendante de la donnée (ne touche ni catalogue, ni routes, ni fonctions ; seulement l'**expression**). Outil : `/gsd:insert-phase` (décimale) ou renumérotation.

**⚠️ Inverse le critère de la phase gel** : au lieu de « vérifier la ressemblance aux captures », la phase gel vérifiera la **divergence** (0 match couleur/typo/layout/icône/microcopy vs source) + fonction/a11y/core-value (137 nœuds navigables) préservés.

**CHANGE** (expression) : palette (abandonner les hexes source → système original 7 teintes distinctes + AA), typo (nouveau pairing), échelle d'espacement, radius, formes boutons/cartes/badges/menus, icônes (jeu propre), motion (easing/durées), traitement visuel de la roue (garder le graphe radial = fonction, réinventer le rendu), microcopy, empty/error states, illustrations, structure de composition.
**RESTE** : données, 3 vues du hero (pattern fonctionnel non protégeable), routes, backend, a11y, navigabilité 137 nœuds.

## Prompt prêt à coller (Fable 5, session dédiée)

```text
Tu es Fable 5, effort high, DIRECTEUR ARTISTIQUE de SkillTree-OS — un produit SaaS FR
revendable. cwd = /home/nuveo/projects/skilltree-OS. NE JAMAIS toucher /home/nuveo/.planning.

CONTEXTE CRITIQUE : l'UI actuelle (apps/web, Next 15/React 19/Tailwind 4) a été reconstruite
FIDÈLE EN STRUCTURE à un SaaS tiers existant (Altari SkillTree). Le TEXTE a été réécrit
(anti-verbatim OK) mais l'IDENTITÉ VISUELLE est encore celle de la source : palette secteurs
en hexes IDENTIQUES (app/globals.css : --color-sector-sales #ff9d5c, deals #ef4444, marketing
#a78bfa, +4), typo Fraunces+Inter, fond dark space-navy #060810, roue-constellation radiale à
hub central. Pour vendre ce produit, cette ressemblance visuelle doit être CASSÉE sans perdre
les fonctions.

Ta mission — produis 3 livrables, dans .planning/phases/06-refonte-visuelle/ :

1. AUDIT-RESSEMBLANCE.md — inventaire EXHAUSTIF de tout ce qui est trop proche de la source :
   pour chaque élément (palette, typo, layout, hiérarchie, icônes, microcopy, animations,
   formes de composants, traitement de la roue, empty/error states, assets, noms de classes,
   structure), cote le risque (élevé/moyen/faible) et cite le fichier:ligne réel. Lis
   réellement app/globals.css, les ~50 composants (components/**), les 10 routes (app/**),
   docs/07_VISUAL_SPEC.md, et compare aux captures/ (la référence à FUIR, pas à matcher).

2. DIRECTION-VISUELLE.md — UNE direction UI originale, premium, cohérente, avec un NOM
   d'identité propre : nouveau système de couleur (7 teintes secteur distinctes + AA light/dark,
   AUCUNE reprise des hexes source), nouveau pairing typographique, échelle d'espacement + radius,
   langage de formes (boutons/cartes/badges/menus), principes de motion (easing/durées), jeu
   d'icônes propre, restyle de la roue (garder le graphe radial fonctionnel, réinventer le rendu),
   ton de microcopy. Justifie chaque choix comme DIVERGENCE délibérée de la source. Fournis les
   tokens concrets (valeurs CSS prêtes à coller dans globals.css).

3. PLAN-MIGRATION.md — au format GSD (frontmatter wave/depends_on/files_modified/must_haves,
   tâches XML) : ordre tokens → composants primitifs (ui/) → composants métier → motion → icônes
   → microcopy → structure de composition, mappé aux fichiers RÉELS de l'inventaire. must_haves =
   critères de DIVERGENCE observables (0 hex secteur source résiduel : grep ; typo changée ;
   layout recomposé ; a11y AA préservée ; 137 nœuds toujours navigables ; fonctions intactes).

RÈGLES DURES :
- Divergence RÉELLE, pas cosmétique : le résultat ne doit PAS ressembler au même site retraduit
  ou recoloré. Repense la composition, pas juste les valeurs.
- Fonctions/données/routes/backend INTOUCHÉS — tu changes l'EXPRESSION, pas la fonction.
- A11y non négociable : contraste AA en clair ET sombre, reduced-motion, navigation clavier.
- Chiffres/données jamais inventés ; le catalogue (137/78/7) reste la vérité.
- Ancre tout dans les fichiers réels (cite chemin:ligne), zéro affirmation non vérifiée.

Livre les 3 .md, puis retourne un résumé : top-10 des ressemblances à casser + le nom de la
nouvelle identité + l'ordre des vagues de migration.
```

## Séquençage vs Phase 4

Phase 4 (backend) est en cours (04-01 cœur sécurité fait+poussé `ad1a6f7` ; reste auth clients + 04-02). **Finir Phase 4 avant** cette refonte (le backend ne touche que `lib/*` + TreeAudit/MyTree ; la refonte touche tokens + ~50 composants → churn si concurrent). Voir `docs/11_HANDOFF_PHASE4.md`.
