# HANDOFF — SkillTree-OS (session 2026-07-07)

## État : reconstruction perso FR de SkillTree. Repo `~/projects/skilltree-OS`.

## ✅ Fait & vérifié
- **Recherche** : vidéo parcours (13:30, 60 frames) → `docs/01_behavioral_map.md` (carte comportementale complète, 7 secteurs, tous modules).
- **Capture authentifiée** (`tools/*.py`, Playwright, login via `.env.md` jamais loggé) :
  - 7 pages app + **18 leçons capturées verbatim** (`captures/lessons/*.json` + PNG retina).
  - Reverse API : backend réel = Supabase + Vercel, endpoints `/api/{token,onboarding,my-progress,my-tree,persona,access}`.
- **Plan** : `docs/00_master_plan.md` (décisions, tradeoffs, data model, API, roadmap P0-P7, risques scaling).
- **Front spine** (buildé, `✓ Compiled successfully`) : design system `app/globals.css` (thème sombre+clair), shell (Sidebar/CommandBar/ThemeToggle), hero **carte** (constellation SVG a11y + grille par étape + panneau skill), catalogue seed FR (`lib/data.ts`, 30 skills / 7 secteurs).
- **Backend** : `lib/contracts.ts` (Zod), `lib/db.ts` (seed→Supabase, mêmes signatures), routes `app/api/{catalog,skills/[slug],my-tree}`, `supabase/schema.sql` (Postgres + RLS multi-tenant).
- **Sous-agents Sonnet livrés (typecheck 0)** : Hub · Settings · Community.

## ✅ Intégration finale (fait & vérifié)
- Modules + 18 leçons FR, Brain, My tree, Onboarding, Settings, Community : tous livrés.
- **Build consolidé vert** : `pnpm typecheck` (0) + `pnpm build` (`✓ Compiled successfully`, 14 routes).
- **Runtime vérifié** : `next start`, toutes routes HTTP 200 (/ = 307→/map), HTML rendu FR, `/api/catalog` → JSON FR réel. Pas de faux-positif.

## ▶️ Reste à faire (optionnel, prochaine session)
1. **Vérif visuelle fine** : screenshots `/map`,`/hub`,`/brain` comparés aux captures d'origine (build+runtime déjà verts).
2. **Branchement Supabase live** : appliquer `supabase/schema.sql`, seed depuis `lib/data.ts`, remplir env `SUPABASE_*` → `lib/db.ts` bascule sans changer les signatures.
3. **Skill detail complet** : composants `BuildGuide` + `CommandCenter` par skill (tables `build_guides`/`command_centers` déjà au schéma ; données à saisir).
4. **Landing marketing** `app/(marketing)` (SEO), + capture profonde par-nœud si besoin de tout le catalogue d'origine.

## Décisions clés
- **ShowUI-Aloha écarté** : Playwright scripté > agent vision (DOM authentifié + API dispo, plus fiable/reproductible).
- **Fidélité** : structure/UX/états 1:1 ; texte leçons/skills **réécrit FR** (pas copie verbatim — cadre « réinterprétation, pas redistribution »). Choix utilisateur confirmé.
- **Stack** alignée sur l'original (Next+Supabase). Graphe relationnel + arêtes explicites. Layout map analytique déterministe (<300 nœuds). RLS dès le départ. Pas de Redis/microservices/GraphQL palier 1.
- **Modèles** : archi/hero sur Fable 5 (moi) ; impl modules déléguée à Sonnet //.

## Sécurité
- `.env.md` (creds compte payant) : gitignored, jamais committé/loggé. `captures/` gitignored.
- Aucun commit fait (utilisateur ne l'a pas demandé).
