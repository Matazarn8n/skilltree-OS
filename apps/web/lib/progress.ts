"use client";
import { useCallback, useEffect, useState } from "react";
import { lessonKey } from "./lessons";

// Progression des leçons — état local uniquement (localStorage), aucun backend.
// Clé "module/lesson" -> true si terminée. Un event window custom fait re-render
// tous les hooks montés dans l'onglet dès qu'une leçon est marquée terminée.

const STORAGE_KEY = "skilltree.progress.v1";
const EVENT = "skilltree:progress";

type ProgressMap = Record<string, true>;

function read(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as ProgressMap;
  } catch {
    return {};
  }
}

function write(map: ProgressMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // localStorage indisponible (navigation privée stricte, etc.) — dégrade en silence.
  }
}

/** Hook client : lit + met à jour la progression, se re-rend sur tout changement (même onglet ou autre onglet). */
export function useProgress() {
  const [map, setMap] = useState<ProgressMap>({});

  useEffect(() => {
    setMap(read());
    const onChange = () => setMap(read());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const isComplete = useCallback((moduleSlug: string, lessonSlug: string) => !!map[lessonKey(moduleSlug, lessonSlug)], [map]);

  const markComplete = useCallback((moduleSlug: string, lessonSlug: string) => {
    const next = { ...read(), [lessonKey(moduleSlug, lessonSlug)]: true as const };
    write(next);
    setMap(next);
  }, []);

  const countDone = useCallback(
    (moduleSlug: string, lessonSlugs: string[]) => lessonSlugs.filter((s) => map[lessonKey(moduleSlug, s)]).length,
    [map]
  );

  return { isComplete, markComplete, countDone };
}
