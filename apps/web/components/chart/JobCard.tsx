import type { Skill } from "@/lib/types";

// Carte job de la matrice CHART (fidèle à captures/chart/{sector}__matrix.png) : icône
// générique + nom (contenu source, D9) + badge étape·points ou « En continu » pour les
// jobs human-led (la ligne Human-led n'affiche jamais de numéro d'étape, cf. lib/chart.ts).
export function JobCard({ job, stageDots }: { job: Skill; stageDots?: { stage: number; total: number } }) {
  const badge = stageDots
    ? `${stageDots.stage} · ${job.stageName}`
    : "En continu";

  return (
    <button
      type="button"
      className="flex w-full flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-3 text-left outline-none hover:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-soft)] text-xs text-[var(--text-muted)]"
      >
        {job.name.charAt(0)}
      </span>
      <span className="text-sm font-medium text-[var(--text)]">{job.name}</span>
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--border-soft)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        {badge}
        {stageDots && (
          <span aria-hidden className="tracking-[0.15em]">
            {"●".repeat(stageDots.stage)}
            {"○".repeat(Math.max(0, stageDots.total - stageDots.stage))}
          </span>
        )}
      </span>
    </button>
  );
}
