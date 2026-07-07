#!/usr/bin/env node
// tools/assert-graph.mjs
//
// Vérification indépendante du catalogue généré par build_catalog.mjs. Ne fait PAS
// confiance à l'exit code du build : relit apps/web/lib/catalog/catalog.json depuis
// le disque et recompte tout depuis zéro contre le manifeste (orchestration/dataset.json).
// Échoue (exit 1) sur le premier écart. Câblé dans `pnpm build` (voir package.json).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CATALOG_PATH = path.join(ROOT, "apps/web/lib/catalog/catalog.json");
const CAPTURES_DIR = path.join(ROOT, "captures");
const MANIFEST_PATH = path.join(ROOT, "orchestration/dataset.json");

const EXPECT = {
  sectors: 7,
  functions: 34,
  jobsMap: 137,
  jobsChart: 165,
  chartExtras: 28,
  skills: 78,
  dashboards: 6,
  humanLed: 36,
};

const failures = [];
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(`  ${ok ? "OK  " : "FAIL"} ${label}=${actual} (attendu ${expected})`);
  if (!ok) failures.push(`${label}: ${actual} != ${expected}`);
}

if (!fs.existsSync(CATALOG_PATH)) {
  console.error(`[assert-graph] ERREUR: catalogue introuvable (${CATALOG_PATH}). Lancer build_catalog.mjs d'abord.`);
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));

console.log("[assert-graph] comptes vs manifeste :");
check("sectors", catalog.sectors.length, EXPECT.sectors);

const functionSlugs = new Set();
for (const j of catalog.jobs) if (j.origin === "map" && j.function) functionSlugs.add(`${j.sector}::${j.function}`);
check("functions", functionSlugs.size, EXPECT.functions);

const jobsMap = catalog.jobs.filter((j) => j.origin === "map");
const jobsChart = catalog.jobs; // 165 = map(137) + chart extras(28)
const chartExtras = catalog.jobs.filter((j) => j.origin === "chart");
const humanLed = catalog.jobs.filter((j) => j.level === "human-led");

check("jobs_map", jobsMap.length, EXPECT.jobsMap);
check("jobs_chart", jobsChart.length, EXPECT.jobsChart);
check("chart_extras", chartExtras.length, EXPECT.chartExtras);
check("skills", catalog.skills.length, EXPECT.skills);
check("dashboards", catalog.dashboards.length, EXPECT.dashboards);
check("human_led", humanLed.length, EXPECT.humanLed);

// req 100% résolus : chaque requires[].slug doit être un job existant OU le hub virtuel
const jobSlugs = new Set(catalog.jobs.map((j) => j.slug));
jobSlugs.add(catalog.hub?.slug);
let reqUnresolved = 0;
for (const j of catalog.jobs) {
  for (const r of j.requires ?? []) {
    if (!jobSlugs.has(r.slug)) {
      reqUnresolved++;
      console.log(`  FAIL req: "${j.name}" -> "${r.name}" (slug ${r.slug} introuvable)`);
    }
  }
}
check("req_unresolved", reqUnresolved, 0);

// 0 skill orphelin : chaque skill catalogue a son .md complet sur disque
let orphans = 0;
for (const s of catalog.skills) {
  const mdPath = path.join(CAPTURES_DIR, "skill_files_full", `${s.slug}.md`);
  if (!fs.existsSync(mdPath)) {
    orphans++;
    console.log(`  FAIL orphan: skill "${s.slug}" sans markdown (${mdPath})`);
  }
}
// et chaque référence files[] d'un job pointe vers un skill du catalogue (78)
const skillSlugs = new Set(catalog.skills.map((s) => s.slug));
for (const j of catalog.jobs) {
  for (const f of j.files ?? []) {
    if (!skillSlugs.has(f.slug)) {
      orphans++;
      console.log(`  FAIL orphan: job "${j.name}" référence skill "${f.slug}" absent du catalogue`);
    }
  }
}
check("orphans", orphans, 0);

// cohérence des résumés CHART ("N of M jobs run autonomously") par secteur, recalculée
// depuis les jobs eux-mêmes plutôt que copiée du texte source (anti-invention).
const manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) : null;
if (manifest?.counts) {
  check("manifest.sectors", catalog.sectors.length, manifest.counts.sectors);
  check("manifest.jobs_map", jobsMap.length, manifest.counts.jobs_map);
  check("manifest.jobs_chart", jobsChart.length, manifest.counts.jobs_chart);
  check("manifest.skill_files", catalog.skills.length, manifest.counts.skill_files);
  check("manifest.dashboards", catalog.dashboards.length, manifest.counts.dashboards);
}

if (failures.length > 0) {
  console.error(`\n[assert-graph] ÉCHEC — ${failures.length} invariant(s) violé(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `\n[assert-graph] PASS sectors=${catalog.sectors.length} functions=${functionSlugs.size} ` +
    `jobs=${jobsMap.length} skills=${catalog.skills.length} chart_total=${jobsChart.length} ` +
    `chart_human=${humanLed.length} req_unresolved=${reqUnresolved} orphans=${orphans}`
);
