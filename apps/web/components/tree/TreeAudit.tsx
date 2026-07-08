"use client";
import { useEffect, useState } from "react";
import { SKILLS, skillBySlug } from "@/lib/catalog";

// Contrat localStorage PARTAGÉ avec le Hub (03-01, apps/web/lib/installs.ts) — voir NOTE
// frontmatter du plan 03-04. Ce module ne fait QUE lire ce contrat (clé + event), il
// n'IMPORTE PAS lib/installs.ts et ne l'écrit jamais : les installs réels sont posés par
// le Hub, ce plan les consomme via ce helper local, clone du style de lib/progress.ts.
const INSTALLS_KEY = "skilltree.installs.v1";
const INSTALLS_EVENT = "skilltree:installs";

type InstallMap = Record<string, true>;

function readInstalls(): InstallMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(INSTALLS_KEY) ?? "{}") as InstallMap;
  } catch {
    return {};
  }
}

/**
 * Helper LOCAL à ce plan : lit `localStorage['skilltree.installs.v1']` + écoute l'event
 * `skilltree:installs` (même onglet) et l'event natif `storage` (autre onglet). Se
 * re-rend dès qu'un skill est installé, sans reload — c'est ce qui rend le TreeAudit
 * réactif (compteur N→N+1).
 */
export function useInstalledSlugs(): string[] {
  const [map, setMap] = useState<InstallMap>({});

  useEffect(() => {
    setMap(readInstalls());
    const onChange = () => setMap(readInstalls());
    window.addEventListener(INSTALLS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(INSTALLS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return Object.keys(map);
}

// Fallback existant (avant ce plan) : jobs autonomes du catalogue, simulant ce qui serait
// détecté sur une machine déjà équipée. Gardé comme section DISTINCTE et étiquetée — ne
// se mélange jamais au compteur d'installs réels (pas de chiffre inventé, cf. contraintes).
function detectAutonomous() {
  return SKILLS.filter((s) => s.level === "autonomous").sort((a, b) => a.name.localeCompare(b.name));
}

export function TreeAudit() {
  const installedSlugs = useInstalledSlugs();
  const installedSkills = installedSlugs
    .map((slug) => skillBySlug(slug))
    .filter((s): s is NonNullable<ReturnType<typeof skillBySlug>> => Boolean(s));
  const autonomous = detectAutonomous();

  return (
    <section
      className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-5"
      aria-labelledby="tree-audit-heading"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 id="tree-audit-heading" className="text-sm font-medium text-[var(--text)]">
            SkillTree Audit — ton arbre, calculé
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]" data-testid="tree-audit-count">
            {installedSlugs.length === 0
              ? "Rien d'installé pour l'instant. Installe un skill depuis le Hub pour le voir apparaître ici."
              : `${installedSlugs.length} skill${installedSlugs.length > 1 ? "s" : ""} installé${
                  installedSlugs.length > 1 ? "s" : ""
                }, calculé depuis ta machine connectée.`}
          </p>
        </div>
      </div>

      {installedSkills.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-faint)]">Aucun skill installé sur cette machine.</p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--border-soft)]">
          {installedSkills.map((s) => (
            <li key={s.slug} className="flex items-center justify-between py-2 text-sm">
              <span className="text-[var(--text)]">{s.name}</span>
              <span className="text-xs text-[var(--accent)]">Installé</span>
            </li>
          ))}
        </ul>
      )}

      {autonomous.length > 0 && (
        <div className="mt-5 border-t border-[var(--border-soft)] pt-4">
          <p className="text-xs uppercase tracking-wide text-[var(--text-faint)]">
            Déjà détecté sur la machine (autonome)
          </p>
          <ul className="mt-2 divide-y divide-[var(--border-soft)]">
            {autonomous.map((s) => (
              <li key={s.slug} className="flex items-center justify-between py-2 text-sm">
                <span className="text-[var(--text)]">{s.name}</span>
                <span className="text-xs text-[var(--text-faint)]">Autonome</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
