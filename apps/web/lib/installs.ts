"use client";
import { useCallback, useEffect, useState } from "react";

// Installs — état user réel (Postgres via /api/install, RLS auth.uid()). Phase 4 a remplacé
// le corps localStorage par des appels /api ; les signatures publiques sont INCHANGÉES pour
// que l'UI (InstallModal, MostInstalled, TreeAudit) n'ait rien à réécrire.
//
// Cache module hydraté par le hook → les fonctions pures (isInstalled/install/uninstall,
// utilisables hors React) restent SYNCHRONES en tapant sur ce cache, et poussent la mutation
// vers l'API en fire-and-forget. La source de vérité durable reste la row Postgres.

const EVENT = "skilltree:installs";

let cache: Record<string, true> = {};

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/** Recharge le cache depuis la DB (GET /api/install) puis notifie les hooks montés. */
async function hydrate(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/install", { cache: "no-store" });
    if (!res.ok) return;
    const { installed } = (await res.json()) as { installed: string[] };
    cache = Object.fromEntries(installed.map((s) => [s, true as const]));
    emit();
  } catch {
    // hors-ligne / non authentifié — le cache reste ce qu'il est ; pas d'invention de données.
  }
}

/** Fonction pure (hors hook) : lit le cache module. */
export function isInstalled(slug: string): boolean {
  return !!cache[slug];
}

/** Fonction pure : installe (optimiste dans le cache + POST fire-and-forget). */
export function install(slug: string): void {
  cache = { ...cache, [slug]: true };
  emit();
  // ponytail: fire-and-forget — la persistance réelle est la row ; le hook re-hydrate au montage.
  void fetch("/api/install", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });
}

/** Fonction pure : désinstalle (optimiste + DELETE fire-and-forget). */
export function uninstall(slug: string): void {
  const next = { ...cache };
  delete next[slug];
  cache = next;
  emit();
  void fetch("/api/install", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });
}

/** Hook client : hydrate depuis la DB au montage, se re-rend sur tout changement. */
export function useInstalls() {
  const [map, setMap] = useState<Record<string, true>>(cache);

  useEffect(() => {
    void hydrate();
    const onChange = () => setMap({ ...cache });
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const installed = Object.keys(map);

  const isInstalledHook = useCallback((slug: string) => !!map[slug], [map]);

  const installHook = useCallback(async (slug: string) => {
    cache = { ...cache, [slug]: true };
    setMap({ ...cache });
    emit();
    await fetch("/api/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, []);

  const uninstallHook = useCallback(async (slug: string) => {
    const next = { ...cache };
    delete next[slug];
    cache = next;
    setMap({ ...cache });
    emit();
    await fetch("/api/install", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, []);

  return {
    installed,
    isInstalled: isInstalledHook,
    install: installHook,
    uninstall: uninstallHook,
    count: installed.length,
  };
}
