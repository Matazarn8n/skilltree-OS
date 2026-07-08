"use client";
import type { Ref } from "react";
import { cn } from "@/lib/utils";
import type { BrainSectionDef, BrainSource } from "@/lib/brain";

// Une section du wizard Brain : question + éditeur + badge de source. Purement
// présentationnel — la lecture/écriture localStorage reste dans BrainWizard (via
// useBrain()), ce composant ne connaît que la valeur qu'on lui passe.
export function BrainSection({
  section,
  value,
  source,
  onChange,
  inputRef,
}: {
  section: BrainSectionDef;
  value: string;
  source: BrainSource;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLTextAreaElement>;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl font-semibold text-[var(--text)]">{section.question}</h2>
        <span
          data-testid="brain-source-badge"
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide",
            source === "ai" ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "bg-[var(--bg-elev)] text-[var(--text-faint)]"
          )}
        >
          {source === "ai" ? "IA" : "Manuel"}
        </span>
      </div>
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder={section.placeholder}
        aria-label={section.question}
        className="mt-4 w-full resize-y rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />
    </div>
  );
}
