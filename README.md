# SkillTree-OS

Reconstruction personnelle **FR** de SkillTree (plateforme d'apprentissage gamifiée « skill tree » pour monter une force de travail IA avec Claude Code). Usage perso / inspiration UX, intégrable HERMES-OS. Réinterprétation visuelle & comportementale — pas un clone du bundle ni copie du contenu de cours.

## Ce qui existe

```
docs/
  00_master_plan.md      Plan tech-lead : décisions, tradeoffs, data model, API, roadmap
  01_behavioral_map.md   Carte comportementale (source : vidéo parcours + crawl authentifié)
tools/
  capture.py / crawl.py  Capture authentifiée Playwright (login via .env.md, jamais loggé)
  deep_crawl.py sniff.py Leçons + probe map + reverse des endpoints API
captures/                Screenshots retina + contenu scrapé (gitignored)
supabase/schema.sql      Schéma Postgres cible (RLS multi-tenant)
apps/web/                Application Next.js 15 (App Router, React 19, Tailwind v4, TS)
```

## Application

```bash
cd apps/web
pnpm install
pnpm dev        # http://localhost:3000  -> redirige vers /map
pnpm build      # build de prod
pnpm typecheck  # tsc --noEmit
```

### Architecture front
- **Shell** : `app/(app)/layout.tsx` (Sidebar FR + CommandBar ⌘K + bascule thème sombre/clair).
- **Hero** : `components/map/` — constellation SVG accessible (7 secteurs, layout radial déterministe) + vue grille par étape, panneau skill partagé.
- **Design system** : `app/globals.css` (tokens `var(--*)`, accents par secteur, thème double).
- **Données** : `lib/data.ts` (catalogue seed FR), `lib/types.ts`, `lib/map-layout.ts`.
- **Backend** : `app/api/*` (catalog / skills / my-tree, typés Zod, cachés), `lib/db.ts` (seed → Supabase sans changer les signatures), `lib/contracts.ts`.

### Modules
Carte · Hub · Modules (3 modules, 18 leçons FR) · Mon arbre · Brain (8 sections) · Communauté · Réglages · Onboarding.

## Fidélité
Structure/UX/états reproduits à l'identique depuis la source ; textes des leçons et skills **réécrits en FR** (pas de copie verbatim). Données perso via compte payant propre. Creds dans `.env.md` (gitignored, jamais committé/loggé).

## Décisions clés (voir docs/00_master_plan.md)
Next.js + Supabase (aligné sur l'original) · graphe relationnel + arêtes explicites (pas de JSON d'arbre) · layout map analytique (< 300 nœuds) · leçons en contenu versionné · RLS dès le départ · pas de Redis/microservices/GraphQL au palier 1 (YAGNI, upgrade paths notés).
