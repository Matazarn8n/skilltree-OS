"use client";
import { useState } from "react";
import { SkillMap } from "./SkillMap";
import { StageGrid } from "./StageGrid";
import { cn } from "@/lib/utils";

type View = "constellation" | "grid";

// Bascule entre la constellation (hero) et la grille par étape. État de vue = local (léger, pas d'URL).
export function MapView({ initialSkill }: { initialSkill?: string }) {
  const [view, setView] = useState<View>("constellation");
  return (
    <div className="relative flex h-full flex-col">
      <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-1 text-sm">
        {(["constellation", "grid"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={cn(
              "rounded-md px-3 py-1 transition-colors",
              view === v ? "bg-[var(--bg-panel)] text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            {v === "constellation" ? "Constellation" : "Grille"}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {view === "constellation" ? <SkillMap initialSkill={initialSkill} /> : <StageGrid />}
      </div>
    </div>
  );
}
