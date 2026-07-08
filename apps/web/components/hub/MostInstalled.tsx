"use client";
import { useInstalls } from "@/lib/installs";
import { EmptyState } from "@/components/ui/EmptyState";
import type { SkillFileContent } from "@/lib/skill-files";

export interface MostInstalledProps {
  /** Les 78 fiches résolues côté serveur (mêmes props que CommandBar) — sert uniquement
   *  à afficher un titre lisible pour chaque slug installé localement. */
  skillFiles: Record<string, SkillFileContent>;
}

// "Les plus installés" — PAS un classement communautaire (aucune donnée multi-utilisateur
// n'existe côté perso, D3 : on ne fabrique aucun compteur). Affiche les skills que CET
// utilisateur a réellement installés localement (lib/installs.ts), les plus récents en tête.
export function MostInstalled({ skillFiles }: MostInstalledProps) {
  const { installed } = useInstalls();

  if (installed.length === 0) {
    return (
      <EmptyState
        title="Pas encore de skill installé"
        hint="Installe un skill (⌘K ou depuis Fresh drops) pour le voir apparaître ici."
      />
    );
  }

  const items = [...installed].reverse().slice(0, 5);

  return (
    <ol className="flex flex-col divide-y divide-[var(--border-soft)] rounded-xl border border-[var(--border)] bg-[var(--bg-panel)]">
      {items.map((slug, i) => (
        <li key={slug} className="flex items-center gap-3 px-4 py-3 text-sm">
          <span className="w-4 shrink-0 text-[var(--text-faint)]">{i + 1}</span>
          <span className="flex-1 text-[var(--text)]">{skillFiles[slug]?.title ?? slug}</span>
          <span className="shrink-0 text-xs text-[var(--accent)]">Installé</span>
        </li>
      ))}
    </ol>
  );
}
