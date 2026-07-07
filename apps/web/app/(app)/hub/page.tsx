import { FRESH_DROPS, MOST_INSTALLED, MODULES } from "@/lib/data";
import { SkillCard } from "@/components/skill/SkillCard";
import { ModuleCard } from "@/components/hub/ModuleCard";
import { FirstWeekChecklist } from "@/components/hub/FirstWeekChecklist";
import { CommunityPulse } from "@/components/hub/CommunityPulse";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "SkillTree · Hub" };

export default function HubPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-10">
      <header>
        <h1 className="display text-2xl leading-snug text-[var(--text)] md:text-3xl">
          13 skills en ligne · nouveaux drops cette semaine · reprends où tu t&apos;es arrêté
        </h1>
      </header>

      <section aria-labelledby="first-week-heading" className="flex flex-col gap-4">
        <h2 id="first-week-heading" className="text-lg font-semibold text-[var(--text)]">
          Ta première semaine, en cinq étapes
        </h2>
        <FirstWeekChecklist />
      </section>

      <section aria-labelledby="modules-heading" className="flex flex-col gap-4">
        <h2 id="modules-heading" className="text-lg font-semibold text-[var(--text)]">
          Modules
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => (
            <ModuleCard key={module.slug} module={module} />
          ))}
        </div>
      </section>

      <section aria-labelledby="drops-heading" className="flex flex-col gap-4">
        <h2 id="drops-heading" className="text-lg font-semibold text-[var(--text)]">
          Fresh drops
        </h2>
        {FRESH_DROPS.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FRESH_DROPS.map((skill) => (
              <SkillCard key={skill.slug} skill={skill} variant="drop" />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Aucun nouveau drop cette semaine"
            hint="Reviens bientôt : de nouveaux skills arrivent chaque semaine."
          />
        )}
      </section>

      <section aria-labelledby="installed-heading" className="flex flex-col gap-4">
        <h2 id="installed-heading" className="text-lg font-semibold text-[var(--text)]">
          Les plus installés
        </h2>
        {MOST_INSTALLED.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MOST_INSTALLED.map((skill) => (
              <SkillCard key={skill.slug} skill={skill} variant="compact" />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Pas encore de classement"
            hint="Installe un skill pour lancer le classement de ta communauté."
          />
        )}
      </section>

      <section aria-labelledby="pulse-heading" className="flex flex-col gap-4 pb-6">
        <h2 id="pulse-heading" className="text-lg font-semibold text-[var(--text)]">
          Pouls de la communauté
        </h2>
        <CommunityPulse />
      </section>
    </div>
  );
}
