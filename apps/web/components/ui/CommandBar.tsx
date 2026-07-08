"use client";
import { useEffect, useRef, useState } from "react";
import { InstallModal } from "@/components/hub/InstallModal";
import type { SkillFileContent } from "@/lib/skill-files";

export interface CommandBarProps {
  /** Les 78 fiches skills résolues côté serveur (Server Component parent — jamais de
   *  lecture fs ici, ce composant est "use client"). Clé = slug de la fiche. */
  skillFiles: Record<string, SkillFileContent>;
}

// Recherche globale ⌘K : les 78 skills installables (content/skills/*.md), pas les jobs
// de la roue Map (registre différent — cf. lib/hub-data.ts). Un résultat cliqué ouvre
// l'InstallModal sur ce skill (au lieu de router.push('/map?skill=') comme avant ce plan).
export function CommandBar({ skillFiles }: CommandBarProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [modalSlug, setModalSlug] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allFiles = Object.values(skillFiles);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Les cartes Hub (Fresh drops / Featured / Most installed) déclenchent la même modale
  // via cet event custom, pour ne pas dupliquer d'instance d'InstallModal sur la page.
  useEffect(() => {
    const onOpenInstall = (e: Event) => {
      const slug = (e as CustomEvent<{ slug: string }>).detail?.slug;
      if (slug) setModalSlug(slug);
    };
    window.addEventListener("skilltree:open-install", onOpenInstall);
    return () => window.removeEventListener("skilltree:open-install", onOpenInstall);
  }, []);

  const needle = q.trim().toLowerCase();
  const results = needle
    ? allFiles.filter((f) => (f.title + " " + f.what).toLowerCase().includes(needle)).slice(0, 8)
    : [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] px-3 text-sm text-[var(--text-faint)] hover:border-[var(--accent)]"
      >
        <span aria-hidden>⌕</span>
        <span className="truncate">Cherche un skill, un job… essaie « carrousel »</span>
        <kbd className="ml-auto rounded bg-[var(--bg-panel)] px-1.5 text-[11px]">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-32" onClick={() => setOpen(false)}>
          <div
            role="dialog" aria-modal aria-label="Recherche"
            className="w-full max-w-lg overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Cherche un skill…"
              className="w-full bg-transparent px-4 py-3.5 text-sm outline-none placeholder:text-[var(--text-faint)]"
            />
            <ul className="max-h-80 overflow-y-auto border-t border-[var(--border-soft)]">
              {results.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-[var(--text-faint)]">
                  {q ? "Aucun skill trouvé." : "Tape pour chercher dans l'arbre."}
                </li>
              )}
              {results.map((f) => (
                <li key={f.slug}>
                  <button
                    onClick={() => { setModalSlug(f.slug); setOpen(false); }}
                    className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left hover:bg-[var(--bg-elev)]"
                  >
                    <span className="text-sm text-[var(--text)]">{f.title}</span>
                    <span className="line-clamp-1 text-xs text-[var(--text-muted)]">{f.what}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <InstallModal
        slug={modalSlug}
        fiche={modalSlug ? (skillFiles[modalSlug] ?? null) : null}
        onClose={() => setModalSlug(null)}
      />
    </>
  );
}
