"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SKILLS } from "@/lib/data";

// Recherche globale ⌘K : skills + raccourcis. Stub client (en prod : endpoint /api/search).
export function CommandBar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const results = q.trim()
    ? SKILLS.filter((s) => (s.name + s.summary).toLowerCase().includes(q.toLowerCase())).slice(0, 8)
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
              {results.map((s) => (
                <li key={s.slug}>
                  <button
                    onClick={() => { router.push(`/map?skill=${s.slug}`); setOpen(false); }}
                    className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left hover:bg-[var(--bg-elev)]"
                  >
                    <span className="text-sm text-[var(--text)]">{s.name}</span>
                    <span className="line-clamp-1 text-xs text-[var(--text-muted)]">{s.summary}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
