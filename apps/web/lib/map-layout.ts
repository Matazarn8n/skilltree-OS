import { SECTORS, SKILLS } from "./catalog";
import type { Skill } from "./types";

export interface NodePos { skill: Skill; x: number; y: number; }
export interface HubPos { slug: string; name: string; tagline: string; colorVar: string; x: number; y: number; angle: number; }
export interface Edge { from: { x: number; y: number }; to: { x: number; y: number }; colorVar: string; }

// Layout radial déterministe : 7 hubs sur un cercle, skills en éventail autour de leur hub,
// arêtes = prérequis (sinon rattachées au hub). Pas de simulation -> stable entre sessions.
// ponytail: placement analytique tant que <300 nœuds ; passer à d3-force pré-calculé au-delà.
export function computeLayout(width = 1200, height = 900) {
  const cx = width / 2, cy = height / 2;
  const hubR = Math.min(width, height) * 0.30;
  const hubs: HubPos[] = SECTORS.map((s, i) => {
    const angle = (i / SECTORS.length) * Math.PI * 2 - Math.PI / 2;
    return { slug: s.slug, name: s.name, tagline: s.tagline, colorVar: s.colorVar,
      x: cx + Math.cos(angle) * hubR, y: cy + Math.sin(angle) * hubR, angle };
  });

  const nodes: NodePos[] = [];
  const posBySlug = new Map<string, NodePos>();
  for (const hub of hubs) {
    const skills = SKILLS.filter((s) => s.sector === hub.slug);
    const spread = Math.PI * 0.7;               // éventail
    const base = hub.angle;                       // vers l'extérieur
    skills.forEach((skill, idx) => {
      const t = skills.length === 1 ? 0.5 : idx / (skills.length - 1);
      const a = base - spread / 2 + t * spread;
      // rayon échelonné par étape (1 Foundation, proche du hub -> 4 Orchestrate, loin)
      const STAGE_R: Record<number, number> = { 1: 70, 2: 120, 3: 165, 4: 205 };
      const stageR = (skill.stage && STAGE_R[skill.stage]) || 140; // 140 = repli si pas de stage
      const jitter = ((idx * 37) % 23) - 11;      // déterministe
      const r = stageR + jitter;
      const n: NodePos = { skill, x: hub.x + Math.cos(a) * r, y: hub.y + Math.sin(a) * r };
      nodes.push(n); posBySlug.set(skill.slug, n);
    });
  }

  const edges: Edge[] = [];
  for (const n of nodes) {
    const hub = hubs.find((h) => h.slug === n.skill.sector)!;
    const reqs = n.skill.requires ?? [];
    if (reqs.length === 0) {
      edges.push({ from: { x: hub.x, y: hub.y }, to: { x: n.x, y: n.y }, colorVar: hub.colorVar });
    } else {
      for (const r of reqs) {
        const p = posBySlug.get(r.slug);
        if (p) edges.push({ from: { x: p.x, y: p.y }, to: { x: n.x, y: n.y }, colorVar: hub.colorVar });
      }
    }
  }
  return { width, height, cx, cy, hubs, nodes, edges };
}
