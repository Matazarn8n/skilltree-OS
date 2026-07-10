"use client";
import { useCallback, useEffect, useState } from "react";

// Brain — base de connaissance de l'entreprise, en 8 sections (enum `brain_section`,
// docs/ARCHITECTURE.md §5 : company/offer/customers/voice/ops/stack/goals/constraints).
// Chaque section porte son contenu + sa source (ai|manual). Phase 4 : persisté en Postgres
// via GET/PUT /api/brain (RLS auth.uid()), et `draftBrain()` appelle le SEUL point LLM
// (/api/brain/draft → gateway HERMES :8765, D7). Signatures publiques inchangées.

export type BrainSectionKey =
  | "company"
  | "offer"
  | "customers"
  | "voice"
  | "ops"
  | "stack"
  | "goals"
  | "constraints";

export interface BrainSectionDef {
  key: BrainSectionKey;
  /** Eyebrow FR affiché en majuscules, ex. "ENTREPRISE" (capture originale : "COMPANY"). */
  eyebrow: string;
  /** Libellé court FR (menu, résumé). */
  label: string;
  /** Question posée à l'écran, une par section (fidèle à brain_section_1.json : « What's your company called? »). */
  question: string;
  /** Placeholder de l'éditeur. */
  placeholder: string;
}

export const BRAIN_SECTIONS: BrainSectionDef[] = [
  {
    key: "company",
    eyebrow: "ENTREPRISE",
    label: "L'entreprise",
    question: "Comment s'appelle ton entreprise ?",
    placeholder: "Altari",
  },
  {
    key: "offer",
    eyebrow: "OFFRE",
    label: "L'offre",
    question: "Que vends-tu, exactement ?",
    placeholder: "Ex. accompagnement growth pour SaaS B2B, forfait mensuel",
  },
  {
    key: "customers",
    eyebrow: "CLIENTS",
    label: "Les clients",
    question: "Qui sont tes clients, et pourquoi achètent-ils maintenant ?",
    placeholder: "Ex. fondateurs solo, 0-2 ans, qui n'ont pas le temps de faire le growth eux-mêmes",
  },
  {
    key: "voice",
    eyebrow: "TON",
    label: "Le ton",
    question: "Comment veux-tu que tes agents parlent en ton nom ?",
    placeholder: "Ex. direct, concret, sans jargon, jamais grandiloquent",
  },
  {
    key: "ops",
    eyebrow: "OPÉRATIONS",
    label: "Le fonctionnement",
    question: "Comment se déroule une mission type, du premier contact à la livraison ?",
    placeholder: "Ex. call découverte → devis → kickoff → points hebdo → livraison",
  },
  {
    key: "stack",
    eyebrow: "OUTILS",
    label: "Les outils",
    question: "Quels outils utilises-tu au quotidien pour livrer ce travail ?",
    placeholder: "Ex. Notion, Airtable, Slack, HubSpot",
  },
  {
    key: "goals",
    eyebrow: "OBJECTIFS",
    label: "Les objectifs",
    question: "Quels sont tes objectifs pour les prochains mois ?",
    placeholder: "Ex. doubler le nombre de clients actifs d'ici la fin du trimestre",
  },
  {
    key: "constraints",
    eyebrow: "CONTRAINTES",
    label: "Les contraintes",
    question: "Qu'est-ce qui est interdit ou à éviter (budget, ton, sujets) ?",
    placeholder: "Ex. jamais de promesse de résultat chiffré, budget outils < 200€/mois",
  },
];

export const BRAIN_SECTION_KEYS: BrainSectionKey[] = BRAIN_SECTIONS.map((s) => s.key);

export type BrainSource = "ai" | "manual";

export interface BrainEntry {
  content: string;
  source: BrainSource;
}

export type BrainMap = Partial<Record<BrainSectionKey, BrainEntry>>;

const EVENT = "skilltree:brain";

