import type { Sector, Skill, ModuleMeta, SectorSlug, SkillFile, CommandCenter } from "./types";
import catalog from "./catalog.json";

// ── Catalogue réel — généré par tools/build_catalog.mjs depuis data/*.json.
// Ne PAS éditer catalog.json/types.ts à la main : `node tools/build_catalog.mjs` les régénère.
// Deux régimes de données jamais mélangés (docs/ARCHITECTURE.md §2) : ce module ne sert
// QUE le catalogue statique (secteurs/jobs/skills/dashboards) — le state user vient de lib/db.ts.

export const SECTORS: Sector[] = catalog.sectors as Sector[];

/** Les 137 jobs de la roue MAP (origin='map'). C'est la vérité D2 — jamais les extras CHART. */
export const SKILLS: Skill[] = (catalog.jobs as Skill[]).filter((j) => j.origin === "map");

/** Les 165 jobs (137 + 28 extras human-led), pour la vue CHART uniquement (D2, P5.1). */
export const CHART_JOBS: Skill[] = catalog.jobs as Skill[];

/** Les 78 fiches skills complètes (captures/skill_files_full/*.md). */
export const SKILL_FILES: SkillFile[] = catalog.skills as SkillFile[];

/** Les 6 command centers (démo déterministe, D3 — cf. docs/ARCHITECTURE.md). */
export const DASHBOARDS: CommandCenter[] = catalog.dashboards as CommandCenter[];

/** Racine virtuelle du graphe ("Cerveau d'entreprise" / Company Knowledge Base). */
export const HUB = catalog.hub;

// Config d'app (pas de la donnée catalogue au sens data/*.json) : les 3 modules de leçons.
export const MODULES: ModuleMeta[] = [
  { slug: "start-here",   title: "Commence ici",           subtitle: "L'état d'esprit et la carte avant d'ouvrir un terminal.", order: 0, lessonCount: 8 },
  { slug: "foundations",  title: "Fondations Claude Code", subtitle: "Installer, comprendre, configurer, brancher.",           order: 1, lessonCount: 5 },
  { slug: "second-brain", title: "Construis ton Brain",    subtitle: "La base que tout ce que tu bâtis vient lire.",           order: 2, lessonCount: 5 },
];

// Pas de données réelles de publication/installation (aucune n'existe dans data/*.json) —
// on ne fabrique rien : ces listes restent vides tant que P6 (state user réel) n'est pas là.
// Les composants Hub gèrent déjà l'état vide (EmptyState).
export const FRESH_DROPS: Skill[] = [];
export const MOST_INSTALLED: Skill[] = [];

export const bySector = (slug: string) => SKILLS.filter((s) => s.sector === slug);
export const sectorOf = (slug: SectorSlug) => SECTORS.find((s) => s.slug === slug)!;
export const skillBySlug = (slug: string) => CHART_JOBS.find((s) => s.slug === slug);
