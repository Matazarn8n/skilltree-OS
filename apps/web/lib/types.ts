// Domain types — shared front/back. Mirrors the Postgres schema in docs/00_master_plan.md §2.
export type SectorSlug =
  | "operations" | "intelligence" | "customer"
  | "backoffice" | "sales" | "deals" | "marketing";

export type SkillStatus = "live" | "drop" | "soon";
export type SkillStage = "foundation" | "capture" | "generate" | "orchestrate";

export interface Sector {
  slug: SectorSlug;
  name: string;        // libellé display (FR)
  tagline: string;     // sous-titre 3 mots
  colorVar: string;    // var(--color-sector-*)
  order: number;
}

export interface Skill {
  slug: string;
  name: string;
  sector: SectorSlug;
  summary: string;       // description FR réécrite
  autonomy: boolean;     // badge "Entièrement autonome"
  status: SkillStatus;
  stage: SkillStage;
  installCount: number;
  publishedDaysAgo?: number; // pour "Fresh drops"
  requires?: string[];   // slugs prérequis -> arêtes du graphe
  icon: string;          // clé d'icône
}

export interface BuildStep { title: string; body: string; code?: string; }

export interface CommandCenter {
  title: string;
  metrics: { label: string; value: string }[];
}

export interface LessonMeta {
  slug: string; module: string; title: string; order: number; estMin: number;
}

export interface ModuleMeta {
  slug: string; title: string; subtitle: string; order: number; lessonCount: number;
}