// Brain — état user réel (Postgres via /api/brain, RLS auth.uid()). Phase 4 a remplacé
// le corps localStorage par des appels /api ; signatures inchangées. Cache module hydraté
// par useBrain() ; loadBrainMap() (lecture sync hors hook) tape sur ce cache.
let cache: BrainMap = {};

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/** Recharge le cache depuis la DB (GET /api/brain) puis notifie les hooks montés. */
async function hydrate(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/brain", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as Record<string, BrainEntry>;
    const next: BrainMap = {};
    for (const key of BRAIN_SECTION_KEYS) {
      if (data[key]) next[key] = { content: data[key].content, source: data[key].source };
    }
    cache = next;
    emit();
  } catch {
    // non authentifié / hors-ligne — pas d'invention.
  }
}

/**
 * Lecture synchrone directe (hors hook) — tape sur le cache module hydraté par useBrain().
 * Note : au tout premier rendu (avant hydratation DB), le cache est vide → le wizard démarre
 * à l'intake même pour un user avec un Brain existant (la reprise fine = raffinement Phase 5,
 * onboarding). Les données restent en DB et s'affichent une fois useBrain() hydraté.
 */
export function loadBrainMap(): BrainMap {
  return cache;
}

/** Première section dont le contenu est vide (ordre BRAIN_SECTIONS) ; -1 si les 8 sont remplies. */
export function firstUnfilledIndex(map: BrainMap): number {
  return BRAIN_SECTIONS.findIndex((s) => !(map[s.key]?.content ?? "").trim());
}

/** Hook client : hydrate depuis la DB au montage, se re-rend sur tout changement. */
export function useBrain() {
  const [map, setMap] = useState<BrainMap>(cache);

  useEffect(() => {
    void hydrate();
    const onChange = () => setMap({ ...cache });
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const readSection = useCallback(
    (key: BrainSectionKey): BrainEntry => map[key] ?? { content: "", source: "manual" as BrainSource },
    [map]
  );

  const save = useCallback((key: BrainSectionKey, content: string, source: BrainSource) => {
    cache = { ...cache, [key]: { content, source } };
    setMap({ ...cache });
    emit();
    void fetch("/api/brain", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: key, content, source }),
    });
  }, []);

  const saveAll = useCallback((entries: Record<BrainSectionKey, string>, source: BrainSource) => {
    const next = { ...cache };
    for (const key of BRAIN_SECTION_KEYS) next[key] = { content: entries[key] ?? "", source };
    cache = next;
    setMap({ ...cache });
    emit();
    // Persiste chaque section (PUT idempotent par (user, section)).
    for (const key of BRAIN_SECTION_KEYS) {
      void fetch("/api/brain", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: key, content: entries[key] ?? "", source }),
      });
    }
  }, []);

  const all = useCallback((): BrainMap => map, [map]);

  const reset = useCallback(() => {
    cache = {};
    setMap({});
    emit();
    // Efface côté DB en remettant chaque section à vide (source manual).
    for (const key of BRAIN_SECTION_KEYS) {
      void fetch("/api/brain", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: key, content: "", source: "manual" }),
      });
    }
  }, []);

  return { read: readSection, save, saveAll, all, reset };
}

/**
 * SEUL point LLM : appelle POST /api/brain/draft (gateway HERMES :8765 via X-Internal-Token, D7).
 * Async — la signature de RETOUR passe de Record à Promise<Record> (le caller await désormais).
 * AUCUN fallback gabarit : si la route échoue (403/429/502), on throw (une panne LLM DOIT
 * échouer, cf. règle anti-faux-positif) — jamais de faux brouillon déterministe.
 */
export async function draftBrain(input: { url?: string; notes?: string }): Promise<Record<BrainSectionKey, string>> {
  const res = await fetch("/api/brain/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`draft_failed_${res.status}`);
  return (await res.json()) as Record<BrainSectionKey, string>;
}
