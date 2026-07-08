"use client";
import type { SkillFileContent } from "@/lib/skill-files";

export interface FreshDropsProps {
  /** Fiches FR déjà résolues côté serveur (getAllSkillFiles) — jamais la prose anglaise. */
  drops: SkillFileContent[];
}

function openInstall(slug: string) {
  window.dispatchEvent(new CustomEvent("skilltree:open-install", { detail: { slug } }));
}

// Grille des drops (hors featured) — sélection déterministe (lib/hub-data.ts#freshDrops).
// L'âge affiché est un placeholder de démo dérivé de l'ordre (étiqueté "démo"), jamais un
// compteur d'installs fabriqué (D3, docs/ARCHITECTURE.md).
export function FreshDrops({ drops }: FreshDropsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {drops.map((skill, i) => {
        const sector = skill.sector;
        const ageDays = (i + 1) * 2 + 1;
        return (
          <article
            key={skill.slug}
            className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-4"
          >
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span
                className="rounded-full border px-2 py-0.5 uppercase tracking-widest"
                style={{ color: sector?.colorVar ?? "var(--text-faint)", borderColor: (sector?.colorVar ?? "var(--border)") + "55" }}
              >
                {sector?.name ?? "SkillTree"}
              </span>
              <span className="text-[var(--text-faint)]">il y a {ageDays}j (démo)</span>
            </div>
            <h3 className="text-sm font-semibold leading-snug text-[var(--text)]">{skill.title}</h3>
            <p className="line-clamp-2 text-sm text-[var(--text-muted)]">{skill.what}</p>
            <div className="mt-auto pt-2">
              <button
                onClick={() => openInstall(skill.slug)}
                className="h-8 w-full rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:border-[var(--accent)]"
              >
                Installer
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
