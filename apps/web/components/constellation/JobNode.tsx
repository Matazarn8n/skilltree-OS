"use client";
import type { Skill } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SIZE } from "@/lib/constellation/geometry";

// Nœud job = VRAI <button> HTML (a11y clavier/lecteur d'écran — un <g> SVG ne peut pas
// l'être) positionné en % depuis la géométrie (computeWheelLayout/computeSectorLayout),
// jamais de coordonnées en dur. Chip circulaire crème + point couleur secteur.
export function JobNode({
  job, sectorName, color, x, y, showLabel, active, lowFx, onSelect,
}: {
  job: Skill;
  sectorName: string;
  color: string;
  x: number;
  y: number;
  showLabel: boolean;
  active: boolean;
  lowFx: boolean;
  onSelect: (job: Skill) => void;
}) {
  return (
    <button
      type="button"
      data-node
      aria-label={`${job.name} — ${sectorName}`}
      onClick={() => onSelect(job)}
      className={cn(
        "group absolute -translate-x-1/2 -translate-y-1/2 outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]",
        "rounded-full"
      )}
      style={{ left: `${(x / SIZE) * 100}%`, top: `${(y / SIZE) * 100}%` }}
    >
      <span
        className={cn(
          "flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--node)]",
          !lowFx && "transition-transform duration-150 group-hover:scale-125",
          active && "ring-2 ring-[var(--ring)]"
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      </span>
      {showLabel && (
        <span className="pointer-events-none absolute left-1/2 top-full mt-1 w-28 -translate-x-1/2 text-center text-[9px] leading-tight text-[var(--text-muted)]">
          {job.name}
        </span>
      )}
    </button>
  );
}
