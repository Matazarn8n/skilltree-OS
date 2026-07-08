import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getModule, getLessons } from "@/lib/lessons";
import { Stepper } from "@/components/lesson/Stepper";

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  return { title: mod ? `SkillTree · ${mod.title}` : "SkillTree · Module introuvable" };
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  if (!mod) notFound();

  const lessons = getLessons(moduleSlug);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/modules" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        ← Modules
      </Link>
      <p className="mt-4 text-[11px] uppercase tracking-widest text-[var(--text-faint)]">
        Module {String(mod.order + 1).padStart(2, "0")}
      </p>
      <h1 className="display mt-2 text-3xl font-semibold text-[var(--text)]">{mod.title}</h1>
      <p className="mt-2 text-base text-[var(--text-muted)]">{mod.subtitle}</p>

      {lessons[0] && (
        <Link
          href={`/modules/${moduleSlug}/${lessons[0].slug}`}
          className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          Entrer dans le module →
        </Link>
      )}

      <div className="mt-8">
        <Stepper moduleSlug={moduleSlug} lessons={lessons} />
      </div>
    </div>
  );
}
