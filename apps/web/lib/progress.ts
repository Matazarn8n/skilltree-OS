"use client";
import { useCallback, useEffect, useState } from "react";
import { lessonKey } from "./lessons";

// Progression des leçons — état user réel (Postgres via /api/progress, RLS auth.uid()).
// Phase 4 a remplacé le corps localStorage par des appels /api ; signatures inchangées.
// lesson_id en DB = lessonKey(module, lesson). Un event window re-rend les hooks montés.

const EVENT = "skilltree:progress";

let cache: Record<string, true> = {};

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

async function hydrate(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/progress", { cache: "no-store" });
    if (!res.ok) return;
    const { done } = (await res.json()) as { done: string[] };
    cache = Object.fromEntries(done.map((k) => [k, true as const]));
    emit();
  } catch {
    // non authentifié / hors-ligne — pas d'invention.
  }
}

/** Hook client : hydrate depuis la DB au montage, se re-rend sur tout changement. */
export function useProgress() {
  const [map, setMap] = useState<Record<string, true>>(cache);

  useEffect(() => {
    void hydrate();
    const onChange = () => setMap({ ...cache });
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const isComplete = useCallback(
    (moduleSlug: string, lessonSlug: string) => !!map[lessonKey(moduleSlug, lessonSlug)],
    [map]
  );

  const markComplete = useCallback(async (moduleSlug: string, lessonSlug: string) => {
    const key = lessonKey(moduleSlug, lessonSlug);
    cache = { ...cache, [key]: true };
    setMap({ ...cache });
    emit();
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: key, status: "done" }),
    }).catch(() => {});
  }, []);

  const countDone = useCallback(
    (moduleSlug: string, lessonSlugs: string[]) => lessonSlugs.filter((s) => map[lessonKey(moduleSlug, s)]).length,
    [map]
  );

  return { isComplete, markComplete, countDone };
}
