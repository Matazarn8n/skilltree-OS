import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { Skill } from "@/lib/types";
import { sectorOf } from "@/lib/catalog";
import { AutonomyBadge } from "./AutonomyBadge";
import { Button } from "@/components/ui/Button";

// Carte job réutilisable (Fresh drops, Les plus installés).
// Usage :
//   <SkillCard skill={job} variant="drop" />     // secteur + description complète
//   <SkillCard skill={job} variant="compact" />  // repère rapide, sans description longue
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

  return (
    <article className={card({ variant })} aria-label={`Job ${skill.name}, secteur ${sector.name}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-widest" style={{ color: sector.colorVar }}>
          {sector.name}
        </span>
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

      <AutonomyBadge on={skill.level === "autonomous"} />

      {variant === "drop" && (
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">{skill.desc}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <span className="text-xs text-[var(--text-faint)]">{skill.skills.length} compétence{skill.skills.length > 1 ? "s" : ""}</span>
        <Button size="sm" variant={variant === "drop" ? "primary" : "soft"} aria-label={`Installer ${skill.name}`}>
          Installer
        </Button>
      </div>
    </article>
  );
}
