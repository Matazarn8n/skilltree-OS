"use client";
import { useEffect } from "react";
import type { Skill } from "@/lib/types";
import { sectorOf } from "@/lib/catalog";
import { AutonomyBadge } from "./AutonomyBadge";
import { Button } from "@/components/ui/Button";

// Panneau latéral (Sheet) du détail job. Focus-trap léger + Échap. État vide géré par le parent.
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
        <div className="mt-2"><AutonomyBadge on={skill.level === "autonomous"} /></div>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">{skill.desc}</p>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-[var(--border-soft)] p-3">
            <dt className="text-[var(--text-faint)]">Étape</dt>
            <dd className="mt-0.5 text-[var(--text)]">{stageFr(skill.stageName)}</dd>
          </div>
          <div className="rounded-lg border border-[var(--border-soft)] p-3">
            <dt className="text-[var(--text-faint)]">Niveau</dt>
            <dd className="mt-0.5 capitalize text-[var(--text)]">{levelFr(skill.level)}</dd>
          </div>
        </dl>

        {skill.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skill.skills.map((s) => (
              <span key={s} className="rounded-full border border-[var(--border-soft)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                {s}
              </span>
            ))}
          </div>
        )}

        {skill.integrations.length > 0 && (
          <p className="mt-3 text-xs text-[var(--text-faint)]">
            Intégrations : {skill.integrations.join(", ")}
          </p>
        )}

        {skill.requires.length > 0 ? (
          <p className="mt-4 text-xs text-[var(--text-faint)]">
            Prérequis : {skill.requires.map((r) => r.name).join(", ")}
          </p>
        ) : null}

        {skill.ladder && (
          <div className="mt-4 rounded-lg border border-[var(--border-soft)] p-3 text-xs text-[var(--text-muted)]">
            <p className="text-[var(--text-faint)]">Une fois autonome</p>
            <p className="mt-1">{skill.ladder.autonomous}</p>
          </div>
        )}

        <div className="mt-auto pt-6">
          <Button className="w-full" disabled={skill.files.length === 0}>
            {skill.files.length > 0 ? "Installer le skill →" : "Fiche à venir"}
          </Button>
        </div>
      </aside>
    </div>
  );
}

function stageFr(stageName: string | null) {
  return ({ Foundation: "Fondation", Capture: "Capture", Generate: "Génération", Orchestrate: "Orchestration" } as Record<string, string>)[stageName ?? ""] ?? (stageName ?? "—");
}

function levelFr(level: Skill["level"]) {
  return ({ autonomous: "Autonome", assisted: "Assisté", "human-led": "Humain" } as Record<string, string>)[level] ?? level;
}

export { stageFr };
