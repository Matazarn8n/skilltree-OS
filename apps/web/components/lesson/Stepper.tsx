import { cn } from "@/lib/utils";

export interface StepperItem {
  key: string;
  label: string;
  status: "done" | "active" | "upcoming";
}

// Stepper horizontal 01 → 02 → 03 — purement présentationnel, aucune interactivité requise.
export function Stepper({ items }: { items: StepperItem[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3" aria-label="Progression des modules">
      {items.map((item, i) => (
        <li key={item.key} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span
              aria-current={item.status === "active" ? "step" : undefined}
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                item.status === "done" && "border-[var(--accent)] bg-[var(--accent)] text-white",
                item.status === "active" && "border-[var(--accent)] text-[var(--accent)]",
                item.status === "upcoming" && "border-[var(--border)] text-[var(--text-faint)]"
              )}
            >
              {item.status === "done" ? "✓" : String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={cn(
                "text-sm",
                item.status === "upcoming" ? "text-[var(--text-faint)]" : "text-[var(--text)]"
              )}
            >
              {item.label}
            </span>
          </div>
          {i < items.length - 1 && <span className="mx-1 h-px w-8 shrink-0 bg-[var(--border)]" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
