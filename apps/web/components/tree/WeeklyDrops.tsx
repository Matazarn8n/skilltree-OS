import Link from "next/link";
import { FRESH_DROPS } from "@/lib/catalog";
import { SkillCard } from "@/components/skill/SkillCard";
import { EmptyState } from "@/components/ui/EmptyState";

// Bandeau "Drops de la semaine" — réutilise la même sélection déterministe que le Hub
// (FRESH_DROPS, apps/web/lib/catalog/index.ts). Aucun compteur inventé : tant que P6
// (state user réel) n'existe pas, FRESH_DROPS reste vide et l'état vide est affiché
// honnêtement (cf. commentaire de lib/catalog/index.ts).
export function WeeklyDrops() {
  return (
    <section
      className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-5"
      aria-labelledby="weekly-drops-heading"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="weekly-drops-heading" className="text-sm font-medium text-[var(--text)]">
          Drops de la semaine
        </h2>
        <Link href="/hub" className="text-xs text-[var(--accent)] hover:underline">
          Voir tout →
        </Link>
      </div>

      {FRESH_DROPS.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {FRESH_DROPS.map((skill) => (
            <SkillCard key={skill.slug} skill={skill} variant="drop" />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState
            title="Aucun nouveau drop cette semaine"
            hint="Reviens bientôt : de nouveaux skills arrivent chaque semaine."
          />
        </div>
      )}
    </section>
  );
}
