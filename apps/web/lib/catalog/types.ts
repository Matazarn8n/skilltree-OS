// GÉNÉRÉ par tools/build_catalog.mjs — ne pas éditer à la main
// Domain types — mirrors apps/web/lib/catalog/catalog.json, généré depuis data/*.json
// (137 jobs, 78 skills, 7 secteurs — cf. docs/ARCHITECTURE.md).
export type SectorSlug =
  | "sales" | "deals" | "marketing" | "operations"
  | "intelligence" | "customer" | "backoffice";

export type JobLevel = "autonomous" | "assisted" | "human-led";
/** origin='map' = un des 137 jobs de la roue. origin='chart' = extra human-led visible
 *  uniquement dans la vue CHART (D2, docs/ARCHITECTURE.md#d2). */
export type JobOrigin = "map" | "chart";

export interface Sector {
  slug: SectorSlug;
  name: string;        // libellé display (FR)
  tagline: string;     // sous-titre réécrit depuis tree.json[].sub
  colorVar: string;    // hex direct depuis data/tree.json (D9)
  order: number;
}

export interface JobRef { slug: string; name: string; }
export interface SkillFileRef { slug: string; label: string; }
export interface JobLadder { manual: string; assisted: string; autonomous: string; }

/** Un "job" du catalogue (nommé `Skill` historiquement dans le prototype — les
 *  composants UI l'appellent encore skill). Un job référence 1..n `skills` (tags de
 *  capacité fins, ex. "email-finder") et 0..n `files` (fiches skill complètes, 78 au total). */
export interface Skill {
  slug: string;             // slugify(name), stable (D9)
  name: string;             // nom source (anglais)
  sector: SectorSlug;
  function: string | null;  // null pour les extras CHART (pas de fonction dans tree.json)
  desc: string;
  skills: string[];         // tags de capacité (ex. email-finder, phone-appender)
  integrations: string[];
  level: JobLevel;
  stage: number | null;     // 1-4, null si human-led sans stage
  stageName: string | null; // "Foundation" | "Capture" | "Generate" | "Orchestrate" | meta CHART
  ladder: JobLadder | null;
  replaces: string | null;
  notes: string | null;
  human: string | null;
  requires: JobRef[];       // prérequis résolus en {slug,name} (D9)
  files: SkillFileRef[];    // fiches skill complètes (captures/skill_files_full/*.md)
  origin: JobOrigin;
}

export interface SkillFile {
  slug: string;
  title: string;
  what: string;
  needs: string;
  path: string;
}

export interface CommandCenterStat { label: string; value: string; delta?: string; }
export interface CommandCenter {
  id: string;
  short: string;
  name: string;
  sub: string;
  color: string;
  range_days: number;
  stats: CommandCenterStat[];
  tables: Record<string, unknown>;
}

export interface LessonMeta {
  slug: string; module: string; title: string; order: number; estMin: number;
}

export interface ModuleMeta {
  slug: string; title: string; subtitle: string; order: number; lessonCount: number;
}
