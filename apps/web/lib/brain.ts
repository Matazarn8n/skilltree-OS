"use client";
import { useCallback, useEffect, useState } from "react";

// Brain — base de connaissance de l'entreprise, en 8 sections (enum `brain_section`,
// docs/ARCHITECTURE.md §5 : company/offer/customers/voice/ops/stack/goals/constraints).
// Chaque section porte son contenu + sa source (ai|manual). Persisté en localStorage
// (mono-user, pas de backend) sous la clé "skilltree.brain.v1" — miroir de lib/progress.ts
// (event + storage pour re-render tous les hooks montés).
//
// STUB PHASE 4 : `draftBrain()` ci-dessous est un gabarit FR déterministe, calculé
// localement à partir de l'input (url/notes) — CE N'EST PAS un appel réseau/LLM.
// Phase 4 remplace le corps de `draftBrain()` par `POST /api/brain/draft` (gateway
// HERMES :8765, D7) et la persistance de `useBrain()` par `GET/PUT /api/brain` (D5,
// Postgres+RLS) — signatures inchangées, aucun composant de Phase 3 ne bouge.

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

const STORAGE_KEY = "skilltree.brain.v1";
const EVENT = "skilltree:brain";

function read(): BrainMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Garde-fou : un ancien brouillon (format pré-refonte) n'a pas la forme
    // Record<sectionKey, BrainEntry> — on l'ignore plutôt que de planter dessus.
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as BrainMap;
  } catch {
    return {};
  }
}

function write(map: BrainMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // localStorage indisponible (navigation privée stricte, etc.) — dégrade en silence.
  }
}

/** Hook client : lit/écrit le brain, se re-rend sur tout changement (même onglet ou autre onglet). */
export function useBrain() {
  const [map, setMap] = useState<BrainMap>({});

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

  const readSection = useCallback(
    (key: BrainSectionKey): BrainEntry => map[key] ?? { content: "", source: "manual" as BrainSource },
    [map]
  );

  const save = useCallback((key: BrainSectionKey, content: string, source: BrainSource) => {
    const next = { ...read(), [key]: { content, source } };
    write(next);
    setMap(next);
  }, []);

  const saveAll = useCallback((entries: Record<BrainSectionKey, string>, source: BrainSource) => {
    const next = { ...read() };
    for (const key of BRAIN_SECTION_KEYS) {
      next[key] = { content: entries[key] ?? "", source };
    }
    write(next);
    setMap(next);
  }, []);

  const all = useCallback((): BrainMap => map, [map]);

  const reset = useCallback(() => {
    write({});
    setMap({});
  }, []);

  return { read: readSection, save, saveAll, all, reset };
}

/**
 * STUB LOCAL (Phase 4-ready) — gabarit FR déterministe par section, dérivé de l'input.
 * PAS un appel réseau/LLM : aucun fetch, aucun setTimeout déguisé en latence serveur.
 * Phase 4 remplace ce corps par `await fetch("/api/brain/draft", { method: "POST", body: ... })`
 * (gateway HERMES :8765, D7) — la signature `draftBrain(input) => Record<key, string>` ne change pas.
 */
export function draftBrain(input: { url?: string; notes?: string }): Record<BrainSectionKey, string> {
  const site = input.url?.trim() || "ton site";
  const pitch = input.notes?.trim() || "ce que tu fais au quotidien";
  return {
    company: `Brouillon à partir de ${site} : ${pitch}. À préciser : marché, taille d'équipe, ancienneté.`,
    offer: `Tes offres principales et leur prix — point de départ déduit de : « ${pitch} ».`,
    customers: `Profil client déduit de tes notes : qui achète, pourquoi maintenant, budget type.`,
    voice: `Direct, concret, sans jargon — ajuste si ce n'est pas ton style habituel.`,
    ops: `Les étapes types d'une mission, du premier contact à la livraison.`,
    stack: `Outils cités ou déduits de ${site} — à compléter (CRM, facturation, support).`,
    goals: `Objectifs déduits de tes notes pour les prochains mois — à chiffrer.`,
    constraints: `Rien d'identifié depuis ${site} — liste ici ce qui est interdit ou à éviter.`,
  };
}
