// Feed factice "Pouls de la communauté" : dernières installations vues par les membres.
// Usage : <CommunityPulse />
const PULSE = [
  { member: "Léa R.", skill: "Ingénieur d'intelligence réunion", when: "à l'instant" },
  { member: "Marc D.", skill: "Gestionnaire de sourcing", when: "il y a 12 min" },
  { member: "Inès T.", skill: "Sync du Brain", when: "il y a 40 min" },
  { member: "Younes B.", skill: "Base de connaissance", when: "il y a 1 h" },
  { member: "Camille V.", skill: "Production de carrousel", when: "il y a 3 h" },
] as const;

export function CommunityPulse() {
  return (
    <ul className="flex flex-col divide-y divide-[var(--border-soft)] rounded-xl border border-[var(--border)] bg-[var(--bg-panel)]">
      {PULSE.map((p) => (
        <li key={`${p.member}-${p.skill}`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
          <span className="text-[var(--text)]">
            <span className="font-medium">{p.member}</span>{" "}
            <span className="text-[var(--text-muted)]">a installé</span>{" "}
            <span className="font-medium">{p.skill}</span>
          </span>
          <span className="shrink-0 text-xs text-[var(--text-faint)]">{p.when}</span>
        </li>
      ))}
    </ul>
  );
}
