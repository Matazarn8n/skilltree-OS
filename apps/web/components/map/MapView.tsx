"use client";
import { useState } from "react";
import { skillBySlug } from "@/lib/catalog";
import type { SectorSlug, Skill } from "@/lib/types";
import { useLowFx } from "@/lib/constellation/useLowFx";
import { ConstellationWheel } from "@/components/constellation/ConstellationWheel";
import { SectorView } from "@/components/constellation/SectorView";
import { SkillPanel } from "@/components/skill/SkillPanel";
import { EmptyState } from "@/components/ui/EmptyState";

export type MapViewKind = "map" | "dashboards" | "chart";

// Point d'entrée client de /map. La vue (MAP/DASHBOARDS/CHART) vient de l'URL ?view=
// (D6, shareable) — jamais d'un state local. Le deep-link ?skill= (⌘K) reste supporté.
export function MapView({ view = "map", initialSkill }: { view?: MapViewKind; initialSkill?: string }) {
  const [focusedSector, setFocusedSector] = useState<SectorSlug | null>(null);
  const [selected, setSelected] = useState<Skill | null>(
    initialSkill ? skillBySlug(initialSkill) ?? null : null
  );
  const { lowFx } = useLowFx();

  if (view === "dashboards") {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-full max-w-md">
          <EmptyState title="Dashboards — bientôt" hint="Les command centers arrivent à la Phase 3." />
        </div>
      </div>
    );
  }
  if (view === "chart") {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-full max-w-md">
          <EmptyState title="Chart — bientôt" hint="La matrice de déploiement par étapes arrive à la Phase 3." />
        </div>
      </div>
    );
  }

  return (
    <div data-lowfx={lowFx ? "true" : "false"} className="relative h-full w-full">
      {focusedSector ? (
        <SectorView
          slug={focusedSector}
          onBack={() => setFocusedSector(null)}
          onFocusSector={setFocusedSector}
          onSelectJob={setSelected}
          selectedSlug={selected?.slug}
          lowFx={lowFx}
        />
      ) : (
        <ConstellationWheel
          onFocusSector={setFocusedSector}
          onSelectJob={setSelected}
          selectedSlug={selected?.slug}
          lowFx={lowFx}
        />
      )}
      {/* Panel provisoire — remplacé par le vrai JobPanel au plan 02-02. */}
      <SkillPanel skill={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
