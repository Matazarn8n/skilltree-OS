"use client";
import type { LessonBlock, LessonContent } from "@/lib/lesson-types";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export interface LessonReaderProps {
  content: LessonContent;
  moduleSlug: string;
  lessonSlug: string;
  moduleTitle: string;
  moduleOrder: number; // 0-based order of the module
  lessonIndex: number; // 0-based position within the module
  totalInModule: number;
}

// Rend le corps d'une leçon : chapô + suite de blocs + bouton "Marquer comme terminé" (sans
// navigation — laisse le lecteur sur place, le Stepper voisin se met à jour immédiatement via
// useProgress()). LessonNav garde le bouton "terminé & continuer" pour l'enchaînement.
export function LessonReader({
  content,
  moduleSlug,
  lessonSlug,
  moduleTitle,
  moduleOrder,
  lessonIndex,
  totalInModule,
}: LessonReaderProps) {
  const { isComplete, markComplete } = useProgress();
  const done = isComplete(moduleSlug, lessonSlug);

  return (
    <article className="mx-auto max-w-2xl px-6 py-10">
      <p className="text-[11px] uppercase tracking-widest text-[var(--text-faint)]">
        Module {String(moduleOrder + 1).padStart(2, "0")} · {moduleTitle} · Leçon {String(lessonIndex + 1).padStart(2, "0")} sur{" "}
        {totalInModule}
      </p>
      <h1 className="display mt-3 text-3xl font-semibold leading-tight text-[var(--text)] sm:text-4xl">{content.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <p className="text-sm text-[var(--text-faint)]">{content.estMin} min de lecture</p>
        <button
          type="button"
          aria-pressed={done}
          data-testid="mark-complete"
          onClick={() => markComplete(moduleSlug, lessonSlug)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
            done
              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
              : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]"
          )}
        >
          {done ? "✓ Terminé" : "Marquer comme terminé"}
        </button>
      </div>
      <p className="mt-4 text-base leading-relaxed text-[var(--text-muted)]">{content.dek}</p>

      <div className="mt-8 flex flex-col gap-5">
        {content.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    </article>
  );
}

function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-[15px] leading-relaxed text-[var(--text-muted)]">{block.text}</p>;
    case "h2":
      return <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">{block.text}</h2>;
    case "h3":
      return <h3 className="text-base font-semibold text-[var(--text)]">{block.text}</h3>;
    case "ul":
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-[var(--text-muted)]">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-[var(--text-muted)]">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    case "code":
      return <CodeBlock code={block.code} lang={block.lang} />;
    case "quote":
      return (
        <blockquote className="border-l-2 border-[var(--accent)] pl-4 text-[15px] italic leading-relaxed text-[var(--text)]">
          {block.text}
          {block.cite && <footer className="mt-1.5 text-xs not-italic text-[var(--text-faint)]">— {block.cite}</footer>}
        </blockquote>
      );
    case "callout":
      return <Callout variant={block.variant} title={block.title} text={block.text} />;
    case "table":
      return (
        <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border-soft)]">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border-soft)] bg-[var(--bg-panel)]">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 font-medium text-[var(--text-faint)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-[var(--border-soft)] last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-[var(--text-muted)]">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}
