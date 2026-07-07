"use client";
import { useState } from "react";
import { SKILLS, SECTORS, sectorOf } from "@/lib/data";
import type { Skill, SkillStage } from "@/lib/types";
import { AutonomyBadge } from "@/components/skill/AutonomyBadge";
import { SkillPanel } from "@/components/skill/SkillPanel";
import { cn } from "@/lib/utils";

const STAGES: { key: SkillStage; label: string }[] = [
  { key: "foundation", label: "Fondation" },
  { key: "capture", label: "Capture" },
  { key: "generate", label: "Génération" },
  { key: "orchestrate", label: "Orchestration" },
];

// Vue alternative de la carte : grille des skills par étape (comme la vue "Sales" du produit).
// Filtrable par secteur. Partage le SkillPanel avec la constellation.
export function StageGrid() {
  const [sector, setSector] = useState<string>("all");
  const [selected, setSelected] = useState<Skill | null>(null);
  const skills = sector === "all" ? SKILLS : SKILLS.filter((s) => s.sector === sector);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrer par secteur">
        <FilterChip active={sector === "all"} onClick={() => setSector("all")}>Tous</FilterChip>
        {SECTORS.map((s) => (
          <FilterChip key={s.slug} active={sector === s.slug} onClick={() => setSector(s.slug)} color={s.colorVar}>
            {s.name}
          </FilterChip>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => {
          const col = skills.filter((s) => s.stage === stage.key);
          return (
            <section key={stage.key} aria-label={stage.label} className="flex flex-col gap-3">
              <h3 className="text-xs uppercase tracking-widest text-[var(--text-faint)]">{stage.label}</h3>
              {col.length === 0 && (
                <p className="rounded-lg border border-dashed border-[var(--border-soft)] p-4 text-center text-xs text-[var(--text-faint)]">
                  Aucun skill à cette étape.
                </p>
              )}
              {col.map((s) => {
                const sec = sectorOf(s.sector);
                return (
                  <button
                    key={s.slug}
                    onClick={() => setSelected(s)}
                    aria-label={`Ouvrir ${s.name}`}
                    className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-3 text-left transition-colors hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: sec.colorVar }} aria-hidden />
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-faint)]">{sec.name}</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--text)]">{s.name}</span>
                    <span className="line-clamp-2 text-xs text-[var(--text-muted)]">{s.summary}</span>
                    <AutonomyBadge on={s.autonomy} />
                  </button>
                );
              })}
            </section>
          );
        })}
      </div>
      <SkillPanel skill={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FilterChip({ active, onClick, color, children }: { active: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text)]" : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        {color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} aria-hidden />}
        {children}
      </span>
    </button>
  );
}
