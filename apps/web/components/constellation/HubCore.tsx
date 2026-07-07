"use client";
import type { Particle } from "@/lib/constellation/geometry";
import { C, R_HUB, SIZE, LOWFX_PARTICLE_COUNT } from "@/lib/constellation/geometry";

// Cœur de la roue : amas de particules (PRNG seedé -> SSR ≡ client) + libellé central.
// En LOWFX : 24 particules au lieu de 90, aucun effet (l'original crashait mobile Safari).
export function HubCore({ particles, lowFx }: { particles: Particle[]; lowFx: boolean }) {
  const shown = lowFx ? particles.slice(0, LOWFX_PARTICLE_COUNT) : particles;
  const box = R_HUB * 2;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: "50%",
        top: "50%",
        width: `${((box * 2.4) / SIZE) * 100}%`,
        aspectRatio: "1 / 1",
      }}
    >
      <svg viewBox={`${C - R_HUB * 1.2} ${C - R_HUB * 1.2} ${box * 1.2} ${box * 1.2}`} className="h-full w-full">
        {shown.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="var(--accent)" fillOpacity={p.opacity} />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="display text-[13px] uppercase text-[var(--text)]">Cerveau d&apos;entreprise</span>
        <span className="mt-0.5 text-[8px] tracking-widest text-[var(--text-faint)]">Company Knowledge Base</span>
      </div>
    </div>
  );
}
