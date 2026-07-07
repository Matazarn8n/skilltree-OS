import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MapViewKind } from "@/components/map/MapView";

const VIEWS: { kind: MapViewKind; label: string; href: string }[] = [
  { kind: "map", label: "MAP", href: "/map" },
  { kind: "dashboards", label: "DASHBOARDS", href: "/map?view=dashboards" },
  { kind: "chart", label: "CHART", href: "/map?view=chart" },
];

// Switcher central MAP · DASHBOARDS · CHART (D6). Ce sont de VRAIS <Link> — la vue
// vit dans l'URL ?view= et chaque vue est shareable par URL directe (MAP-05),
// jamais un state local onClick.
export function ViewSwitcher({ view }: { view: MapViewKind }) {
  return (
    <nav
      aria-label="Vues de la carte"
      className="flex justify-center border-b border-[var(--border)] py-3"
    >
      <div className="flex rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-1">
        {VIEWS.map((v) => (
          <Link
            key={v.kind}
            href={v.href}
            aria-current={view === v.kind ? "page" : undefined}
            className={cn(
              "rounded-md px-4 py-1 text-xs tracking-[0.2em]",
              view === v.kind
                ? "bg-[var(--bg-panel)] text-[var(--text)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            {v.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
