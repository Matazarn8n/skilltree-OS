import type { Metadata } from "next";
import { getOrderedModules, getLessons, totalLessonCount } from "@/lib/lessons";
import { Stepper } from "@/components/lesson/Stepper";
import { ModuleCard } from "@/components/lesson/ModuleCard";

export const metadata: Metadata = { title: "SkillTree · Modules" };

export default function ModulesPage() {
  const modules = getOrderedModules();
  const total = totalLessonCount();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-[11px] uppercase tracking-widest text-[var(--text-faint)]">Parcours guidé</p>
      <h1 className="display mt-2 text-3xl font-semibold text-[var(--text)] sm:text-4xl">
        Modules · ton chemin vers une force de travail IA
      </h1>
      <p className="mt-3 text-base text-[var(--text-muted)]">
        {modules.length} modules, {total} leçons.
      </p>

      <div className="mt-8">
        <Stepper
          items={modules.map((m, i) => ({ key: m.slug, label: m.title, status: i === 0 ? "active" : "upcoming" }))}
        />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <ModuleCard key={m.slug} module={m} lessonSlugs={getLessons(m.slug).map((l) => l.slug)} />
        ))}
      </div>
    </div>
  );
}
