"use client";
import { useCallback, useEffect, useState } from "react";

// Interface d'installation locale — stub client (localStorage), AUCUN backend.
// Phase 4 (Supabase) remplacera le corps de install()/uninstall()/isInstalled() par des
// appels POST/DELETE /api/install ; les signatures ci-dessous restent identiques pour que
// l'UI (InstallModal, CommandBar, MostInstalled, TreeAudit de 03-04) n'ait rien à réécrire.
//
// Miroir strict du pattern lib/progress.ts (même clé de storage + event + hook).

const STORAGE_KEY = "skilltree.installs.v1";
const EVENT = "skilltree:installs";

type InstallMap = Record<string, true>;

function read(): InstallMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as InstallMap;
  } catch {
    return {};
  }
}

function write(map: InstallMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // localStorage indisponible (navigation privée stricte, etc.) — dégrade en silence.
  }
}

/** Fonction pure, utilisable hors hook (ex. depuis un handler non-React). */
export function isInstalled(slug: string): boolean {
  return !!read()[slug];
}

/** Fonction pure : marque un slug installé. */
export function install(slug: string): void {
  const next = { ...read(), [slug]: true as const };
  write(next);
}

/** Fonction pure : retire un slug installé. */
export function uninstall(slug: string): void {
  const next = { ...read() };
  delete next[slug];
  write(next);
}

/** Hook client : lit + met à jour les installs, se re-rend sur tout changement
 *  (même onglet via l'event custom, autre onglet via `storage`). */
export function useInstalls() {
  const [map, setMap] = useState<InstallMap>({});

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

  const installed = Object.keys(map);

  const isInstalledHook = useCallback((slug: string) => !!map[slug], [map]);

  const installHook = useCallback((slug: string) => {
    const next = { ...read(), [slug]: true as const };
    write(next);
    setMap(next);
  }, []);

  const uninstallHook = useCallback((slug: string) => {
    const next = { ...read() };
    delete next[slug];
    write(next);
    setMap(next);
  }, []);

  return {
    installed,
    isInstalled: isInstalledHook,
    install: installHook,
    uninstall: uninstallHook,
    count: installed.length,
  };
}
