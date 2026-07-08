"use client";
import type { SkillFileContent } from "@/lib/skill-files";

export interface FeaturedThisWeekProps {
  /** Fiche FR déjà résolue côté serveur (getAllSkillFiles) — jamais la prose anglaise. */
  skill: SkillFileContent;
  nextDrop: SkillFileContent | null;
}

function openInstall(slug: string) {
  window.dispatchEvent(new CustomEvent("skilltree:open-install", { detail: { slug } }));
}

// Bandeau "NEXT DROP" + grande carte "★ FEATURED THIS WEEK" — pick déterministe
// (lib/hub-data.ts#featured), jamais de compteur d'installs inventé (D3).
export function FeaturedThisWeek({ skill, nextDrop }: FeaturedThisWeekProps) {
  const sector = skill.sector;

  return (
    <div className="flex flex-col gap-3">
      {nextDrop && (
        <div className="flex items-center justify-between rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] px-4 py-2 text-xs">
          <span className="flex items-center gap-2 text-[var(--text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
            <span className="font-medium text-[var(--text)]">Prochain drop</span> {nextDrop.title}
          </span>
          <span className="text-[var(--text-faint)]">arrive bientôt (démo)</span>
        </div>
      )}

      <article className="grid gap-5 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-5 sm:grid-cols-[1fr_1.4fr]">
        <div
          className="flex min-h-32 flex-col justify-end rounded-lg p-4 text-[11px] uppercase tracking-widest text-white/80"
          style={{ background: `linear-gradient(160deg, ${sector?.colorVar ?? "#333"}33, #0b0b0f)` }}
        >
          {sector?.name ?? "SkillTree"}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-[11px] uppercase tracking-widest text-[var(--accent)]">★ Featured cette semaine</p>
          <h3 className="display text-xl text-[var(--text)]">{skill.title}</h3>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">{skill.what}</p>
          <div className="mt-auto pt-2">
            <button
              onClick={() => openInstall(skill.slug)}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:opacity-90"
            >
              Installer le skill →
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
