import type { Sector, SectorSlug, Skill } from "../catalog/types";

// ── Géométrie pure de la roue-constellation (MAP-01) ────────────────────────
// Module SANS React, SANS DOM : trigonométrie déterministe uniquement (aucune lib
// de graphe, aucun Math.random nu — PRNG seedé pour les particules du hub).
// Source unique : testé côté Node par tools/test-geometry.mjs (--experimental-strip-types)
// et consommé côté Next par components/constellation/* — les données (SECTORS/SKILLS)
// sont passées en paramètres pour que les deux mondes importent CE fichier tel quel.

export const W_STEP = 360 / 7; // ≈51.4286° par fan
export const SIZE = 2000;      // viewBox logique carré
export const C = 1000;         // centre
export const R_HUB = 120;          // amas de particules central
export const R_SECTOR = 310;       // nœud hub de secteur
export const R_BRANCH_START = 430; // premier job d'une branche
export const R_MAX = 920;          // dernier job d'une branche

// Éventail intra-secteur : marge inter-fans pour que deux secteurs ne se touchent pas.
export const SPREAD = W_STEP * 0.82;

// Vue zoom secteur (cf. captures/map_zoom/*.png : nœud secteur bas-centre, éventail au-dessus).
export const ARC = 150;                // ouverture angulaire du demi-éventail (degrés)
export const SECTOR_ORIGIN_Y = 1560;   // y du nœud secteur (x = C)
export const R_SECTOR_BRANCH_START = 380;
// Le plan indiquait 1250, mais 1250·cos(-150°) sort du viewBox (x<0) pour les branches
// extrêmes — 1000 garde tous les nœuds ET labels dans [40, 1960]. (Déviation documentée.)
export const R_SECTOR_MAX = 1000;

const TANGENT_OFFSET = 14;   // désengorgement alterné des labels le long d'une branche
const FN_LABEL_OFFSET = 45;  // label de fonction au-delà du dernier nœud
const PARTICLE_COUNT = 90;
export const PARTICLE_SEED = 20260611;
export const LOWFX_PARTICLE_COUNT = 24;

export interface Pt { x: number; y: number; }
export interface NodePos { job: Skill; x: number; y: number; branchIndex: number; }
export interface SectorPos {
  sector: Sector; x: number; y: number; angleDeg: number;
  labelX: number; labelY: number;
}
export interface BranchPos {
  sector: SectorSlug; fn: string; colorVar: string; jobCount: number;
  angleDeg: number; labelX: number; labelY: number;
}
export interface Edge { x1: number; y1: number; x2: number; y2: number; colorVar: string; }
export interface Particle { x: number; y: number; r: number; opacity: number; }

export interface WheelLayout {
  size: number;
  hub: { x: number; y: number; r: number };
  sectors: SectorPos[];
  branches: BranchPos[];
  nodes: NodePos[];
  edges: Edge[];
  particles: Particle[];
}

export interface SectorLayout {
  size: number;
  sector: Sector;
  origin: Pt;
  branches: BranchPos[];
  nodes: NodePos[];
  edges: Edge[];
  prev: SectorSlug;
  next: SectorSlug;
}

// PRNG déterministe (mulberry32) — AUCUN Math.random : rendu SSR ≡ rendu client.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const toRad = (deg: number) => (deg * Math.PI) / 180;
const polar = (cx: number, cy: number, angleDeg: number, r: number): Pt => ({
  x: cx + r * Math.cos(toRad(angleDeg)),
  y: cy + r * Math.sin(toRad(angleDeg)),
});

/** Jobs d'un secteur groupés par fonction, ordre d'apparition du catalogue (déterministe). */
function branchesOf(jobs: Skill[], slug: SectorSlug): { fn: string; jobs: Skill[] }[] {
  const order: string[] = [];
  const byFn = new Map<string, Skill[]>();
  for (const j of jobs) {
    if (j.sector !== slug || j.origin !== "map") continue;
    const fn = j.function ?? "—";
    if (!byFn.has(fn)) { byFn.set(fn, []); order.push(fn); }
    byFn.get(fn)!.push(j);
  }
  return order.map((fn) => ({ fn, jobs: byFn.get(fn)! }));
}

/** Rayon du job k parmi n sur une branche (échelonnement linéaire ; n==1 → mi-chemin). */
function radiusAt(k: number, n: number, rStart: number, rMax: number): number {
  if (n === 1) return (rStart + rMax) / 2;
  return rStart + (k * (rMax - rStart)) / Math.max(n - 1, 1);
}

/** Position d'un job : angle de branche + rayon + décalage tangentiel alterné ±14. */
function jobPoint(cx: number, cy: number, angleDeg: number, r: number, k: number): Pt {
  const base = polar(cx, cy, angleDeg, r);
  const tangent = toRad(angleDeg + 90);
  const s = k % 2 === 0 ? TANGENT_OFFSET : -TANGENT_OFFSET;
  return { x: base.x + s * Math.cos(tangent), y: base.y + s * Math.sin(tangent) };
}

