import { Sidebar } from "@/components/ui/Sidebar";
import { CommandBar } from "@/components/ui/CommandBar";
import { getAllSkillFiles } from "@/lib/skill-files";

// Server Component : seul point qui lit content/skills/*.md (fs), une fois par requête/
// build. Le résultat (JSON sérialisable) descend en props vers CommandBar (client) —
// jamais d'import direct de lib/skill-files.ts depuis un composant "use client".
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const skillFiles = getAllSkillFiles();
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[var(--border)] px-6">
          <CommandBar skillFiles={skillFiles} />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
