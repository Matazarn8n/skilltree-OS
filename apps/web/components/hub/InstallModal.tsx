"use client";
import { useEffect, useRef } from "react";
import { useInstalls } from "@/lib/installs";
import type { SkillFileContent } from "@/lib/skill-files";

export interface InstallModalProps {
  slug: string | null;
  fiche: SkillFileContent | null;
  onClose: () => void;
}

// Modale d'installation d'un skill — role=dialog aria-modal, focus géré (a11y miroir de
// JobPanel.tsx Phase 2). Affiche la fiche FR (content/skills/<slug>.md via getSkillFile,
// résolue côté serveur puis passée en prop) — jamais la prose anglaise catalogue, sauf
// fallback temporaire si le .md n'existe pas encore (Task 2 avant Task 3).
export function InstallModal({ slug, fiche, onClose }: InstallModalProps) {
  const { isInstalled, install } = useInstalls();
  const installBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<Element | null>(null);

  const open = !!slug && !!fiche;

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement;
    installBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (previousFocus.current instanceof HTMLElement) previousFocus.current.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !slug || !fiche) return null;

  const installed = isInstalled(slug);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 pt-24 pb-10"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={fiche.title}
        className="w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-soft)] px-6 py-5">
          <div>
            {fiche.sector && (
              <p className="text-[11px] uppercase tracking-widest" style={{ color: fiche.sector.colorVar }}>
                {fiche.sector.name}
              </p>
            )}
            <h2 className="display mt-1 text-xl text-[var(--text)]">{fiche.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--text-faint)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <section>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
              Ce que ça fait
            </h3>
            <p className="text-sm leading-relaxed text-[var(--text)]">{fiche.what}</p>
          </section>
          <section>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
              Ce qu'il te faut
            </h3>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">{fiche.needs}</p>
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--border-soft)] px-6 py-4">
          <span className="text-xs text-[var(--text-faint)]">
            {fiche.fromMarkdown ? "Fiche complète FR" : "Résumé catalogue (fiche FR à venir)"}
          </span>
          <button
            ref={installBtnRef}
            onClick={() => install(slug)}
            disabled={installed}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-70"
          >
            {installed ? "Installé ✓" : "Installer le skill →"}
          </button>
        </div>
      </div>
    </div>
  );
}
