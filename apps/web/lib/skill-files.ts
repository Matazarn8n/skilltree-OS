import fs from "node:fs";
import path from "node:path";
import { SKILL_FILES } from "./catalog";
import { sectorForSkillFile, type SkillFileSector } from "./hub-data";

// Loader SERVEUR des 78 fiches skills FR (apps/web/content/skills/<slug>.md, écrites en
// Task 3 de ce plan). N'utilise `fs` que côté serveur : ce module doit être importé
// UNIQUEMENT depuis des Server Components (ex. app/(app)/layout.tsx, hub/page.tsx) qui
// passent ensuite le résultat déjà résolu (JSON sérialisable) en props aux Client
// Components (CommandBar, InstallModal, FreshDrops…) — `fs` n'existe pas dans le bundle
// navigateur, donc jamais d'appel direct à getSkillFile() depuis un fichier "use client".
//
// Phase 4 remplacera le corps par une lecture Supabase/CDN ; la forme de SkillFileContent
// et la fonction getSkillFile(slug) restent stables pour ne pas réécrire l'UI.

export interface SkillFileContent {
  slug: string;
  title: string;
  what: string;
  needs: string;
  sector: SkillFileSector | null;
  /** true si content/skills/<slug>.md existe réellement (false = fallback catalogue EN). */
  fromMarkdown: boolean;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "skills");

function extractSection(body: string, heading: string): string | null {
  const lines = body.split("\n");
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (start === -1 && lines[i].trim() === `## ${heading}`) {
      start = i + 1;
      continue;
    }
    if (start !== -1 && /^##\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  if (start === -1) return null;
  const content = lines.slice(start, end).join("\n").trim();
  const firstPara = content.split(/\n\s*\n/)[0] || content;
  return firstPara.replace(/\s+/g, " ").trim();
}

function parseMarkdown(raw: string, slug: string): { title: string; what: string; needs: string } | null {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const body = fmMatch ? raw.slice(fmMatch[0].length) : raw;

  const h1Match = body.match(/^#\s+(.+)$/m);
  const rawTitle = h1Match ? h1Match[1] : slug;
  const title = rawTitle.split(" · ")[0].trim();

  const what = extractSection(body, "Ce que ça fait");
  const needs = extractSection(body, "Clés API requises");
  if (!what || !needs) return null;

  return { title, what, needs };
}

/** Lit une fiche FR ; fallback propre sur les métadonnées catalogue (EN) si le .md
 *  n'existe pas encore ou ne parse pas — le build reste vert entre Task 2 et Task 3. */
export function getSkillFile(slug: string): SkillFileContent {
  const sector = sectorForSkillFile(slug);
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = parseMarkdown(raw, slug);
    if (parsed) {
      return { slug, ...parsed, sector, fromMarkdown: true };
    }
  } catch {
    // fichier absent ou illisible — fallback ci-dessous.
  }

  const fallback = SKILL_FILES.find((s) => s.slug === slug);
  return {
    slug,
    title: fallback?.title ?? slug,
    what: fallback?.what ?? "Fiche non disponible.",
    needs: fallback?.needs ?? "Non renseigné.",
    sector,
    fromMarkdown: false,
  };
}

/** Toutes les fiches (78), résolues une fois côté serveur puis passées en props. */
export function getAllSkillFiles(): Record<string, SkillFileContent> {
  const out: Record<string, SkillFileContent> = {};
  for (const sf of SKILL_FILES) {
    out[sf.slug] = getSkillFile(sf.slug);
  }
  return out;
}
