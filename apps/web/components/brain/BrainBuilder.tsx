"use client";
import { BrainWizard } from "./BrainWizard";

// Orchestrateur de la page /brain : shell de mise en page uniquement. Toute la
// machine à états (intake → 8 sections → done) vit dans BrainWizard, la
// persistance dans lib/brain.ts (useBrain). Garder ce wrapper séparé permet à
// Phase 4 de brancher un autre provider de données sans toucher au wizard.
export function BrainBuilder() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <BrainWizard />
    </div>
  );
}
