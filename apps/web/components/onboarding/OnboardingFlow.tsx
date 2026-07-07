"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { TourTooltip } from "./TourTooltip";

// Orchestre l'onboarding : modale de motivation → tour guidé 6 étapes → CTA de sortie.
// Simplifié (pas de widget Cal.com) : un stepper d'overlay qui avance de 1 à 6.

type Motive = "agency" | "build-for-me" | "bring-ai-in" | "exploring";
type Phase = "welcome" | "tour" | "reveal";

const MOTIVES: { id: Motive; label: string }[] = [
  { id: "agency", label: "Lancer / faire grandir une agence IA" },
  { id: "build-for-me", label: "Faire construire de l'IA pour mon business" },
  { id: "bring-ai-in", label: "Amener l'IA dans mon entreprise" },
  { id: "exploring", label: "J'explore" },
];

const TOUR_STEPS: { title: string; body: string }[] = [
  {
    title: "La carte",
    body: "Chaque secteur est un hub lumineux. Clique dessus pour explorer les skills qu'il contient.",
  },
  {
    title: "Ouvre un métier",
    body: "Un clic sur un nœud ouvre le détail : ce que fait le skill, et comment le construire.",
  },
  {
    title: "C'est le skill",
    body: "Chaque skill vient avec un guide de build pas-à-pas et du code prêt à copier.",
  },
  {
    title: "Ton Brain",
    body: "Construis la base que tous tes skills viennent lire — une seule fois, réutilisée partout.",
  },
  {
    title: "Mon arbre",
    body: "Connecte ta machine pour que SkillTree calcule automatiquement ce que tu as déjà installé.",
  },
  {
    title: "Les drops",
    body: "Chaque semaine, de nouveaux skills apparaissent. Installe-les en un clic depuis le Hub.",
  },
];

export function OnboardingFlow() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [motive, setMotive] = useState<Motive | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (phase !== "welcome") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPhase("reveal");
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const chooseMotive = (id: Motive) => {
    setMotive(id);
    setPhase("tour");
    setStep(1);
  };

  const nextStep = () => {
    if (step >= TOUR_STEPS.length) {
      setPhase("reveal");
      return;
    }
    setStep((s) => s + 1);
  };

  if (phase === "welcome") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-welcome-title"
          className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-6 shadow-2xl"
        >
          <h2 id="onboarding-welcome-title" className="display text-xl text-[var(--text)]">
            Bienvenue sur SkillTree
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">Qu&apos;est-ce qui t&apos;amène ?</p>
          <div className="mt-5 flex flex-col gap-2">
            {MOTIVES.map((m) => (
              <button
                key={m.id}
                autoFocus={m === MOTIVES[0]}
                onClick={() => chooseMotive(m.id)}
                className={cn(
                  "rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] px-4 py-3 text-left text-sm text-[var(--text)]",
                  "transition-colors hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "tour") {
    const current = TOUR_STEPS[step - 1];
    return (
      <TourTooltip
        step={step}
        total={TOUR_STEPS.length}
        title={current.title}
        body={current.body}
        onSkip={() => setPhase("reveal")}
        onNext={nextStep}
        nextLabel={step === TOUR_STEPS.length ? "Terminer" : "Suivant"}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-reveal-title"
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-6 text-center shadow-2xl"
      >
        <p className="text-xs uppercase tracking-widest text-[var(--text-faint)]">
          {motive ? "C'est parti" : "Bienvenue"}
        </p>
        <h2 id="onboarding-reveal-title" className="display mt-2 text-xl text-[var(--text)]">
          Tu es en train de construire ce que les entreprises paient 5 000 à 15 000 $.
        </h2>
        <div className="mt-6">
          <Button type="button" onClick={() => router.push("/map")}>
            Montre-moi le chemin agence →
          </Button>
        </div>
      </div>
    </div>
  );
}
