interface EmptyStateProps {
  title: string;
  hint?: string;
}

export function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-[var(--border)] px-6 py-12 text-center">
      <p className="text-sm font-medium text-[var(--text)]">{title}</p>
      {hint && <p className="text-sm text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}
