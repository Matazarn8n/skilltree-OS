import { cn } from "@/lib/utils";

// Barre de progression pure — pas de state, valeur passée en props (0 à 100).
export function ProgressBar({
  value,
  label,
  size = "md",
  className,
}: {
  value: number;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">{label}</span>
          <span className="text-[var(--text-faint)]">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progression"}
        className={cn("w-full overflow-hidden rounded-full bg-[var(--bg-elev)]", size === "sm" ? "h-1.5" : "h-2")}
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
