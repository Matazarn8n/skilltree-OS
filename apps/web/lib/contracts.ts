import { z } from "zod";

// Contrats API partagés front/back (source de vérité des payloads). Zod = validation + types.
// Miroir de lib/types.ts, lui-même généré depuis apps/web/lib/catalog/catalog.json.
export const SectorSlug = z.enum([
  "sales", "deals", "marketing", "operations", "intelligence", "customer", "backoffice",
]);
export const JobLevel = z.enum(["autonomous", "assisted", "human-led"]);
export const JobOrigin = z.enum(["map", "chart"]);

export const JobRef = z.object({ slug: z.string(), name: z.string() });
export const SkillFileRef = z.object({ slug: z.string(), label: z.string() });
export const JobLadder = z.object({ manual: z.string(), assisted: z.string(), autonomous: z.string() });

export const SkillDTO = z.object({
  slug: z.string(),
  name: z.string(),
  sector: SectorSlug,
  function: z.string().nullable(),
  desc: z.string(),
  skills: z.array(z.string()),
  integrations: z.array(z.string()),
  level: JobLevel,
  stage: z.number().int().min(1).max(4).nullable(),
  stageName: z.string().nullable(),
  ladder: JobLadder.nullable(),
  replaces: z.string().nullable(),
  notes: z.string().nullable(),
  human: z.string().nullable(),
  requires: z.array(JobRef),
  files: z.array(SkillFileRef),
  origin: JobOrigin,
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
