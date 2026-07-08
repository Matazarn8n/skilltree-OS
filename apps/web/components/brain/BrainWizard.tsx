"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/lesson/ProgressBar";
import { cn } from "@/lib/utils";
import {
  BRAIN_SECTIONS,
  draftBrain,
  firstUnfilledIndex,
  loadBrainMap,
  useBrain,
  type BrainMap,
} from "@/lib/brain";
import { BrainIntake } from "./BrainIntake";
import { BrainSection } from "./BrainSection";

// Machine à états du wizard Brain : intake → section(0..7) → done.
// - "intake" : écran d'entrée (BrainIntake), deux chemins IA/manuel.
// - number   : index de section affichée (une question par écran, fidèle à
//              captures/dynamic/brain_section_1..8.png : eyebrow "<LABEL> X/8").
// - "done"   : les 8 sections sont renseignées, récap + reprise possible.
type Stage = "intake" | number | "done";

export function BrainWizard() {
  const brain = useBrain();
  const [stage, setStage] = useState<Stage>("intake");
  const [draft, setDraft] = useState("");
  const initialized = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restaure un brouillon existant au montage. Lecture DIRECTE (loadBrainMap, pas
  // le hook) pour éviter la course avec l'hydratation asynchrone de useBrain() :
  // brouillon vide → intake ; brouillon non vide → reprend à la 1re section vide
  // (ou "done" si les 8 sont déjà remplies).
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const map = loadBrainMap();
    if (Object.keys(map).length === 0) {
      setStage("intake");
      return;
    }
    const idx = firstUnfilledIndex(map);
    setStage(idx === -1 ? "done" : idx);
  }, []);

  const sectionIndex = typeof stage === "number" ? stage : null;
  const section = sectionIndex !== null ? BRAIN_SECTIONS[sectionIndex] : null;
  const entry = section ? brain.read(section.key) : null;

  // Recharge la valeur locale de l'éditeur à chaque changement de section (ou de
  // contenu persisté pour cette section — ex. après un draft IA).
  useEffect(() => {
    if (section && entry) setDraft(entry.content);
  }, [section?.key, entry?.content]);

  // A11y : focus sur l'éditeur à chaque arrivée sur une section (une question/écran).
  useEffect(() => {
    if (sectionIndex !== null) textareaRef.current?.focus();
  }, [sectionIndex]);

  const startManual = () => setStage(0);

  const startWithAI = (url: string, notes: string) => {
    const drafted = draftBrain({ url, notes });
    brain.saveAll(drafted, "ai");
    setStage(0);
  };

  const goBack = () => {
    if (sectionIndex === null || !section) return;
    brain.save(section.key, draft, entry?.source ?? "manual");
    setStage(sectionIndex === 0 ? "intake" : sectionIndex - 1);
  };

  const goContinue = () => {
    if (sectionIndex === null || !section || !draft.trim()) return;
    brain.save(section.key, draft, entry?.source ?? "manual");
    setStage(sectionIndex === BRAIN_SECTIONS.length - 1 ? "done" : sectionIndex + 1);
  };

  const jumpTo = (index: number) => setStage(index);

  const restart = () => {
    brain.reset();
    setStage("intake");
  };

  const pct =
    sectionIndex !== null
      ? ((sectionIndex + 1) / BRAIN_SECTIONS.length) * 100
      : stage === "done"
        ? 100
        : 0;

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-[var(--text-faint)]">Brain</p>
      <h1 className="display mt-2 text-3xl text-[var(--text)]">
        Une interview de 10 minutes l&apos;écrit pour toi
      </h1>

      {stage === "intake" && <BrainIntake onManual={startManual} onDraft={startWithAI} />}

      {section && (
        <div className="mt-8">
          <ProgressBar value={pct} label="Progression du brain" size="sm" />
          <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-widest text-[var(--text-faint)]">
            <span data-testid="brain-eyebrow">{section.eyebrow}</span>
            <span data-testid="brain-step">
              {sectionIndex! + 1} / {BRAIN_SECTIONS.length}
            </span>
          </div>

          <BrainSection
            section={section}
            value={draft}
            source={entry?.source ?? "manual"}
            onChange={setDraft}
            inputRef={textareaRef}
          />

          <div className="mt-5 flex items-center justify-between gap-3">
            <Button type="button" variant="soft" onClick={goBack}>
              Retour
            </Button>
            <Button type="button" onClick={goContinue} disabled={!draft.trim()}>
              Continuer →
            </Button>
          </div>

          <p className="mt-4 text-xs text-[var(--text-faint)]">
            Sauvegardé au fil de l&apos;eau. C&apos;est la base que chaque skill vient lire. Toi
            seul la vois.
          </p>
        </div>
      )}

      {stage === "done" && <BrainDone map={brain.all()} onJump={jumpTo} onRestart={restart} />}
    </div>
  );
}

function BrainDone({
  map,
  onJump,
  onRestart,
}: {
  map: BrainMap;
  onJump: (index: number) => void;
  onRestart: () => void;
}) {
  return (
    <div className="mt-8">
      <p className="text-sm text-[var(--text-muted)]">
        Les 8 sections sont renseignées. Chaque skill peut maintenant lire ce brain.
      </p>
      <ul className="mt-5 divide-y divide-[var(--border-soft)] rounded-xl border border-[var(--border)]">
        {BRAIN_SECTIONS.map((s, i) => {
          const e = map[s.key];
          return (
            <li key={s.key} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text)]">{s.label}</p>
                <p className="mt-0.5 truncate text-xs text-[var(--text-faint)]">{e?.content || "—"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px]",
                    e?.source === "ai" ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "bg-[var(--bg-elev)] text-[var(--text-faint)]"
                  )}
                >
                  {e?.source === "ai" ? "IA" : "Manuel"}
                </span>
                <button
                  type="button"
                  onClick={() => onJump(i)}
                  className="text-xs text-[var(--text-faint)] hover:text-[var(--text)]"
                >
                  Modifier
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <Button type="button" variant="soft" className="mt-5" onClick={onRestart}>
        Recommencer
      </Button>
    </div>
  );
}
