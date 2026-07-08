import { SKILL_FILES, CHART_JOBS, SECTORS } from "./catalog";
import type { SkillFile, SectorSlug } from "./types";

// Sélections Hub — TOUJOURS dérivées du catalogue statique, JAMAIS de Math.random ni de
// compteur d'install fabriqué (docs/ARCHITECTURE.md D3). Les seuls vrais compteurs d'install
// viennent de lib/installs.ts (state local réel de CET utilisateur), jamais inventés ici.

const SECTOR_ORDER: SectorSlug[] = SECTORS.slice().sort((a, b) => a.order - b.order).map((s) => s.slug);

export interface SkillFileSector {
  slug: SectorSlug;
  name: string;
  colorVar: string;
}

/** Secteur d'une fiche skill : dérivé du/des jobs du catalogue qui la référencent
 *  (un fichier peut être référencé par plusieurs jobs — on prend le premier trouvé,
 *  ordre catalogue, déterministe). `null` pour les fiches méta sans job (ex. skilltree-audit). */
export function sectorForSkillFile(slug: string): SkillFileSector | null {
  const job = CHART_JOBS.find((j) => (j.files ?? []).some((f) => f.slug === slug));
  if (!job) return null;
  const sector = SECTORS.find((s) => s.slug === job.sector);
  return sector ? { slug: sector.slug, name: sector.name, colorVar: sector.colorVar } : null;
}

/** Tri déterministe : secteur (ordre catalogue) puis slug alphabétique. Aucune aléa. */
function orderedSkillFiles(): SkillFile[] {
  return [...SKILL_FILES].sort((a, b) => {
    const sa = sectorForSkillFile(a.slug);
    const sb = sectorForSkillFile(b.slug);
    const ia = sa ? SECTOR_ORDER.indexOf(sa.slug) : SECTOR_ORDER.length;
    const ib = sb ? SECTOR_ORDER.indexOf(sb.slug) : SECTOR_ORDER.length;
    if (ia !== ib) return ia - ib;
    return a.slug.localeCompare(b.slug);
  });
}

/** ★ FEATURED THIS WEEK — pick déterministe : le 1er de la sélection ordonnée. */
export function featured(): SkillFile {
  return orderedSkillFiles()[0];
}

/** Fresh drops — 8 fiches suivantes dans la sélection ordonnée (jamais la featured en double). */
export function freshDrops(): SkillFile[] {
  return orderedSkillFiles().slice(1, 9);
}

/** Bandeau "NEXT DROP" — la fiche suivante dans l'ordre déterministe, pas encore dans
 *  Fresh drops. `null` si le catalogue est trop court (garde défensive). */
export function nextDrop(): SkillFile | null {
  return orderedSkillFiles()[9] ?? null;
}

export interface BuildLogPost {
  id: string;
  title: string;
  ageLabel: string;
  readTime: string;
  excerpt: string;
}

/** Build logs — posts de démo, prose FR neuve, explicitement étiquetés démo (D3 : aucun
 *  historique réel de publication n'existe côté perso — on ne simule pas un auteur tiers). */
export function buildLogs(): BuildLogPost[] {
  return [
    {
      id: "premier-skill-installe",
      title: "Ce que change vraiment le premier skill installé",
      ageLabel: "il y a 5 jours · démo",
      readTime: "3 min de lecture",
      excerpt:
        "Le déclic n'est pas technique : c'est le moment où tu arrêtes de faire la tâche à la main et où tu commences à relire un brouillon. Notes de mise en route, sans enjoliver.",
    },
    {
      id: "brain-avant-le-reste",
      title: "Pourquoi construire le Brain avant d'installer dix skills",
      ageLabel: "il y a 12 jours · démo",
      readTime: "4 min de lecture",
      excerpt:
        "Chaque skill lit le même dossier knowledge/ — le construire une fois évite de répéter le contexte à chaque agent. Retour d'expérience sur l'ordre qui aurait fait gagner une semaine.",
    },
  ];
}
