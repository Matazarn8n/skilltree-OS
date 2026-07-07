"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard indisponible (permissions, contexte non sécurisé) — pas bloquant.
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-elev)]">
      <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-3 py-1.5">
        <span className="text-[11px] uppercase tracking-widest text-[var(--text-faint)]">{lang ?? "code"}</span>
        <button
          type="button"
          onClick={onCopy}
          className={cn(
            "rounded-md px-2 py-0.5 text-[11px] transition-colors",
            copied ? "text-[var(--accent)]" : "text-[var(--text-faint)] hover:text-[var(--text)]"
          )}
        >
          {copied ? "Copié ✓" : "Copier"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed text-[var(--text)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
