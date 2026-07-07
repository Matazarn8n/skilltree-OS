"use client";
import Link from "next/link";
import type { ModuleMeta } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { ProgressBar } from "./ProgressBar";

// Carte module pour /modules — lien + progression (0% tant que rien n'est marqué terminé).
export function ModuleCard({ module, lessonSlugs }: { module: ModuleMeta; lessonSlugs: string[] }) {
  const { countDone } = useProgress();
  const total = lessonSlugs.length;
  const done = countDone(module.slug, lessonSlugs);
  const pct = total ? (done / total) * 100 : 0;

  return (
    <Link
      href={`/modules/${module.slug}`}
      className="group flex flex-col gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-panel)] p-5 transition-colors hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <div>
        <p className="text-[11px] uppercase tracking-widest text-[var(--text-faint)]">
          Module {String(module.order + 1).padStart(2, "0")}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">{module.title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{module.subtitle}</p>
      </div>
      <ProgressBar value={pct} label={`${done} / ${total} leçons`} size="sm" />
      <span className="text-sm text-[var(--accent)]">
        {done === 0 ? "Commencer" : done === total ? "Revoir" : "Continuer"}{" "}
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}
