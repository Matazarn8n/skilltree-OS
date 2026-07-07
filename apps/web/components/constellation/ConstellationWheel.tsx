"use client";
import { useMemo } from "react";
import { SECTORS, SKILLS, sectorOf } from "@/lib/catalog";
import type { SectorSlug, Skill } from "@/lib/types";
import { computeWheelLayout, SIZE } from "@/lib/constellation/geometry";
import { cn } from "@/lib/utils";
import { HubCore } from "./HubCore";
import { JobNode } from "./JobNode";

// Vue « all departments » : 7 fans (W_STEP=360/7) autour du hub central. Architecture :
// un <svg> décor (arêtes, opacité faible) + un calque HTML absolu de VRAIS boutons
// positionnés en % depuis la même géométrie (mémoïsée — zéro recalcul par frame, pas de rAF).
export function ConstellationWheel({
  onFocusSector, onSelectJob, selectedSlug, lowFx,
}: {
  onFocusSector: (slug: SectorSlug) => void;
  onSelectJob: (job: Skill) => void;
  selectedSlug?: string;
  lowFx: boolean;
}) {
  const layout = useMemo(() => computeWheelLayout(SECTORS, SKILLS), []);
  const pct = (v: number) => `${(v / SIZE) * 100}%`;

  return (
    <div className="map-bg relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative"
        style={{ width: "min(100%, calc(100dvh - 8rem))", aspectRatio: "1 / 1" }}
      >
        {/* décor SVG : arêtes fines couleur secteur */}
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden className="absolute inset-0 h-full w-full">
          {layout.edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke={e.colorVar} strokeWidth={1.5} strokeOpacity={0.3}
            />
          ))}
        </svg>

        {/* calque HTML : hub + 7 secteurs + 137 boutons, ordre DOM secteur→fonction→job */}
        <div className="absolute inset-0">
          <HubCore particles={layout.particles} lowFx={lowFx} />

          {layout.sectors.map((s) => (
            <div key={s.sector.slug}>
              <button
                type="button"
                aria-label={`Secteur ${s.sector.name} — ouvrir la vue secteur`}
                onClick={() => onFocusSector(s.sector.slug)}
                className={cn(
                  "absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]",
                  !lowFx && "transition-transform duration-150 hover:scale-110"
                )}
                style={{
                  left: pct(s.x), top: pct(s.y),
                  borderColor: s.sector.colorVar,
                  backgroundColor: `color-mix(in srgb, ${s.sector.colorVar} 18%, transparent)`,
                }}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.sector.colorVar }} />
              </button>
              <div
                className="pointer-events-none absolute w-44 -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ left: pct(s.labelX), top: pct(s.labelY) }}
              >
                <p className="display text-[13px] uppercase text-[var(--text)]">{s.sector.name}</p>
                <p className="mt-0.5 text-[8px] lowercase tracking-wider text-[var(--text-faint)]">{s.sector.tagline}</p>
              </div>
            </div>
          ))}

          {layout.nodes.map((n) => (
            <JobNode
              key={n.job.slug}
              job={n.job}
              sectorName={sectorOf(n.job.sector).name}
              color={sectorOf(n.job.sector).colorVar}
              x={n.x}
              y={n.y}
              showLabel={false /* densité 137 : le label visuel attend la vue secteur, l'aria-label porte le nom */}
              active={selectedSlug === n.job.slug}
              lowFx={lowFx}
              onSelect={onSelectJob}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
