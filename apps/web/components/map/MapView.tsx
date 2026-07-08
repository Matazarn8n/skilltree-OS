"use client";
import { useState } from "react";
import { skillBySlug } from "@/lib/catalog";
import type { SectorSlug, Skill } from "@/lib/types";
import { useLowFx } from "@/lib/constellation/useLowFx";
import { ConstellationWheel } from "@/components/constellation/ConstellationWheel";
import { SectorView } from "@/components/constellation/SectorView";
import { JobPanel } from "@/components/constellation/JobPanel";
import { CommandCenters } from "@/components/dashboards/CommandCenters";
import { RolloutMatrix } from "@/components/chart/RolloutMatrix";

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
    return <CommandCenters />;
  }
  if (view === "chart") {
    return <RolloutMatrix />;
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
      <JobPanel
        job={selected}
        onClose={() => setSelected(null)}
        onNavigate={(slug) => setSelected(skillBySlug(slug) ?? selected)}
      />
    </div>
  );
}
