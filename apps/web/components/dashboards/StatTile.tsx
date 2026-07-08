import { cn } from "@/lib/utils";
import type { CommandCenterStat } from "@/lib/catalog/types";

// Stat tile (DASH-01) : icône + label, valeur XL, delta coloré (↗ vert si positif, ↘ rouge si
// négatif) + phrase d'état. Toutes les valeurs viennent de `stat` (CommandCenter.stats[],
// data/dashboards.json, seed 20260611) — rien n'est fabriqué ici.
export function StatTile({ stat }: { stat: CommandCenterStat }) {
  const delta = stat.delta;
  const negative = delta?.trim().startsWith("-");
  const arrow = delta ? (negative ? "↘" : "↗") : null;

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-4">
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{stat.label}</span>
        {delta && (
          <span className={cn("font-medium", negative ? "text-[#fb7185]" : "text-[#5eead4]")}>
            {arrow} {delta}
          </span>
        )}
      </div>
      <p className="display text-2xl text-[var(--text)]">{stat.value}</p>
      {delta && (
        <p className="text-xs text-[var(--text-faint)]">{negative ? "En baisse" : "En hausse"} {arrow}</p>
      )}
    </div>
  );
}
