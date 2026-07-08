"use client";
import { useState } from "react";
import { DASHBOARDS } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { StatTile } from "@/components/dashboards/StatTile";

const PERIODS = ["7d", "14d", "30d", "90d"] as const;

function humanizeKey(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCell(value: unknown): string {
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (value === null || value === undefined) return "—";
  return String(value);
}

// Une table du command center : soit une liste {label,value} (barres simples type "by_stage"),
// soit une liste d'objets plus riches (campagnes, factures…) rendue en table générique. Aucune
// colonne/valeur n'est inventée — les clés viennent de la donnée (data/dashboards.json).
function DashTable({ name, rows }: { name: string; rows: unknown }) {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const first = rows[0] as Record<string, unknown>;
  const keys = Object.keys(first);
  const isSimple = keys.length === 2 && keys.includes("label") && keys.includes("value");

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">{humanizeKey(name)}</h3>
      {isSimple ? (
        <ul className="flex flex-col gap-2">
          {(rows as { label: string; value: unknown }[]).map((r) => (
            <li key={r.label} className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-muted)]">{r.label}</span>
              <span className="font-medium text-[var(--text)]">{formatCell(r.value)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-soft)] text-[var(--text-faint)]">
                {keys.map((k) => (
                  <th key={k} className="whitespace-nowrap py-1.5 pr-4 font-medium">
                    {humanizeKey(k)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(rows as Record<string, unknown>[]).map((row, i) => (
                <tr key={i} className="border-b border-[var(--border-soft)] last:border-0">
                  {keys.map((k) => (
                    <td key={k} className="whitespace-nowrap py-1.5 pr-4 text-[var(--text-muted)]">
                      {formatCell(row[k])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Vue DASHBOARDS (DASH-01) : les 6 command centers de data/dashboards.json (seed 20260611,
// démo déterministe D3) — fidèle à captures/dashboards/*_full.png. Toutes les stats/tables sont
// lues telles quelles depuis DASHBOARDS, jamais réinventées.
export function CommandCenters() {
  const [index, setIndex] = useState(0);
  const center = DASHBOARDS[index];
  const prev = DASHBOARDS[(index - 1 + DASHBOARDS.length) % DASHBOARDS.length];
  const next = DASHBOARDS[(index + 1) % DASHBOARDS.length];

  return (
    <div className="relative flex h-full w-full overflow-y-auto">
      <button
        type="button"
        aria-label={`Dashboard précédent : ${prev.short}`}
        onClick={() => setIndex((i) => (i - 1 + DASHBOARDS.length) % DASHBOARDS.length)}
        className="fixed left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elev)] text-[var(--text-muted)] outline-none hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label={`Dashboard suivant : ${next.short}`}
        onClick={() => setIndex((i) => (i + 1) % DASHBOARDS.length)}
        className="fixed right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elev)] text-[var(--text-muted)] outline-none hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        ›
      </button>

      <div className="mx-auto w-full max-w-5xl px-14 py-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-faint)]">← Tous les dashboards</p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: center.color }} />
            <div>
              <h2 className="display text-2xl text-[var(--text)]">{center.name}</h2>
              <p className="text-sm text-[var(--text-muted)]">{center.sub}</p>
            </div>
          </div>
          <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-1">
            {PERIODS.map((p, i) => (
              <span
                key={p}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs",
                  // range_days pilote la pill active (7/14/30/90) — donnée, pas fabriquée
                  center.range_days === [7, 14, 30, 90][i]
                    ? "bg-[var(--bg-panel)] text-[var(--text)]"
                    : "text-[var(--text-faint)]"
                )}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-2 text-[11px] text-[var(--text-faint)]">
          Démo déterministe · données seed 20260611 (docs/ARCHITECTURE.md D3)
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {center.stats.map((s) => (
            <StatTile key={s.label} stat={s} />
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {Object.entries(center.tables).map(([name, rows]) => (
            <DashTable key={name} name={name} rows={rows} />
          ))}
        </div>

        <nav aria-label="Navigation dashboards" className="mt-8 flex justify-between text-xs text-[var(--text-muted)]">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + DASHBOARDS.length) % DASHBOARDS.length)}
            className="outline-none hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            ← {prev.short}
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % DASHBOARDS.length)}
            className="outline-none hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {next.short} →
          </button>
        </nav>
      </div>
    </div>
  );
}
