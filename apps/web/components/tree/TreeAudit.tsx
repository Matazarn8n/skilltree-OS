"use client";
import { SKILLS, skillBySlug } from "@/lib/catalog";
import { useInstalls } from "@/lib/installs";

// Re-couplage Phase 4 : les installs viennent désormais de la SOURCE UNIQUE useInstalls()
// (Postgres via /api/install, RLS auth.uid()) — plus du localStorage brut. Signature de
// useInstalledSlugs inchangée (MyTree la consomme telle quelle), seule la source change ;
// la réactivité N→N+1 sans reload est assurée par le re-render du hook.
export function useInstalledSlugs(): string[] {
  return useInstalls().installed;
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
