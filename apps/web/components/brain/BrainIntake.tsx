"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

// Écran d'entrée du wizard Brain (fidèle à captures/dynamic/brain_initial.png) :
// deux chemins vers les 8 sections — laisser l'IA rédiger un premier jet à partir
// de l'URL + notes libres, ou tout écrire soi-même. Les deux mènent au même wizard.
export function BrainIntake({
  onManual,
  onDraft,
}: {
  onManual: () => void;
  onDraft: (url: string, notes: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-6">
      <h2 className="text-xl font-semibold text-[var(--text)]">Laisse l&apos;IA rédiger ton brain.</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
        Dépose l&apos;URL de ton site et raconte ton activité en quelques lignes — offres, clients,
        ton style. On rédige les huit sections, tu n&apos;as plus qu&apos;à relire et ajuster. Deux
        minutes plutôt que dix.
      </p>

      <label className="mt-6 block text-xs uppercase tracking-widest text-[var(--text-faint)]" htmlFor="brain-intake-url">
        Ton site
      </label>
      <input
        id="brain-intake-url"
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="altari.ai"
        className="mt-2 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] px-3 py-2 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />

      <label className="mt-4 block text-xs uppercase tracking-widest text-[var(--text-faint)]" htmlFor="brain-intake-notes">
        Ce que ton site ne dit pas
      </label>
      <textarea
        id="brain-intake-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Tarifs, clients préférés, ton style, outils que tu utilises…"
        className="mt-2 w-full resize-y rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] px-3 py-2 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" variant="soft" onClick={onManual}>
          Je l&apos;écris moi-même
        </Button>
        <Button type="button" onClick={() => onDraft(url, notes)}>
          Rédiger ma base avec l&apos;IA →
        </Button>
      </div>

      <p className="mt-4 text-xs text-[var(--text-faint)]">
        5 rédactions IA par mois et par membre. Rien n&apos;est sauvegardé avant ta relecture — les
        écrans suivants sont ta passe d&apos;édition.
      </p>
    </div>
  );
}
