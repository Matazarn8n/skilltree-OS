"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

// Overlay de tour guidé réutilisable : "ÉTAPE n SUR total", titre, texte, Passer/Suivant.
// Échap déclenche onSkip (a11y). Focus posé sur le bouton principal à l'apparition.
export interface TourTooltipProps {
  step: number;
  total: number;
  title: string;
  body: string;
  onSkip: () => void;
  onNext: () => void;
  nextLabel?: string;
}

export function TourTooltip({ step, total, title, body, onSkip, onNext, nextLabel = "Suivant" }: TourTooltipProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onSkip();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSkip]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-6 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-5 shadow-2xl"
      >
        <p className="text-[11px] uppercase tracking-widest text-[var(--accent)]">
          Étape {step} sur {total}
        </p>
        <h3 className="display mt-2 text-lg text-[var(--text)]">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{body}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button onClick={onSkip} className="text-sm text-[var(--text-faint)] hover:text-[var(--text)]">
            Passer
          </button>
          <Button type="button" size="sm" autoFocus onClick={onNext}>
            {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
