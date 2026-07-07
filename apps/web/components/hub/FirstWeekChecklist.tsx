// Checklist des 5 premières étapes (reprend le "Start Here" de l'onboarding).
// Usage : <FirstWeekChecklist />
const STEPS = [
  "Lancer Claude Code sur ta machine",
  "Installer ton premier skill (Concepteur de carrousels, Rédacteur d'emails à froid ou Base de connaissance)",
  "Connecter Claude à ta stack (MCP)",
  "Construire ton Brain",
  "Récupérer le CLAUDE.md de démarrage",
] as const;

export function FirstWeekChecklist() {
  return (
    <ol className="flex flex-col gap-2">
      {STEPS.map((step, i) => (
        <li
          key={step}
          className="flex items-start gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel)] px-4 py-3"
        >
          <span
            className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--border)] text-xs text-[var(--text-faint)]"
            aria-hidden
          >
            {i + 1}
          </span>
          <span className="text-sm text-[var(--text)]">{step}</span>
        </li>
      ))}
    </ol>
  );
}
