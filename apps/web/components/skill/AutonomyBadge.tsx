export function AutonomyBadge({ on }: { on: boolean }) {
  if (!on) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2 py-0.5 text-[11px] text-[var(--accent)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
      Entièrement autonome
    </span>
  );
}
