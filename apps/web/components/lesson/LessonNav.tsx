"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/lib/progress";
import type { AdjacentLesson } from "@/lib/lessons";

export interface LessonNavProps {
  moduleSlug: string;
  lessonSlug: string;
  prev?: AdjacentLesson;
  next?: AdjacentLesson;
}

// Nav précédent/suivant + bouton "Marquer comme terminé & continuer".
// Écrit la progression en localStorage puis avance — aucun backend nécessaire.
export function LessonNav({ moduleSlug, lessonSlug, prev, next }: LessonNavProps) {
  const router = useRouter();
  const { markComplete } = useProgress();

  function onCompleteAndContinue() {
    markComplete(moduleSlug, lessonSlug);
    if (next) router.push(`/modules/${next.moduleSlug}/${next.slug}`);
    else router.push("/modules");
  }

  return (
    <nav aria-label="Navigation de leçon" className="mx-auto mt-6 max-w-2xl px-6 pb-16">
      <div className="flex flex-col gap-3 border-t border-[var(--border-soft)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        {prev ? (
          <Link
            href={`/modules/${prev.moduleSlug}/${prev.slug}`}
            className="rounded-md text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            ← Précédent · {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/modules/${next.moduleSlug}/${next.slug}`}
            className="rounded-md text-right text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Suivant · {next.title} →
          </Link>
        ) : (
          <span className="text-right text-sm text-[var(--text-faint)]">Fin du parcours</span>
        )}
      </div>
      <Button onClick={onCompleteAndContinue} className="mt-5 w-full">
        Marquer comme terminé &amp; continuer
      </Button>
    </nav>
  );
}
