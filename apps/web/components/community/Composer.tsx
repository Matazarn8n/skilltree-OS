"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

interface ComposerProps {
  onPublish: (content: string) => void;
}

export function Composer({ onPublish }: ComposerProps) {
  const [content, setContent] = useState("");
  const trimmed = content.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trimmed.length === 0) return;
    onPublish(trimmed);
    setContent("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-4"
    >
      <label htmlFor="composer" className="sr-only">
        Partage quelque chose
      </label>
      <textarea
        id="composer"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Partage quelque chose…"
        rows={3}
        className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-elev)] p-3 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={trimmed.length === 0}>
          Publier
        </Button>
      </div>
    </form>
  );
}
