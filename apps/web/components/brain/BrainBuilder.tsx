"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Constructeur de base de connaissance (Brain) : intake (URL + notes libres) → rédaction
// simulée par IA → 8 sections éditables. Persisté en localStorage (pas de backend requis).

type Stage = "idle" | "drafting" | "ready";

const SECTION_LABELS = [
  "Activité",
  "Offres",
  "Clients cibles",
  "Positionnement",
  "Ton de voix",
  "Preuves",
  "Process",
  "Ressources",
] as const;

type SectionKey = (typeof SECTION_LABELS)[number];
type Sections = Record<SectionKey, string>;

function emptySections(): Sections {
  const acc = {} as Sections;
  for (const label of SECTION_LABELS) acc[label] = "";
  return acc;
}

const STORAGE_KEY = "skilltree.brain.v1";

function draftFor(label: SectionKey, url: string, notes: string): string {
  const site = url.trim() || "ton site";
  const pitch = notes.trim() || "ce que tu fais au quotidien";
  const copy: Sections = {
    "Activité": `Brouillon à partir de ${site} : ${pitch}. À préciser : marché, taille d'équipe, ancienneté.`,
    "Offres": `Tes offres principales et leur prix — point de départ déduit de : « ${pitch} ».`,
    "Clients cibles": `Profil client déduit de tes notes : qui achète, pourquoi maintenant, budget type.`,
    "Positionnement": `Ce qui te différencie de la concurrence, en une phrase claire.`,
    "Ton de voix": `Direct, concret, sans jargon — ajuste si ce n'est pas ton style habituel.`,
    "Preuves": `Cas clients, chiffres et témoignages à lister ici.`,
    "Process": `Les étapes types d'une mission ou d'une vente, du premier contact à la livraison.`,
    "Ressources": `Liens vers docs, deck et site (${site}) que tes agents pourront citer.`,
  };
  return copy[label];
}

function draftAll(url: string, notes: string): Sections {
  const acc = {} as Sections;
  for (const label of SECTION_LABELS) acc[label] = draftFor(label, url, notes);
  return acc;
}

export function BrainBuilder() {
  const [stage, setStage] = useState<Stage>("idle");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [sections, setSections] = useState<Sections>(emptySections());

  // Restaure un brouillon existant.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { stage?: Stage; sections?: Partial<Sections> };
      if (parsed.stage === "ready") {
        setStage("ready");
        setSections({ ...emptySections(), ...parsed.sections });
      }
    } catch {
      // brouillon illisible : on repart de l'intake
    }
  }, []);

  useEffect(() => {
    if (stage !== "ready") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stage, sections }));
    } catch {
      // stockage indisponible (mode privé…) : on continue sans persister
    }
  }, [stage, sections]);

  const startManual = () => setStage("ready");

  const startDraft = () => {
    setStage("drafting");
    window.setTimeout(() => {
      setSections(draftAll(url, notes));
      setStage("ready");
    }, 1400);
  };

  const reset = () => {
    setStage("idle");
    setSections(emptySections());
    setUrl("");
    setNotes("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // rien à faire
    }
  };

  const filledCount = SECTION_LABELS.filter((l) => sections[l].trim().length > 0).length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs uppercase tracking-widest text-[var(--text-faint)]">Brain</p>
      <h1 className="display mt-2 text-3xl text-[var(--text)]">Laisse l&apos;IA rédiger ton brain.</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
        Dépose l&apos;URL de ton site et raconte ton activité en quelques lignes — offres, clients, ton ton.
        SkillTree rédige les huit sections, tu n&apos;as plus qu&apos;à relire et corriger.
      </p>

      {stage !== "ready" && (
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
          <label className="block text-xs uppercase tracking-widest text-[var(--text-faint)]" htmlFor="brain-url">
            Ton site
          </label>
          <input
            id="brain-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ton-site.com"
            disabled={stage === "drafting"}
            className="mt-2 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] px-3 py-2 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50"
          />

          <label className="mt-4 block text-xs uppercase tracking-widest text-[var(--text-faint)]" htmlFor="brain-notes">
            Raconte ton activité
          </label>
          <textarea
            id="brain-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Offres, clients, ton ton…"
            disabled={stage === "drafting"}
            className="mt-2 w-full resize-y rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] px-3 py-2 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50"
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" variant="soft" onClick={startManual} disabled={stage === "drafting"}>
              Je le tape moi-même
            </Button>
            <Button type="button" onClick={startDraft} disabled={stage === "drafting"} aria-busy={stage === "drafting"}>
              {stage === "drafting" ? "Rédaction en cours…" : "Rédiger ma base avec l'IA"}
            </Button>
          </div>
        </div>
      )}

      {stage === "ready" && (
        <div className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Base de connaissance — Brain</h2>
              <p className="mt-1 text-xs text-[var(--text-faint)]">
                {filledCount} / {SECTION_LABELS.length} sections rédigées
              </p>
            </div>
            <button onClick={reset} className="shrink-0 text-sm text-[var(--text-faint)] hover:text-[var(--text)]">
              Recommencer
            </button>
          </div>

          {filledCount === 0 && (
            <p className="mt-6 rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--text-faint)]">
              Aucune section rédigée pour l&apos;instant — remplis-les une à une ci-dessous.
            </p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {SECTION_LABELS.map((label) => (
              <BrainSectionCard
                key={label}
                label={label}
                value={sections[label]}
                onChange={(v) => setSections((s) => ({ ...s, [label]: v }))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BrainSectionCard({
  label,
  value,
  onChange,
}: {
  label: SectionKey;
  value: string;
  onChange: (value: string) => void;
}) {
  const filled = value.trim().length > 0;
  const fieldId = `brain-section-${label}`;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-4">
      <div className="flex items-center justify-between">
        <label htmlFor={fieldId} className="text-sm font-medium text-[var(--text)]">
          {label}
        </label>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px]",
            filled ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-[var(--bg-elev)] text-[var(--text-faint)]"
          )}
        >
          {filled ? "Rédigé" : "Vide"}
        </span>
      </div>
      <textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder={`Décris : ${label.toLowerCase()}…`}
        className="mt-3 w-full resize-y rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] p-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />
    </div>
  );
}
