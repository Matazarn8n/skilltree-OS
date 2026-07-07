"use client";
import { useEffect, useRef } from "react";
import type { Skill } from "@/lib/types";
import { sectorOf, HUB } from "@/lib/catalog";
import { cn } from "@/lib/utils";

// Panneau job latéral droit (MAP-02). Structure fidèle aux captures/map_panel/*.png :
// eyebrow niveau · titre serif · breadcrumb · desc · carte fichier skill · SE DÉCOMPOSE EN ·
// S'APPUIE SUR (cliquable) · CE QUE ÇA REMPLACE · L'ÉCHELLE · L'HUMAIN. Chrome FR, contenu
// catalogue tel quel (D9). Chaque section nullable est omise proprement (jamais « undefined »).
const LEVEL_LABEL: Record<Skill["level"], string> = {
  autonomous: "Pleinement autonome",
  assisted: "Assisté par l'humain",
  "human-led": "Piloté par l'humain",
};

export function JobPanel({
  job,
  onClose,
  onNavigate,
}: {
  job: Skill | null;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Échap = fermer (window : marche même hors du panel focus).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Focus management : mémoriser l'élément ouvreur au 1er montage, focus le ✕,
  // rendre le focus à la fermeture (unmount). La navigation intra-panel ne remonte
  // pas le composant → le focus d'origine (le nœud cliqué) est préservé jusqu'au close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus?.();
  }, []);

  if (!job) return null;
  const sector = sectorOf(job.sector);
  const startsHere = job.notes?.startsWith("Start here") ?? false;
  const fileCount = job.files.length;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      role="dialog"
      aria-modal
      aria-label={job.name}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[var(--border)] bg-[var(--bg-panel)] p-7">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] outline-none hover:text-[var(--text)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          ✕
        </button>

        {/* 1. eyebrow niveau */}
        <p className="pr-12 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: sector.colorVar }}>
          {LEVEL_LABEL[job.level]}
        </p>

        {/* 2. titre + badge « Commence ici » */}
        <div className="mt-2 flex flex-wrap items-baseline gap-3 pr-12">
          <h2 className="display text-3xl text-[var(--text)]">{job.name}</h2>
          {startsHere && (
            <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              Commence ici
            </span>
          )}
        </div>

        {/* 3. breadcrumb */}
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {sector.name}
          {job.function ? ` · ${job.function}` : ""}
        </p>

        {/* 4. description */}
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">{job.desc}</p>

        {/* 5. carte CTA fichier skill */}
        {fileCount > 0 && (
          <div className="mt-5 flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-4">
            <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-soft)] text-[var(--text-muted)]">↓</span>
            <p className="flex-1 text-sm text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--text)]">
                {fileCount} fichier{fileCount > 1 ? "s" : ""} skill exécutable{fileCount > 1 ? "s" : ""}
              </span>{" "}
              · à toi
            </p>
            <button
              type="button"
              disabled
              title="Disponible avec le state user — Phase 4"
              className="shrink-0 cursor-not-allowed text-sm font-medium text-[var(--text-muted)]"
            >
              Récupère-le ↓
            </button>
          </div>
        )}

        {/* 6. SE DÉCOMPOSE EN */}
        {job.skills.length > 0 && (
          <Section title="Se décompose en">
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((s) => (
                <span key={s} className="rounded-md border border-[var(--border-soft)] px-2 py-1 font-mono text-xs text-[var(--text-muted)]">
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* 7. S'APPUIE SUR — chips cliquables (sauf le hub) */}
        {job.requires.length > 0 && (
          <Section title="S'appuie sur">
            <div className="flex flex-wrap gap-1.5">
              {job.requires.map((r) =>
                r.slug === HUB.slug ? (
                  <span key={r.slug} className="rounded-md border border-[var(--border-soft)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
                    ⌂ {r.name}
                  </span>
                ) : (
                  <button
                    key={r.slug}
                    type="button"
                    onClick={() => onNavigate(r.slug)}
                    className="rounded-md border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text)] outline-none hover:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  >
                    {r.name}
                  </button>
                )
              )}
            </div>
          </Section>
        )}

        {/* 8. CE QUE ÇA REMPLACE */}
        {job.replaces && (
          <Section title="Ce que ça remplace">
            <blockquote className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] p-4 text-sm leading-relaxed text-[var(--text-muted)]">
              {job.replaces}
            </blockquote>
          </Section>
        )}

        {/* 9. L'ÉCHELLE — 3 niveaux, ligne courante en évidence */}
        {job.ladder && (
          <Section title="L'échelle">
            <dl className="divide-y divide-[var(--border-soft)]">
              {([
                ["manual", "Piloté humain", job.ladder.manual, job.level === "human-led"],
                ["assisted", "Assisté", job.ladder.assisted, job.level === "assisted"],
                ["autonomous", "Autonome", job.ladder.autonomous, job.level === "autonomous"],
              ] as const).map(([key, label, text, active]) => (
                <div key={key} className="grid grid-cols-[7rem_1fr] gap-4 py-3">
                  <dt
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: active ? sector.colorVar : "var(--text-faint)" }}
                  >
                    {label}
                  </dt>
                  <dd className={cn("text-sm leading-relaxed", active ? "text-[var(--text)]" : "text-[var(--text-muted)]")}>
                    {text}
                  </dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {/* 10. L'HUMAIN */}
        {job.human && (
          <Section title="L'humain">
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">{job.human}</p>
          </Section>
        )}
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-faint)]">{title}</h3>
      {children}
    </section>
  );
}
