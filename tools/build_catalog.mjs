#!/usr/bin/env node
// tools/build_catalog.mjs
//
// Consolide data/*.json (source de vérité) en un catalogue unique consommé par
// apps/web/lib/catalog/catalog.json. Ne fabrique AUCUNE donnée : toute jointure
// manquante (job absent de skills.json, req non résolu, fichier skill orphelin,
// comptes qui ne matchent pas le manifeste) fait échouer le build (exit 1).
//
// Réconciliation D2 (docs/ARCHITECTURE.md §7) : data/skills.json (137 jobs) = vérité
// de la roue MAP. data/chart.json contient déjà les 165 jobs CHART (137 + 28 extras
// human-led) — vérifié réconcilié sur disque (7 secteurs, 36 human-led, cf. audit P0).
// Les extras sont ajoutés avec origin='chart', jamais rendus dans la roue MAP.
//
// Sortie : apps/web/lib/catalog/catalog.json { meta, sectors, jobs(165, origin map|chart), skills(78), dashboards(6), hub }

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "data");
const CAPTURES_DIR = path.join(ROOT, "captures");
const OUT_DIR = path.join(ROOT, "apps/web/lib/catalog");

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function fail(msg) {
  console.error(`[build_catalog] ERREUR: ${msg}`);
  process.exit(1);
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Secteur : nom d'affichage FR + tagline réécrite (jamais copiée verbatim) — le
// reste (couleur, ordre) vient strictement de data/tree.json (D9 / ARCHITECTURE §3.1).
const SECTOR_FR = {
  Sales: { name: "Ventes", tagline: "ciblage · prospection · séquençage" },
  Deals: { name: "Affaires", tagline: "réponses · appels · closing · pipeline" },
  Marketing: { name: "Marketing", tagline: "contenu · marque · distribution" },
  Operations: { name: "Opérations", tagline: "onboarding · builds · ops client" },
  Intelligence: { name: "Intelligence", tagline: "entreprises · personnes · marchés" },
  Customer: { name: "Clients", tagline: "support · succès · communauté" },
  "Back Office": { name: "Back-office", tagline: "finances · comptabilité · admin · RH" },
};

// Racine virtuelle du graphe (D-hub) : "Company Knowledge Base" est référencée en
// req par 31 jobs mais n'est pas un job de skills.json — c'est le hub central de
// la constellation (ARCHITECTURE §3.1 "Cerveau d'entreprise"). Pas un des 137.
const HUB_SOURCE_NAME = "Company Knowledge Base";
const HUB_SLUG = "company-knowledge-base";

const tree = readJSON(path.join(DATA_DIR, "tree.json"));
const skillsSrc = readJSON(path.join(DATA_DIR, "skills.json")); // 137, keyed by job name
const skillFiles = readJSON(path.join(DATA_DIR, "skill_files.json")); // 78, keyed by slug
const chartSrc = readJSON(path.join(DATA_DIR, "chart.json")); // 165 déjà réconciliés
const dashboardsSrc = readJSON(path.join(DATA_DIR, "dashboards.json")); // 6 centers

if (!Array.isArray(tree) || tree.length !== 7) {
  fail(`data/tree.json: ${Array.isArray(tree) ? tree.length : "invalide"} secteurs (attendu 7)`);
}

// ── 1. Secteurs (source: tree.json, jamais inventés) ───────────────────────
const sectors = [];
const sectorSlugBySourceName = new Map();
let functionCount = 0;

tree.forEach((s, i) => {
  const fr = SECTOR_FR[s.sector];
  if (!fr) fail(`secteur "${s.sector}" sans traduction FR déclarée (SECTOR_FR)`);
  const slug = slugify(s.sector);
  sectorSlugBySourceName.set(s.sector, slug);
  sectors.push({
    slug,
    sourceName: s.sector,
    name: fr.name,
    tagline: fr.tagline,
    colorVar: s.color, // hex direct depuis tree.json (D9) — jamais approximé
    order: i,
  });
  functionCount += s.functions.length;
});

// ── 2. Jobs "map" (137, enrichis depuis skills.json) ───────────────────────
const skillFilePathToSlug = new Map();
for (const [slug, f] of Object.entries(skillFiles)) skillFilePathToSlug.set(f.path, slug);

const jobsBySourceName = new Map();
const jobs = [];
let orphanFiles = 0;

for (const sector of tree) {
  const sectorSlug = sectorSlugBySourceName.get(sector.sector);
  for (const fn of sector.functions) {
    for (const j of fn.jobs) {
      const enriched = skillsSrc[j.name];
      if (!enriched) fail(`job "${j.name}" (secteur ${sector.sector}) absent de data/skills.json`);

      const files = (enriched.files || []).map((f) => {
        const fslug = skillFilePathToSlug.get(f.path);
        if (!fslug) {
          orphanFiles++;
          fail(`skill file orphelin: job "${j.name}" référence "${f.path}" absent de skill_files.json`);
        }
        const mdPath = path.join(CAPTURES_DIR, "skill_files_full", `${fslug}.md`);
        if (!fs.existsSync(mdPath)) {
          orphanFiles++;
          fail(`markdown manquant sur disque: ${mdPath} (job "${j.name}")`);
        }
        return { slug: fslug, label: f.label };
      });

      const job = {
        slug: slugify(j.name),
        name: j.name,
        sector: sectorSlug,
        function: fn.name,
        desc: enriched.desc ?? j.desc ?? "",
        skills: enriched.skills ?? j.skills ?? [],
        integrations: enriched.integrations ?? j.integrations ?? [],
        level: enriched.level ?? j.level,
        stage: enriched.stage ?? null,
        stageName: enriched.stage_name ?? null,
        ladder: enriched.ladder ?? null,
        replaces: enriched.replaces ?? null,
        notes: enriched.notes ?? null,
        human: enriched.human ?? null,
        reqNames: enriched.req ?? [],
        files,
        origin: "map",
      };
      jobsBySourceName.set(j.name, job);
      jobs.push(job);
    }
  }
}

if (jobs.length !== 137) fail(`jobs map: ${jobs.length} (attendu 137)`);

// résolution req -> slugs (D9). "Company Knowledge Base" = racine virtuelle, pas un job.
let reqUnresolved = 0;
for (const job of jobs) {
  job.requires = job.reqNames
    .map((name) => {
      if (name === HUB_SOURCE_NAME) return { slug: HUB_SLUG, name: HUB_SOURCE_NAME };
      const target = jobsBySourceName.get(name);
      if (!target) {
        reqUnresolved++;
        console.error(`[build_catalog] req non résolu: "${job.name}" -> "${name}"`);
        return null;
      }
      return { slug: target.slug, name: target.name };
    })
    .filter(Boolean);
  delete job.reqNames;
}
if (reqUnresolved > 0) fail(`${reqUnresolved} req non résolus (voir logs ci-dessus)`);

// ── 3. CHART (165 = 137 + 28 extras human-led) ─────────────────────────────
// data/chart.json est déjà réconcilié sur disque (audité : 7 secteurs, 165 jobs,
// 36 human-led). On l'utilise directement ; on vérifie quand même les comptes ici
// plutôt que de faire confiance à un exit 0 silencieux (anti faux-positif).
if (chartSrc.sector_count !== 7) fail(`chart.json sector_count=${chartSrc.sector_count} (attendu 7)`);
if (chartSrc.total_jobs !== 165) fail(`chart.json total_jobs=${chartSrc.total_jobs} (attendu 165)`);
if (chartSrc.total_human_led !== 36) fail(`chart.json total_human_led=${chartSrc.total_human_led} (attendu 36)`);

let chartTotalJobs = 0;
let chartHumanLed = 0;
let chartExtras = 0;
for (const [chartSectorName, s] of Object.entries(chartSrc.sectors)) {
  const sectorSlug = sectorSlugBySourceName.get(chartSectorName);
  if (!sectorSlug) fail(`secteur CHART "${chartSectorName}" ne correspond à aucun secteur de tree.json`);
  for (const j of s.jobs) {
    chartTotalJobs++;
    if (j.level === "human-led") chartHumanLed++;
    if (jobsBySourceName.has(j.name)) continue; // déjà dans les 137 (recoupement)
    chartExtras++;
    const job = {
      slug: slugify(j.name),
      name: j.name,
      sector: sectorSlug,
      function: null,
      desc: j.desc ?? "",
      skills: j.skills ?? [],
      integrations: [],
      level: j.level,
      stage: j.stage ?? null,
      stageName: j.meta ?? null,
      ladder: null,
      replaces: null,
      notes: null,
      human: null,
      requires: [],
      files: [],
      origin: "chart",
    };
    jobsBySourceName.set(j.name, job);
    jobs.push(job);
  }
}

if (chartTotalJobs !== 165) fail(`chart recompté: ${chartTotalJobs} jobs (attendu 165)`);
if (chartHumanLed !== 36) fail(`chart recompté: ${chartHumanLed} human-led (attendu 36)`);
if (chartExtras !== 28) fail(`chart extras (hors 137): ${chartExtras} (attendu 28)`);
if (jobs.length !== 165) fail(`total jobs (map+chart): ${jobs.length} (attendu 165)`);

// ── 4. Skills / fiches (78) ─────────────────────────────────────────────────
const skills = [];
for (const [slug, f] of Object.entries(skillFiles)) {
  const mdPath = path.join(CAPTURES_DIR, "skill_files_full", `${slug}.md`);
  if (!fs.existsSync(mdPath)) fail(`skill "${slug}": markdown manquant (${mdPath})`);
  skills.push({ slug, title: f.title, what: f.what, needs: f.needs, path: f.path });
}
if (skills.length !== 78) fail(`skills: ${skills.length} (attendu 78)`);

// ── 5. Dashboards (6 command centers, démo déterministe D3) ────────────────
const dashboards = dashboardsSrc.centers ?? [];
if (dashboards.length !== 6) fail(`dashboards: ${dashboards.length} (attendu 6)`);

// ── 6. Écriture catalogue ───────────────────────────────────────────────────
fs.mkdirSync(OUT_DIR, { recursive: true });

const jobsMapCount = jobs.filter((j) => j.origin === "map").length;
const humanLedCount = jobs.filter((j) => j.level === "human-led").length;

const catalog = {
  meta: {
    builtAt: new Date().toISOString(),
    sectors: sectors.length,
    functions: functionCount,
    jobsMap: jobsMapCount,
    jobsChart: jobs.length,
    chartExtras,
    skills: skills.length,
    dashboards: dashboards.length,
    humanLed: humanLedCount,
    reqUnresolved,
    orphanFiles,
  },
  hub: { slug: HUB_SLUG, name: HUB_SOURCE_NAME },
  sectors,
  jobs,
  skills,
  dashboards,
};

fs.writeFileSync(path.join(OUT_DIR, "catalog.json"), JSON.stringify(catalog, null, 2));
console.log(`[build_catalog] écrit -> ${path.relative(ROOT, path.join(OUT_DIR, "catalog.json"))}`);

// ── 7. Types domaine générés ────────────────────────────────────────────────
// Reprend exactement les définitions historiques de apps/web/lib/types.ts (alignées
// sur la forme réellement émise dans catalog.json ci-dessus) pour que le build
// POSSÈDE et régénère ces types plutôt que de dépendre d'un fichier édité à la main.
const TYPES_TS = `// GÉNÉRÉ par tools/build_catalog.mjs — ne pas éditer à la main
// Domain types — mirrors apps/web/lib/catalog/catalog.json, généré depuis data/*.json
// (137 jobs, 78 skills, 7 secteurs — cf. docs/ARCHITECTURE.md).
export type SectorSlug =
  | "sales" | "deals" | "marketing" | "operations"
  | "intelligence" | "customer" | "back-office";

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

/** Un "job" du catalogue (nommé \`Skill\` historiquement dans le prototype — les
 *  composants UI l'appellent encore skill). Un job référence 1..n \`skills\` (tags de
 *  capacité fins, ex. "email-finder") et 0..n \`files\` (fiches skill complètes, 78 au total). */
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
`;

fs.writeFileSync(path.join(OUT_DIR, "types.ts"), TYPES_TS);
console.log(`[build_catalog] écrit -> ${path.relative(ROOT, path.join(OUT_DIR, "types.ts"))}`);

console.log(
  `[build_catalog] OK sectors=${sectors.length} functions=${functionCount} ` +
    `jobs_map=${jobsMapCount} jobs_chart=${jobs.length} chart_extras=${chartExtras} ` +
    `skills=${skills.length} dashboards=${dashboards.length} human_led=${humanLedCount} ` +
    `req_unresolved=${reqUnresolved} orphans=${orphanFiles}`
);
