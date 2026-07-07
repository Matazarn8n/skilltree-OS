#!/usr/bin/env node --experimental-strip-types
// Assertions déterministes sur la géométrie de la roue (style assert-graph.mjs).
// Source unique : importe la VRAIE lib apps/web/lib/constellation/geometry.ts
// (via strip-types, Node 22) + le catalogue JSON réel — aucune constante dupliquée.
// Usage : node --experimental-strip-types tools/test-geometry.mjs   (exit 1 si violation)

import catalog from "../apps/web/lib/catalog/catalog.json" with { type: "json" };
import {
  computeWheelLayout,
  computeSectorLayout,
  W_STEP,
} from "../apps/web/lib/constellation/geometry.ts";

let failures = 0;
const fail = (msg) => { failures++; console.error(`  FAIL ${msg}`); };
const ok = (msg) => console.log(`  OK   ${msg}`);

const SECTORS = catalog.sectors;
const SKILLS = catalog.jobs.filter((j) => j.origin === "map");

// ── Roue complète ────────────────────────────────────────────────────────────
const L = computeWheelLayout(SECTORS, SKILLS);

if (Math.abs(W_STEP - 360 / 7) > 1e-12) fail(`W_STEP=${W_STEP} ≠ 360/7`);
else ok(`W_STEP = 360/7 (${W_STEP.toFixed(4)}°)`);

if (L.nodes.length !== 137) fail(`nodes.length=${L.nodes.length} (attendu 137)`);
else ok("nodes.length = 137");
if (L.sectors.length !== 7) fail(`sectors.length=${L.sectors.length} (attendu 7)`);
else ok("sectors.length = 7");
if (L.branches.length !== 34) fail(`branches.length=${L.branches.length} (attendu 34)`);
else ok("branches.length = 34");

// Coordonnées finies et dans [40, 1960]
const allPts = [
  ...L.nodes.map((n) => [n.x, n.y, `node ${n.job.slug}`]),
  ...L.sectors.map((s) => [s.x, s.y, `sector ${s.sector.slug}`]),
];
let bounds = 0;
for (const [x, y, label] of allPts) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) { fail(`${label} coord non finie (${x},${y})`); bounds++; }
  else if (x < 40 || x > 1960 || y < 40 || y > 1960) { fail(`${label} hors [40,1960] (${x.toFixed(1)},${y.toFixed(1)})`); bounds++; }
}
if (bounds === 0) ok(`coords finies dans [40,1960] (${allPts.length} points)`);

// Distance minimale entre deux nœuds jobs ≥ 18
let minDist = Infinity;
let minPair = "";
for (let i = 0; i < L.nodes.length; i++) {
  for (let j = i + 1; j < L.nodes.length; j++) {
    const d = Math.hypot(L.nodes[i].x - L.nodes[j].x, L.nodes[i].y - L.nodes[j].y);
    if (d < minDist) { minDist = d; minPair = `${L.nodes[i].job.slug} ↔ ${L.nodes[j].job.slug}`; }
  }
}
if (minDist < 18) fail(`minDist=${minDist.toFixed(2)} < 18 (${minPair})`);
else ok(`minDist=${minDist.toFixed(2)} ≥ 18 (${minPair})`);

// Bijection layout ↔ catalogue (par slug)
const layoutSlugs = new Set(L.nodes.map((n) => n.job.slug));
const catalogSlugs = new Set(SKILLS.map((j) => j.slug));
const missing = [...catalogSlugs].filter((s) => !layoutSlugs.has(s));
const extra = [...layoutSlugs].filter((s) => !catalogSlugs.has(s));
if (missing.length) fail(`jobs du catalogue absents du layout: ${missing.slice(0, 5).join(", ")}`);
if (extra.length) fail(`jobs du layout absents du catalogue: ${extra.slice(0, 5).join(", ")}`);
if (!missing.length && !extra.length) ok("bijection layout ↔ catalogue (137 slugs)");

// ── Vue secteur, pour les 7 slugs ────────────────────────────────────────────
for (const s of SECTORS) {
  const SL = computeSectorLayout(SECTORS, SKILLS, s.slug);
  const expected = SKILLS.filter((j) => j.sector === s.slug);
  if (SL.nodes.length !== expected.length) {
    fail(`sectorLayout(${s.slug}) nodes=${SL.nodes.length} ≠ jobs secteur=${expected.length}`);
    continue;
  }
  const badCoord = SL.nodes.find((n) => !Number.isFinite(n.x) || !Number.isFinite(n.y));
  if (badCoord) { fail(`sectorLayout(${s.slug}) coord non finie: ${badCoord.job.slug}`); continue; }
  const slugsOk = SL.nodes.every((n) => n.job.sector === s.slug);
  if (!slugsOk) { fail(`sectorLayout(${s.slug}) contient un job d'un autre secteur`); continue; }
  ok(`sectorLayout(${s.slug}): ${SL.nodes.length} jobs, coords finies, prev=${SL.prev} next=${SL.next}`);
}

// ── Verdict ──────────────────────────────────────────────────────────────────
if (failures > 0) {
  console.error(`[test-geometry] ÉCHEC — ${failures} violation(s)`);
  process.exit(1);
}
console.log(`[test-geometry] PASS nodes=137 sectors=7 branches=34 minDist=${minDist.toFixed(2)}`);
