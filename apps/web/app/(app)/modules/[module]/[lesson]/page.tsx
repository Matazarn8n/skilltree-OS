import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModule, getLesson, getAdjacent, getLessons } from "@/lib/lessons";
import { LessonReader } from "@/components/lesson/LessonReader";
import { LessonNav } from "@/components/lesson/LessonNav";
import { LessonList } from "@/components/lesson/LessonList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string; lesson: string }>;
}): Promise<Metadata> {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const resolved = getLesson(moduleSlug, lessonSlug);
  return { title: resolved ? `SkillTree · ${resolved.content.title}` : "SkillTree · Leçon introuvable" };
}

export default async function LessonPage({ params }: { params: Promise<{ module: string; lesson: string }> }) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;

  const mod = getModule(moduleSlug);
  if (!mod) notFound();

  const resolved = getLesson(moduleSlug, lessonSlug);
  if (!resolved) notFound();

  const position = getAdjacent(moduleSlug, lessonSlug);
  const lessons = getLessons(moduleSlug);

  return (
    <div>
      <LessonReader
        content={resolved.content}
        moduleTitle={mod.title}
        moduleOrder={mod.order}
        lessonIndex={resolved.meta.order}
        totalInModule={lessons.length}
      />

      <div className="mx-auto max-w-2xl px-6">
        <details className="rounded-[var(--radius)] border border-[var(--border-soft)] p-4">
          <summary className="cursor-pointer select-none text-sm text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
            Leçons de ce module
          </summary>
          <div className="mt-4">
            <LessonList moduleSlug={moduleSlug} lessons={lessons} activeSlug={lessonSlug} showProgress={false} />
          </div>
        </details>
      </div>

      <LessonNav moduleSlug={moduleSlug} lessonSlug={lessonSlug} prev={position?.prev} next={position?.next} />
    </div>
  );
}