function hubParticles(): Particle[] {
  const rand = mulberry32(PARTICLE_SEED);
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const u = rand();
    // u**0.7 : entre l'uniforme (sqrt) et u**1.4 — densité renforcée au centre.
    const radius = R_HUB * u ** 0.7;
    const theta = rand() * Math.PI * 2;
    particles.push({
      x: C + radius * Math.cos(theta),
      y: C + radius * Math.sin(theta),
      r: 0.8 + rand() * 1.8,
      opacity: 0.15 + rand() * 0.55,
    });
  }
  return particles;
}

/** Roue complète « all departments » : 7 fans W_STEP=360/7 autour du hub central. */
export function computeWheelLayout(sectorsIn: Sector[], jobs: Skill[]): WheelLayout {
  const sectors = [...sectorsIn].sort((a, b) => a.order - b.order);
  const sectorPos: SectorPos[] = [];
  const branches: BranchPos[] = [];
  const nodes: NodePos[] = [];
  const edges: Edge[] = [];

  for (const sector of sectors) {
    const alpha = -90 + sector.order * W_STEP;
    const p = polar(C, C, alpha, R_SECTOR);
    // Label radialement AU-DELÀ du fan (comme la capture 01_after_login.png) : à R_SECTOR+Δ
    // ou au-dessus du nœud, les 7 labels se chevauchent entre eux ou avec les nœuds.
    const lbl = polar(C, C, alpha, R_MAX + 45);
    const clamp = (v: number) => Math.min(1930, Math.max(70, v));
    sectorPos.push({ sector, x: p.x, y: p.y, angleDeg: alpha, labelX: clamp(lbl.x), labelY: clamp(lbl.y) });
    edges.push({ x1: C, y1: C, x2: p.x, y2: p.y, colorVar: sector.colorVar }); // centre→secteur

    const fns = branchesOf(jobs, sector.slug);
    fns.forEach(({ fn, jobs: branchJobs }, j) => {
      const beta = alpha - SPREAD / 2 + ((j + 0.5) * SPREAD) / fns.length;
      const branchIndex = branches.length;
      let prevPt: Pt = p; // nœud secteur → premier nœud
      let lastR = R_BRANCH_START;
      branchJobs.forEach((job, k) => {
        const r = radiusAt(k, branchJobs.length, R_BRANCH_START, R_MAX);
        lastR = r;
        const pt = jobPoint(C, C, beta, r, k);
        nodes.push({ job, x: pt.x, y: pt.y, branchIndex });
        edges.push({ x1: prevPt.x, y1: prevPt.y, x2: pt.x, y2: pt.y, colorVar: sector.colorVar });
        prevPt = pt;
      });
      const lbl = polar(C, C, beta, lastR + FN_LABEL_OFFSET);
      branches.push({
        sector: sector.slug, fn, colorVar: sector.colorVar, jobCount: branchJobs.length,
        angleDeg: beta, labelX: lbl.x, labelY: lbl.y,
      });
    });
  }

  return {
    size: SIZE,
    hub: { x: C, y: C, r: R_HUB },
    sectors: sectorPos,
    branches,
    nodes,
    edges,
    particles: hubParticles(),
  };
}

/** Vue zoom d'un secteur : nœud secteur bas-centre, fonctions en demi-éventail au-dessus. */
export function computeSectorLayout(
  sectorsIn: Sector[], jobs: Skill[], slug: SectorSlug
): SectorLayout {
  const sectors = [...sectorsIn].sort((a, b) => a.order - b.order);
  const sector = sectors.find((s) => s.slug === slug);
  if (!sector) throw new Error(`computeSectorLayout: secteur inconnu "${slug}"`);

  const origin: Pt = { x: C, y: SECTOR_ORIGIN_Y };
  const branches: BranchPos[] = [];
  const nodes: NodePos[] = [];
  const edges: Edge[] = [];

  const fns = branchesOf(jobs, slug);
  fns.forEach(({ fn, jobs: branchJobs }, j) => {
    const gamma = -90 - ARC / 2 + ((j + 0.5) * ARC) / fns.length;
    const branchIndex = branches.length;
    let prevPt: Pt = origin;
    let lastR = R_SECTOR_BRANCH_START;
    branchJobs.forEach((job, k) => {
      const r = radiusAt(k, branchJobs.length, R_SECTOR_BRANCH_START, R_SECTOR_MAX);
      lastR = r;
      const pt = jobPoint(origin.x, origin.y, gamma, r, k);
      nodes.push({ job, x: pt.x, y: pt.y, branchIndex });
      edges.push({ x1: prevPt.x, y1: prevPt.y, x2: pt.x, y2: pt.y, colorVar: sector.colorVar });
      prevPt = pt;
    });
    const lbl = polar(origin.x, origin.y, gamma, lastR + FN_LABEL_OFFSET);
    branches.push({
      sector: slug, fn, colorVar: sector.colorVar, jobCount: branchJobs.length,
      angleDeg: gamma, labelX: lbl.x, labelY: lbl.y,
    });
  });

  const idx = sectors.findIndex((s) => s.slug === slug);
  const prev = sectors[(idx + sectors.length - 1) % sectors.length].slug;
  const next = sectors[(idx + 1) % sectors.length].slug;

  return { size: SIZE, sector, origin, branches, nodes, edges, prev, next };
}
