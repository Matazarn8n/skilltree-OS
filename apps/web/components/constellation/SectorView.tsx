"use client";
import { useEffect, useMemo } from "react";
import { SECTORS, SKILLS, sectorOf } from "@/lib/catalog";
import type { SectorSlug, Skill } from "@/lib/types";
import { computeSectorLayout, SIZE } from "@/lib/constellation/geometry";
import { JobNode } from "./JobNode";

// Vue zoom d'un secteur (cf. captures/map_zoom/*.png) : nœud secteur bas-centre,
// branches-fonctions en demi-éventail, filigrane serif géant, chevrons prev/next.
export function SectorView({
  slug, onBack, onFocusSector, onSelectJob, selectedSlug, lowFx,
}: {
  slug: SectorSlug;
  onBack: () => void;
  onFocusSector: (slug: SectorSlug) => void;
  onSelectJob: (job: Skill) => void;
  selectedSlug?: string;
  lowFx: boolean;
}) {
  const layout = useMemo(() => computeSectorLayout(SECTORS, SKILLS, slug), [slug]);
  const pct = (v: number) => `${(v / SIZE) * 100}%`;

  // Échap contextuel : retour all-departments — mais seulement si aucun panel job n'est
  // ouvert (le JobPanel gère sa propre fermeture ; selectedSlug encore posé = panel ouvert).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !selectedSlug) onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedSlug, onBack]);
  const sector = layout.sector;
  const prevSector = sectorOf(layout.prev);
  const nextSector = sectorOf(layout.next);

  return (
    <div className="map-bg relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* chrome de la vue (hors carré) */}
      <button
        type="button"
        onClick={onBack}
        className="absolute left-6 top-4 z-10 text-xs uppercase tracking-widest text-[var(--text-muted)] outline-none hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        ← Tous les départements
      </button>
      <p className="absolute right-6 top-4 z-10 text-xs uppercase tracking-widest text-[var(--text-muted)]">
        <span className="text-[var(--text)]">0</span> sur {layout.nodes.length} en ligne · <span className="text-[var(--text)]">ton arbre</span>
      </p>

      {/* chevrons secteurs adjacents, libellés verticaux */}
      <button
        type="button"
        aria-label={`Secteur précédent : ${prevSector.name}`}
        onClick={() => onFocusSector(layout.prev)}
        className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-2 text-[var(--text-muted)] outline-none hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <span aria-hidden>‹</span>
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ writingMode: "vertical-rl" }}>
          {prevSector.name}
        </span>
      </button>
      <button
        type="button"
        aria-label={`Secteur suivant : ${nextSector.name}`}
        onClick={() => onFocusSector(layout.next)}
        className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-2 text-[var(--text-muted)] outline-none hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        <span aria-hidden>›</span>
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ writingMode: "vertical-rl" }}>
          {nextSector.name}
        </span>
      </button>

      <div
        className="relative"
        style={{ width: "min(100%, calc(100dvh - 8rem))", aspectRatio: "1 / 1" }}
      >
        {/* décor SVG : filigrane serif géant + arêtes */}
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden className="absolute inset-0 h-full w-full">
          <text
            x={1000} y={1080} textAnchor="middle"
            className="display fill-[var(--text)]"
            style={{ fontSize: 330, opacity: 0.05, letterSpacing: "0.08em" }}
          >
            {sector.name.toUpperCase()}
          </text>
          {layout.edges.map((e, i) => (
            <line
              key={i}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke={e.colorVar} strokeWidth={1.5} strokeOpacity={0.3}
            />
          ))}
        </svg>

        <div className="absolute inset-0">
          {/* nœud secteur bas-centre */}
          <div
            className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: pct(layout.origin.x), top: pct(layout.origin.y) }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full border-2"
              style={{
                borderColor: sector.colorVar,
                backgroundColor: `color-mix(in srgb, ${sector.colorVar} 18%, transparent)`,
              }}
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: sector.colorVar }} />
            </span>
            <p className="display mt-2 text-[15px] uppercase text-[var(--text)]">{sector.name}</p>
            <p className="mt-0.5 text-[9px] lowercase tracking-wider text-[var(--text-muted)]">{sector.tagline}</p>
          </div>

          {/* labels de fonction au bout des branches */}
          {layout.branches.map((b) => (
            <div
              key={b.fn}
              className="pointer-events-none absolute w-40 -translate-x-1/2 -translate-y-1/2 text-center"
              style={{ left: pct(b.labelX), top: pct(b.labelY) }}
            >
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">{b.fn}</p>
              <p className="mt-0.5 text-[8px] uppercase tracking-widest text-[var(--text-faint)]">{b.jobCount} jobs</p>
            </div>
          ))}

          {/* jobs — labels toujours visibles ici */}
          {layout.nodes.map((n) => (
            <JobNode
              key={n.job.slug}
              job={n.job}
              sectorName={sector.name}
              color={sector.colorVar}
              x={n.x}
              y={n.y}
              showLabel
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
