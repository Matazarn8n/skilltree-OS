"use client";
import { useMemo, useState } from "react";
import { computeLayout } from "@/lib/map-layout";
import { skillBySlug } from "@/lib/data";
import type { Skill } from "@/lib/types";
import { SkillPanel } from "@/components/skill/SkillPanel";

// Hero : constellation SVG. Nœuds = éléments DOM focusables (a11y clavier + aria).
// Sélection contrôlée par ?skill=slug pour deep-link (⌘K, partage).
export function SkillMap({ initialSkill }: { initialSkill?: string }) {
  const L = useMemo(() => computeLayout(1200, 900), []);
  const [selected, setSelected] = useState<Skill | null>(
    initialSkill ? skillBySlug(initialSkill) ?? null : null
  );

  return (
    <div className="map-bg relative h-full w-full">
      <svg
        viewBox={`0 0 ${L.width} ${L.height}`}
        className="h-full w-full"
        role="tree"
        aria-label="Carte des skills — 7 secteurs"
      >
        {/* arêtes */}
        <g stroke-opacity="0.35">
          {L.edges.map((e, i) => (
            <line key={i} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
              stroke={e.colorVar} strokeWidth={1} strokeOpacity={0.35} />
          ))}
        </g>

        {/* hubs de secteur */}
        {L.hubs.map((h) => (
          <g key={h.slug}>
            <circle cx={h.x} cy={h.y} r={16} fill={h.colorVar} fillOpacity={0.15} stroke={h.colorVar} strokeWidth={1.5} />
            <circle cx={h.x} cy={h.y} r={5} fill={h.colorVar} />
            <text x={h.x} y={h.y - 30} textAnchor="middle"
              className="display fill-[var(--text)] text-[13px]" style={{ letterSpacing: "0.14em" }}>
              {h.name.toUpperCase()}
            </text>
            <text x={h.x} y={h.y - 15} textAnchor="middle" className="fill-[var(--text-faint)] text-[8px]">
              {h.tagline}
            </text>
          </g>
        ))}

        {/* nœuds skills */}
        {L.nodes.map((n) => {
          const active = selected?.slug === n.skill.slug;
          return (
            <g
              key={n.skill.slug}
              role="treeitem"
              aria-label={n.skill.name}
              aria-selected={active}
              tabIndex={0}
              className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-[var(--ring)]"
              onClick={() => setSelected(n.skill)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(n.skill); } }}
            >
              <circle cx={n.x} cy={n.y} r={active ? 11 : 8}
                fill="var(--node)" stroke={active ? "var(--ring)" : "var(--bg)"} strokeWidth={2}
                className="transition-all hover:r-[11px]" />
              <text x={n.x} y={n.y + 22} textAnchor="middle" className="pointer-events-none fill-[var(--text-muted)] text-[9px]">
                {n.skill.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-[var(--text-faint)]">
        Clique un nœud pour ouvrir le skill · flèches + Entrée au clavier
      </div>

      <SkillPanel skill={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
