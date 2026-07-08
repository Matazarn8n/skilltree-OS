"use client";
import { useState } from "react";

// GET STARTED — "Ta première semaine, en cinq étapes." Réécriture FR de la structure
// observée (captures/nav_hub.png) : progression X/5 + barre, étape 3 avec 3 chips skills
// colorés par secteur (ouvrent l'InstallModal via le même event que le Hub/CommandBar).
// État local uniquement (pas de persistance demandée par le plan) : fermable ✕, étapes
// cochables via un bouton "Fait".

interface Step {
  id: string;
  title: string;
  desc: string;
  doneByDefault: boolean;
  ctas?: { label: string; variant?: "primary" | "soft" }[];
}

const STEPS: Step[] = [
  {
    id: "tour",
    title: "Vois comment tout s'articule",
    desc: "Trois minutes sur ce que tu as débloqué : la carte, les modules, les nouveaux drops chaque semaine, et le Brain.",
    doneByDefault: true,
  },
  {
    id: "claude-code",
    title: "Installe Claude Code",
    desc: "Tes skills tournent dans Claude Code. Installe-le une fois et tout ce qui est sur la carte se branche dessus.",
    doneByDefault: false,
    ctas: [{ label: "Ouvrir le guide d'installation", variant: "primary" }, { label: "Je l'ai déjà", variant: "soft" }],
  },
  {
    id: "first-skill",
    title: "Installe ton premier skill",
    desc: "Choisis un skill de démarrage, installe-le, lance-le. C'est le moment où ton arbre commence à s'allumer.",
    doneByDefault: false,
  },
  {
    id: "stack",
    title: "Connecte Claude à ta stack",
    desc: "Une seule connexion (Notion, Gmail, ton CRM) transforme les skills de démos en vrai travail.",
    doneByDefault: true,
  },
  {
    id: "brain",
    title: "Démarre ton Brain",
    desc: "Le multiplicateur. Chaque skill que tu installes le lit — pour que tes agents connaissent tes offres, tes clients, ta voix.",
    doneByDefault: false,
    ctas: [{ label: "Ouvrir Build Your Brain", variant: "primary" }, { label: "Récupérer le CLAUDE.md de démarrage", variant: "soft" }],
  },
];

const STARTER_CHIPS = [
  { slug: "carousel-designer", label: "Concepteur de carrousels", color: "#A78BFA" },
  { slug: "cold-email-copywriter", label: "Rédacteur d'emails à froid", color: "#FACC15" },
  { slug: "knowledge-base", label: "Base de connaissance", color: "#5EEAD4" },
] as const;

function openInstall(slug: string) {
  window.dispatchEvent(new CustomEvent("skilltree:open-install", { detail: { slug } }));
}

export function FirstWeekChecklist() {
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState<Record<string, boolean>>(
    () => Object.fromEntries(STEPS.map((s) => [s.id, s.doneByDefault]))
  );

  if (!visible) return null;

  const doneCount = STEPS.filter((s) => done[s.id]).length;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)]">
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[var(--text-faint)]">Get started</p>
          <h3 className="display mt-1 text-lg text-[var(--text)]">Ta première semaine, en cinq étapes.</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--text)]">
            {doneCount}<span className="text-[var(--text-faint)]">/5</span>
          </span>
          <button
            onClick={() => setVisible(false)}
            aria-label="Fermer la checklist première semaine"
            className="grid h-7 w-7 place-items-center rounded-full text-[var(--text-faint)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mx-5 mt-3 h-1 overflow-hidden rounded-full bg-[var(--border-soft)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all"
          style={{ width: `${(doneCount / STEPS.length) * 100}%` }}
        />
      </div>

      <ol className="flex flex-col gap-3 p-5">
        {STEPS.map((step, i) => {
          const isDone = !!done[step.id];
          return (
            <li
              key={step.id}
              className="flex items-start gap-3 rounded-lg border border-[var(--border-soft)] px-4 py-3"
            >
              <span
                className={
                  "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs " +
                  (isDone
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-faint)]")
                }
                aria-hidden
              >
                {isDone ? "✓" : i + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text)]">{step.title}</p>
                <p className="mt-0.5 text-sm text-[var(--text-muted)]">{step.desc}</p>

                {step.id === "first-skill" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {STARTER_CHIPS.map((chip) => (
                      <button
                        key={chip.slug}
                        onClick={() => openInstall(chip.slug)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text)] hover:border-[var(--accent)]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: chip.color }} aria-hidden />
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}

                {step.ctas && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {step.ctas.map((cta) => (
                      <button
                        key={cta.label}
                        onClick={() => setDone((d) => ({ ...d, [step.id]: true }))}
                        className={
                          "h-8 rounded-lg px-3 text-xs font-medium " +
                          (cta.variant === "primary"
                            ? "bg-[var(--accent)] text-white hover:opacity-90"
                            : "border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)]")
                        }
                      >
                        {cta.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!step.ctas && step.id !== "first-skill" && (
                <button
                  onClick={() => setDone((d) => ({ ...d, [step.id]: !isDone }))}
                  className="shrink-0 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] disabled:opacity-60"
                  disabled={isDone}
                >
                  {isDone ? "Fait" : "Marquer fait"}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
