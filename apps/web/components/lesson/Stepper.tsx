"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/progress";
import type { LessonMeta } from "@/lib/types";

export interface StepperProps {
  moduleSlug: string;
  lessons: LessonMeta[];
  /** Slug de la leçon affichée sur la page courante. Absent (page module) : la 1re leçon non
   * terminée fait office d'étape "active" (reprise là où l'utilisateur s'est arrêté). */
  activeSlug?: string;
  className?: string;
}

// Stepper de module — SOURCE UNIQUE de l'état de progression affiché : compteur X/N et statut
// par leçon (terminé/actif/à venir) viennent tous deux de useProgress() (lib/progress.ts), jamais
// dupliqués ni recalculés ailleurs. Clic sur une étape navigue directement vers la leçon.
export function Stepper({ moduleSlug, lessons, activeSlug, className }: StepperProps) {
  const { isComplete, countDone } = useProgress();
  const total = lessons.length;
  const done = countDone(
    moduleSlug,
    lessons.map((l) => l.slug)
  );
  const firstUpcoming = lessons.find((l) => !isComplete(moduleSlug, l.slug))?.slug;
  const current = activeSlug ?? firstUpcoming;

  return (
    <div className={className}>
      <p className="text-sm text-[var(--text-muted)]" data-testid="stepper-count">
        {done} / {total} leçons terminées
      </p>
      <ol aria-label={`Étapes du module ${moduleSlug}`} className="mt-3 flex flex-col gap-1.5">
        {lessons.map((lesson, i) => {
          const complete = isComplete(moduleSlug, lesson.slug);
          const active = current === lesson.slug;
          return (
            <li key={lesson.slug}>
              <Link
                href={`/modules/${moduleSlug}/${lesson.slug}`}
                aria-current={active ? "step" : undefined}
                data-lesson-status={complete ? "done" : active ? "active" : "upcoming"}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  active
                    ? "border-[var(--accent)] bg-[var(--bg-panel)] text-[var(--text)]"
                    : "border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--bg-panel)] hover:text-[var(--text)]"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                    complete
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                      : active
                        ? "border-[var(--accent)] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-faint)]"
                  )}
                >
                  {complete ? "✓" : String(i + 1).padStart(2, "0")}
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
