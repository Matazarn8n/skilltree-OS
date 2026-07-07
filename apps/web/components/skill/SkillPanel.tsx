"use client";
import { useEffect } from "react";
import type { Skill } from "@/lib/types";
import { sectorOf } from "@/lib/data";
import { AutonomyBadge } from "./AutonomyBadge";
import { Button } from "@/components/ui/Button";

// Panneau latéral (Sheet) du détail skill. Focus-trap léger + Échap. État vide géré par le parent.
export function SkillPanel({ skill, onClose }: { skill: Skill | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!skill) return null;
  const sector = sectorOf(skill.sector);

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal aria-label={skill.name}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[var(--border)] bg-[var(--bg-panel)] p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest" style={{ color: sector.colorVar }}>{sector.name}</span>
          <button onClick={onClose} aria-label="Fermer" className="text-[var(--text-faint)] hover:text-[var(--text)]">✕</button>
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--text)]">{skill.name}</h2>
        <div className="mt-2"><AutonomyBadge on={skill.autonomy} /></div>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">{skill.summary}</p>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-[var(--border-soft)] p-3">
            <dt className="text-[var(--text-faint)]">Étape</dt>
            <dd className="mt-0.5 capitalize text-[var(--text)]">{stageFr(skill.stage)}</dd>
          </div>
          <div className="rounded-lg border border-[var(--border-soft)] p-3">
            <dt className="text-[var(--text-faint)]">Installations</dt>
            <dd className="mt-0.5 text-[var(--text)]">{skill.installCount}</dd>
          </div>
        </dl>

        {skill.requires?.length ? (
          <p className="mt-4 text-xs text-[var(--text-faint)]">
            Prérequis : {skill.requires.join(", ")}
          </p>
        ) : null}

        <div className="mt-auto pt-6">
          <Button className="w-full">Installer le skill →</Button>
        </div>
      </aside>
    </div>
  );
}

function stageFr(s: string) {
  return ({ foundation: "Fondation", capture: "Capture", generate: "Génération", orchestrate: "Orchestration" } as Record<string, string>)[s] ?? s;
}
export { stageFr };
