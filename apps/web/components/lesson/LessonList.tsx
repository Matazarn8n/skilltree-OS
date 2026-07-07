"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";
import type { LessonMeta } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";

export interface LessonListProps {
  moduleSlug: string;
  lessons: LessonMeta[];
  /** Slug de la leçon affichée sur la page courante — reçoit aria-current="page". */
  activeSlug?: string;
  showProgress?: boolean;
}

// Liste des leçons d'un module + barre de progression. Client component : la progression
// vit en localStorage (voir lib/progress.ts), donc ce composant doit lire côté navigateur.
// Réutilisé sur la page module (aperçu) et sur la page leçon (rail de navigation).
export function LessonList({ moduleSlug, lessons, activeSlug, showProgress = true }: LessonListProps) {
  const { isComplete, countDone } = useProgress();
  const done = countDone(
    moduleSlug,
    lessons.map((l) => l.slug)
  );
  const total = lessons.length;
  const pct = total ? (done / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      {showProgress && <ProgressBar value={pct} label={`${done} / ${total} leçons terminées`} />}
      <ol className="flex flex-col gap-1">
        {lessons.map((lesson, i) => {
          const complete = isComplete(moduleSlug, lesson.slug);
          const active = activeSlug === lesson.slug;
          return (
            <li key={lesson.slug}>
              <Link
                href={`/modules/${moduleSlug}/${lesson.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  active
                    ? "border-[var(--accent)] bg-[var(--bg-panel)] text-[var(--text)]"
                    : "border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--bg-panel)] hover:text-[var(--text)]"
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px]",
                    complete ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border)] text-[var(--text-faint)]"
                  )}
                  aria-hidden
                >
                  {complete ? "✓" : i + 1}
                </span>
                <span className="flex-1">{lesson.title}</span>
                <span className="text-xs text-[var(--text-faint)]">{lesson.estMin} min</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
