"use client";
import { useState } from "react";
import { SECTORS } from "@/lib/catalog";
import type { SectorSlug } from "@/lib/types";
import { LEVELS, chartTotals, groupByStageLevel, sectorSummary, summaryLabel } from "@/lib/chart";
import { cn } from "@/lib/utils";
import { JobCard } from "@/components/chart/JobCard";

// Vue CHART (CHART-01/02) : matrice 7 secteurs (tabs) × 4 étapes × 3 niveaux, fidèle à
// captures/chart/{sector}__matrix.png. Le résumé « N of M » est RECALCULÉ (jamais copié) via
// lib/chart.ts::sectorSummary — les extras origin='chart' (28 human-led) sont inclus, la roue
// MAP (137) n'est jamais touchée par ce composant.
export function RolloutMatrix() {
  const [active, setActive] = useState<SectorSlug>(SECTORS[0].slug);
  const sector = SECTORS.find((s) => s.slug === active)!;
  const summary = sectorSummary(active);
  const { stages, byStage, ongoing } = groupByStageLevel(active);
  const totals = chartTotals(); // contrôle 165/36 — jamais affiché en dur, recalculé au build/render

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto p-6">
      {/* tabs secteurs */}
      <div role="tablist" aria-label="Secteurs" className="flex gap-1 border-b border-[var(--border)] pb-3">
        {SECTORS.map((s) => (
          <button
            key={s.slug}
            type="button"
            role="tab"
            aria-selected={s.slug === active}
            onClick={() => setActive(s.slug)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              s.slug === active
                ? "font-semibold text-[var(--text)] underline decoration-2 underline-offset-8"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
            style={s.slug === active ? { textDecorationColor: s.colorVar } : undefined}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* titre + résumé recalculé + légende */}
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="display text-2xl text-[var(--text)]">
            {sector.name} <span className="text-[var(--text-muted)]">· le déploiement IA</span>
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{summaryLabel(summary)}</p>
        </div>
        <div className="flex gap-4 text-xs text-[var(--text-muted)]">
          {LEVELS.map((l) => (
            <span key={l.level} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className={cn(
                  "h-2.5 w-2.5 rounded-full border border-[var(--border-soft)]",
                  l.level === "autonomous" && "bg-[var(--text)]",
                  l.level === "assisted" && "bg-[var(--text-muted)]",
                  l.level === "human-led" && "bg-transparent"
                )}
              />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* en-tête colonnes = 4 étapes */}
      <div className="mt-6 grid gap-3" style={{ gridTemplateColumns: `12rem repeat(${stages.length}, 1fr)` }}>
        <div className="text-xs uppercase tracking-wider text-[var(--text-faint)]">
          Ordre de déploiement
          <br />
          premier → dernier
        </div>
        {stages.map((s) => (
          <div key={s.stage} className="rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--text)] text-xs text-[var(--bg)]">
                {s.stage}
              </span>
              {s.name}
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{s.sub}</p>
          </div>
        ))}

        {/* lignes = 3 niveaux */}
        {LEVELS.map((lvl) => {
          const count =
            lvl.level === "human-led"
              ? ongoing.length
              : stages.reduce((n, s) => n + (byStage.get(lvl.level)?.get(s.stage)?.length ?? 0), 0);
          return (
            <div key={lvl.level} className="contents">
              <div className="rounded-lg border border-[var(--border)] p-3">
                <p className="text-sm font-semibold text-[var(--text)]">{lvl.label}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{lvl.desc}</p>
                <p className="mt-3 text-xs text-[var(--text-faint)]">
                  <span className="font-semibold text-[var(--text)]">{count}</span> job{count > 1 ? "s" : ""}
                </p>
              </div>
              {stages.map((s, i) => {
                const jobs =
                  lvl.level === "human-led"
                    ? ongoing.filter((_, idx) => idx % stages.length === i)
                    : byStage.get(lvl.level)?.get(s.stage) ?? [];
                return (
                  <div key={s.stage} className="flex flex-col gap-2">
                    {jobs.length === 0 && <span className="pt-3 text-center text-[var(--text-faint)]">—</span>}
                    {jobs.map((job) => (
                      <JobCard
                        key={job.slug}
                        job={job}
                        stageDots={lvl.level === "human-led" ? undefined : { stage: s.stage, total: stages.length }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* contrôle discret — confirme visuellement que les totaux tombent du calcul */}
      <p className="mt-8 text-xs text-[var(--text-faint)]">
        Tous secteurs confondus : {totals.total} jobs référencés dans la vue CHART · {totals.humanLed} pilotés par un
        humain (recalculé depuis la donnée).
      </p>
    </div>
  );
}
