import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModule, getLesson, getAdjacent, getLessons } from "@/lib/lessons";
import { LessonReader } from "@/components/lesson/LessonReader";
import { LessonNav } from "@/components/lesson/LessonNav";
import { Stepper } from "@/components/lesson/Stepper";

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
    <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start lg:gap-10 lg:px-6 lg:py-10">
      <div className="min-w-0">
        <LessonReader
          content={resolved.content}
          moduleSlug={moduleSlug}
          lessonSlug={lessonSlug}
          moduleTitle={mod.title}
          moduleOrder={mod.order}
          lessonIndex={resolved.meta.order}
          totalInModule={lessons.length}
        />

        <LessonNav moduleSlug={moduleSlug} lessonSlug={lessonSlug} prev={position?.prev} next={position?.next} />
      </div>

      <aside
        aria-label={`Leçons du module ${mod.title}`}
        className="mx-auto mb-10 max-w-2xl px-6 lg:sticky lg:top-8 lg:mb-0 lg:max-w-none lg:px-0"
      >
        <p className="text-[11px] uppercase tracking-widest text-[var(--text-faint)]">{mod.title}</p>
        <div className="mt-3">
          <Stepper moduleSlug={moduleSlug} lessons={lessons} activeSlug={lessonSlug} />
        </div>
      </aside>
    </div>
  );
}
