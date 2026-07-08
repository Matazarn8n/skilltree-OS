import { MODULES, SKILL_FILES } from "@/lib/catalog";
import { ModuleCard } from "@/components/hub/ModuleCard";
import { FirstWeekChecklist } from "@/components/hub/FirstWeekChecklist";
import { FeaturedThisWeek } from "@/components/hub/FeaturedThisWeek";
import { FreshDrops } from "@/components/hub/FreshDrops";
import { MostInstalled } from "@/components/hub/MostInstalled";
import { CommunityPulse } from "@/components/hub/CommunityPulse";
import { BuildLogs } from "@/components/hub/BuildLogs";
import { featured, freshDrops, nextDrop, buildLogs } from "@/lib/hub-data";
import { getAllSkillFiles } from "@/lib/skill-files";

export const metadata = { title: "SkillTree · Hub" };

export default function HubPage() {
  const skillFiles = getAllSkillFiles();
  const featuredSkill = skillFiles[featured().slug];
  const nextDropSkill = nextDrop();
  const dropSkills = freshDrops().map((d) => skillFiles[d.slug]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10">
      <header>
        <h1 className="display text-2xl leading-snug text-[var(--text)] md:text-3xl">
          {SKILL_FILES.length} skills en ligne · nouveaux drops cette semaine · reprends où tu t&apos;es arrêté
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

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="drops-heading" className="flex flex-col gap-4">
          <h2 id="drops-heading" className="text-lg font-semibold text-[var(--text)]">
            Fresh drops · Featured this week
          </h2>
          <FeaturedThisWeek
            skill={featuredSkill}
            nextDrop={nextDropSkill ? skillFiles[nextDropSkill.slug] : null}
          />
          <FreshDrops drops={dropSkills} />
        </section>

        <aside className="flex flex-col gap-8">
          <section aria-labelledby="installed-heading" className="flex flex-col gap-4">
            <h3 id="installed-heading" className="text-base font-semibold text-[var(--text)]">
              Les plus installés
            </h3>
            <MostInstalled skillFiles={skillFiles} />
          </section>

          <section aria-labelledby="pulse-heading" className="flex flex-col gap-4">
            <h3 id="pulse-heading" className="text-base font-semibold text-[var(--text)]">
              Pouls de la communauté
            </h3>
            <CommunityPulse />
          </section>

          <section aria-labelledby="logs-heading" className="flex flex-col gap-4 pb-6">
            <h3 id="logs-heading" className="text-base font-semibold text-[var(--text)]">
              Build logs
            </h3>
            <BuildLogs posts={buildLogs()} />
          </section>
        </aside>
      </div>

      <footer className="border-t border-[var(--border-soft)] pt-4 text-center text-xs text-[var(--text-faint)]">
        SkillTree Hub · reconstruction perso. De nouveaux skills arrivent chaque semaine.
      </footer>
    </div>
  );
}
