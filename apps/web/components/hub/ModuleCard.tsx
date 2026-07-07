import Link from "next/link";
import type { ModuleMeta } from "@/lib/types";

// Carte module (section "Modules" du Hub). Lien vers /modules/<slug>.
// Usage : <ModuleCard module={module} />
export function ModuleCard({ module }: { module: ModuleMeta }) {
  return (
    <Link
      href={`/modules/${module.slug}`}
      aria-label={`Ouvrir le module ${module.title} (${module.lessonCount} leçons)`}
      className="group flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-4 transition-colors hover:border-[var(--accent)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <span className="text-[11px] uppercase tracking-widest text-[var(--text-faint)]">
        Module {String(module.order + 1).padStart(2, "0")}
      </span>
      <h3 className="text-base font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
        {module.title}
      </h3>
      <p className="text-sm text-[var(--text-muted)]">{module.subtitle}</p>
      <span className="mt-auto pt-2 text-xs text-[var(--text-faint)]">{module.lessonCount} leçons</span>
    </Link>
  );
}
