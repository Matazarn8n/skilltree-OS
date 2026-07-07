import { cn } from "@/lib/utils";
import type { LessonBlock } from "@/lib/lesson-types";

type CalloutVariant = Extract<LessonBlock, { type: "callout" }>["variant"];

const VARIANT_STYLE: Record<CalloutVariant, { border: string; badge: string; defaultTitle: string }> = {
  key: { border: "border-[var(--accent)]/40", badge: "text-[var(--accent)]", defaultTitle: "Idée clé" },
  tip: { border: "border-[var(--color-sector-operations)]/40", badge: "text-[var(--color-sector-operations)]", defaultTitle: "Astuce" },
  warning: { border: "border-[var(--color-sector-deals)]/40", badge: "text-[var(--color-sector-deals)]", defaultTitle: "Attention" },
};

export function Callout({ variant, title, text }: { variant: CalloutVariant; title?: string; text: string }) {
  const style = VARIANT_STYLE[variant];
  return (
    <div className={cn("rounded-[var(--radius)] border bg-[var(--bg-panel)] p-4", style.border)}>
      <p className={cn("mb-1.5 text-[11px] font-semibold uppercase tracking-widest", style.badge)}>
        {title ?? style.defaultTitle}
      </p>
      <p className="text-sm leading-relaxed text-[var(--text-muted)]">{text}</p>
    </div>
  );
}
