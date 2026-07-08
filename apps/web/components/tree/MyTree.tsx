"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SKILLS } from "@/lib/catalog";
import { TreeAudit, useInstalledSlugs } from "./TreeAudit";
import { WeeklyDrops } from "./WeeklyDrops";

// Vue "Mon arbre" : connecter sa machine (commande factice + copier), stats de sync,
// drops de la semaine, puis l'audit (TreeAudit) — réactif aux installs locaux réels
// (contrat localStorage `skilltree.installs.v1`, cf. TreeAudit.tsx).

const SYNC_COMMAND = "npx github:skilltree-os/skilltree-cli sync";

export function MyTree() {
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState("—");
  const installedSlugs = useInstalledSlugs();

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(SYNC_COMMAND);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard indisponible (permissions, contexte non sécurisé…)
    }
  };

  const connect = () => {
    setConnected(true);
    setLastSync(
      new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    );
  };

  const stats: { label: string; value: string }[] = [
    { label: "Installés", value: `${installedSlugs.length} / ${SKILLS.length}` },
    { label: "Lancés", value: "0 / 0" },
    { label: "Série", value: "1 sem" },
    { label: "Membre depuis", value: connected ? lastSync : "—" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs uppercase tracking-widest text-[var(--text-faint)]">Mon arbre</p>
      <h1 className="display mt-2 text-3xl text-[var(--text)]">les skills que tu as installés</h1>

      <section className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-[var(--text)]">Connecte ta machine</h2>
          <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[11px] text-[var(--accent)]">nouveau</span>
        </div>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Une commande dans ton terminal installe tous les skills que tu possèdes déjà — et à partir de là,{" "}
          <code className="text-[var(--text)]">skilltree-cli sync</code> ramène chaque drop de la semaine directement
          dans Claude Code.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] px-3 py-2 text-xs text-[var(--text)]">
            {SYNC_COMMAND}
          </code>
          <Button
            type="button"
            variant="soft"
            size="sm"
            onClick={copyCommand}
            aria-label="Copier la commande de connexion"
          >
            {copied ? "Copié ✓" : "Copier"}
          </Button>
        </div>
        {!connected ? (
          <div className="mt-3">
            <Button type="button" size="sm" onClick={connect}>
              Générer ma commande de connexion
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-[var(--accent)]">Machine connectée — synchro planifiée chaque semaine.</p>
        )}
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4">
            <p className="text-[11px] uppercase tracking-widest text-[var(--text-faint)]">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--text)]">{s.value}</p>
          </div>
        ))}
      </section>

      <WeeklyDrops />

      <TreeAudit />
    </div>
  );
}
