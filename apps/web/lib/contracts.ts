import { z } from "zod";

// Contrats API partagés front/back (source de vérité des payloads). Zod = validation + types.
export const SectorSlug = z.enum([
  "operations", "intelligence", "customer", "backoffice", "sales", "deals", "marketing",
]);
export const SkillStatus = z.enum(["live", "drop", "soon"]);
export const SkillStage = z.enum(["foundation", "capture", "generate", "orchestrate"]);

export const SkillDTO = z.object({
  slug: z.string(),
  name: z.string(),
  sector: SectorSlug,
  summary: z.string(),
  autonomy: z.boolean(),
  status: SkillStatus,
  stage: SkillStage,
  installCount: z.number().int().nonnegative(),
  publishedDaysAgo: z.number().int().optional(),
  requires: z.array(z.string()).optional(),
  icon: z.string(),
});

export const SectorDTO = z.object({
  slug: SectorSlug, name: z.string(), tagline: z.string(), colorVar: z.string(), order: z.number().int(),
});

export const CatalogResponse = z.object({
  sectors: z.array(SectorDTO),
  skills: z.array(SkillDTO),
});

export const InstallRequest = z.object({ skillSlug: z.string().min(1) });
export const ApiError = z.object({ error: z.string(), code: z.string() });

export type CatalogResponseT = z.infer<typeof CatalogResponse>;
export type SkillDTOT = z.infer<typeof SkillDTO>;
