import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { Skill } from "@/lib/types";
import { sectorOf } from "@/lib/data";
import { AutonomyBadge } from "./AutonomyBadge";
import { Button } from "@/components/ui/Button";

// Carte skill réutilisable (Fresh drops, Les plus installés).
// Usage :
//   <SkillCard skill={skill} variant="drop" />     // secteur + "il y a N jours" + description complète
//   <SkillCard skill={skill} variant="compact" />  // repère rapide, sans description longue
const card = cva(
  "flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-4 transition-colors hover:border-[var(--accent)]/50",
  {
    variants: { variant: { drop: "", compact: "" } },
    defaultVariants: { variant: "compact" },
  }
);

export interface SkillCardProps extends VariantProps<typeof card> {
  skill: Skill;
}

export function SkillCard({ skill, variant }: SkillCardProps) {
  const sector = sectorOf(skill.sector);
  const showDays = variant === "drop" && skill.publishedDaysAgo !== undefined;

  return (
    <article className={card({ variant })} aria-label={`Skill ${skill.name}, secteur ${sector.name}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-widest" style={{ color: sector.colorVar }}>
          {sector.name}
        </span>
        {showDays && (
          <span className="text-[11px] text-[var(--text-faint)]">
            il y a {skill.publishedDaysAgo} jour{(skill.publishedDaysAgo as number) > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <h3 className="text-base font-semibold leading-snug text-[var(--text)]">
        <Link
          href={`/map?skill=${skill.slug}`}
          className="hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded-sm"
          aria-label={`Voir ${skill.name} sur la carte`}
        >
          {skill.name}
        </Link>
      </h3>

      <AutonomyBadge on={skill.autonomy} />

      {variant === "drop" && (
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">{skill.summary}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-[var(--text-faint)]">{skill.installCount} installs</span>
        <Button size="sm" variant={variant === "drop" ? "primary" : "soft"} aria-label={`Installer ${skill.name}`}>
          Installer
        </Button>
      </div>
    </article>
  );
}
