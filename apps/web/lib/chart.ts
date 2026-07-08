import { CHART_JOBS } from "@/lib/catalog";
import type { JobLevel, SectorSlug, Skill } from "@/lib/types";

// Vue CHART (P5.1, CHART-01/02). Tout ce fichier RECALCULE depuis CHART_JOBS (165 jobs =
// 137 map + 28 extras origin='chart', D2) — jamais de chiffre copié d'une capture. Les
// totaux de contrôle (165 / 36 human-led) doivent tomber de ces fonctions, pas être écrits
// en dur ici (cf. docs/ARCHITECTURE.md §7, assert-graph.mjs EXPECT).

export interface SectorSummary {
  total: number;
  autonomous: number;
  assisted: number;
  humanLed: number;
}

/** Tous les jobs (map + extras chart) d'un secteur — base de tout le reste de ce module. */
export function sectorJobs(sector: SectorSlug): Skill[] {
  return CHART_JOBS.filter((j) => j.sector === sector);
}

/** {total, autonomous, assisted, humanLed} recalculé depuis les jobs du secteur (jamais copié). */
export function sectorSummary(sector: SectorSlug): SectorSummary {
  const jobs = sectorJobs(sector);
  let autonomous = 0;
  let assisted = 0;
  let humanLed = 0;
  for (const j of jobs) {
    if (j.level === "autonomous") autonomous++;
    else if (j.level === "assisted") assisted++;
    else humanLed++;
  }
  return { total: jobs.length, autonomous, assisted, humanLed };
}

/** Phrase FR « N jobs sur M tournent en autonomie · X assistés · Y restent pilotés par un
 *  humain » composée à partir des comptes recalculés — jamais du texte source des captures. */
export function summaryLabel(s: SectorSummary): string {
  return `${s.autonomous} jobs sur ${s.total} tournent en autonomie · ${s.assisted} assisté${s.assisted > 1 ? "s" : ""} · ${s.humanLed} rest${s.humanLed > 1 ? "ent" : "e"} piloté${s.humanLed > 1 ? "s" : ""} par un humain.`;
}

/** Totaux de contrôle tous secteurs confondus (attendu par assert-graph : 165 / 36). Recalculé
 *  depuis CHART_JOBS — ne JAMAIS coder ces nombres en dur (cf. grep de preuve du plan). */
export function chartTotals(): { total: number; humanLed: number } {
  const total = CHART_JOBS.length;
  const humanLed = CHART_JOBS.filter((j) => j.level === "human-led").length;
  return { total, humanLed };
}

export interface StageInfo {
  stage: number;
  name: string;
  sub: string;
}

// Sous-titres des 4 étapes — copie chrome FR statique (source : captures/dynamic/chart_html.txt,
// identique pour tous les secteurs dans l'original). Ce ne sont pas des chiffres, donc pas
// concernés par la règle anti-fabrication (qui porte sur les comptes N of M).
const STAGE_SUB_FR: Record<string, string> = {
  Foundation: "La donnée + le cerveau d'entreprise",
  Capture: "Classer, extraire, scorer",
  Generate: "Produire le travail, agir",
  Orchestrate: "Agents, supervision, boucles",
};

// Les 4 étapes canoniques (numéro + nom) dérivées des jobs eux-mêmes (stageName distincts
// 1-4, déjà mergés au build depuis skills.json — y compris pour Sales, cf. docs/ARCHITECTURE.md
// §7 D2). Toujours les 4 mêmes colonnes affichées pour chaque secteur (certaines vides selon
// le secteur, fidèle aux captures/chart/marketing__matrix.png).
const STAGES: StageInfo[] = (() => {
  const found = new Map<number, string>();
  for (const j of CHART_JOBS) {
    if (j.origin === "map" && j.stage != null && j.stageName) found.set(j.stage, j.stageName);
  }
  return [...found.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([stage, name]) => ({ stage, name, sub: STAGE_SUB_FR[name] ?? "" }));
})();

/** Les 4 noms d'étape (identiques pour tous les secteurs dans la donnée réconciliée — fallback
 *  Sales déjà résolu au build). Signature conservée par secteur pour usage futur si un secteur
 *  dérive un jour un jeu d'étapes différent. */
export function stagesFor(_sector: SectorSlug): StageInfo[] {
  return STAGES;
}

export const LEVELS: { level: JobLevel; label: string; desc: string }[] = [
  { level: "human-led", label: "Piloté par l'humain", desc: "Une personne le conduit." },
  { level: "assisted", label: "Assisté par l'humain", desc: "L'IA rédige, un humain valide." },
  { level: "autonomous", label: "Pleinement autonome", desc: "L'IA l'exécute sans supervision." },
];

export interface MatrixGrid {
  stages: StageInfo[];
  /** jobs assisted/autonomous rangés par numéro d'étape réel. */
  byStage: Map<JobLevel, Map<number, Skill[]>>;
  /** jobs human-led (toujours badgés « En continu » — jamais un numéro d'étape, fidèle à
   *  l'original où le badge stage est remplacé par « Ongoing » sur toute la ligne Human-led,
   *  cf. docs/07_VISUAL_SPEC.md §Vue CHART). Distribués sur les colonnes pour l'affichage. */
  ongoing: Skill[];
}

/** Regroupe les jobs d'un secteur en grille étape(1-4) × niveau (3), extras chart inclus. */
export function groupByStageLevel(sector: SectorSlug): MatrixGrid {
  const jobs = sectorJobs(sector);
  const stages = stagesFor(sector);
  const levels: JobLevel[] = ["assisted", "autonomous"];
  const byStage = new Map<JobLevel, Map<number, Skill[]>>();
  for (const level of levels) {
    byStage.set(
      level,
      new Map(stages.map((s) => [s.stage, [] as Skill[]]))
    );
  }
  const ongoing: Skill[] = [];
  for (const j of jobs) {
    if (j.level === "human-led") {
      ongoing.push(j);
      continue;
    }
    const col = byStage.get(j.level);
    if (col && j.stage != null && col.has(j.stage)) col.get(j.stage)!.push(j);
  }
  return { stages, byStage, ongoing };
}
