"use client";
import { useEffect, useState } from "react";

// LOWFX (fondation MAP-04) : l'original crashait mobile Safari — sous 700px ou en
// prefers-reduced-motion on dégrade les effets (24 particules, pas de transitions).
// État initial false côté SSR puis sync en useEffect → aucun mismatch d'hydratation.
export function useLowFx(): { lowFx: boolean; reducedMotion: boolean } {
  const [small, setSmall] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mqSmall = window.matchMedia("(max-width: 699px)");
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncSmall = () => setSmall(mqSmall.matches);
    const syncReduced = () => setReducedMotion(mqReduced.matches);
    syncSmall();
    syncReduced();
    mqSmall.addEventListener("change", syncSmall);
    mqReduced.addEventListener("change", syncReduced);
    return () => {
      mqSmall.removeEventListener("change", syncSmall);
      mqReduced.removeEventListener("change", syncReduced);
    };
  }, []);

  return { lowFx: small || reducedMotion, reducedMotion };
}
