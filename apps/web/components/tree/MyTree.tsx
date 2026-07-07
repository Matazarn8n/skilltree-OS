"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SKILLS } from "@/lib/catalog";

// Vue "Mon arbre" : connecter sa machine (commande factice + copier), stats de sync,
// puis un audit simulé qui dérive un sous-ensemble déterministe de SKILLS ("installés").

const SYNC_COMMAND = "git clone https://github.com/skilltree-os/tree-sync.git && ./tree-sync/install.sh";

type AuditState = "idle" | "loading" | "done";

// Détection déterministe (pas de Math.random, pas de compteur d'installs inventé) :
// les jobs déjà autonomes (niveau réel du catalogue) simulent ce qui serait détecté
// sur la machine connectée, triés par nom pour un ordre stable.
function detectInstalled() {
  return SKILLS.filter((s) => s.level === "autonomous").sort((a, b) => a.name.localeCompare(b.name));
}

export function MyTree() {
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState("—");
  const [auditState, setAuditState] = useState<AuditState>("idle");

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

  const runAudit = () => {
    setAuditState("loading");
    window.setTimeout(() => setAuditState("done"), 1200);
  };

  const detected = auditState === "done" ? detectInstalled() : [];

  const stats: { label: string; value: string }[] = [
    { label: "Skills installés", value: auditState === "done" ? String(detected.length) : "0" },
    { label: "Drops", value: "0" },
    { label: "Fréquence sync", value: "1 sem" },
    { label: "Dernière sync", value: connected ? lastSync : "—" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs uppercase tracking-widest text-[var(--text-faint)]">Mon arbre</p>
      <h1 className="display mt-2 text-3xl text-[var(--text)]">Ce que tu as déjà construit, calculé pour toi.</h1>

      <section className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
        <h2 className="text-sm font-medium text-[var(--text)]">Connecte ta machine</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Synchronise chaque skill que tu possèdes déjà.</p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-lg border border-[var(--border-soft)] bg-[var(--bg-elev)] px-3 py-2 text-xs text-[var(--text)]">
            {SYNC_COMMAND}
          </code>
          <Button type="button" variant="soft" size="sm" onClick={copyCommand}>
            {copied ? "Copié ✓" : "Copier"}
          </Button>
        </div>
        {!connected ? (
          <div className="mt-3">
            <Button type="button" size="sm" onClick={connect}>
              Marquer ma machine comme connectée
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-[var(--accent)]">Machine connectée — synchro planifiée chaque semaine.</p>
        )}
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-panel)] p-4">
            <p className="text-2xl font-semibold text-[var(--text)]">{s.value}</p>
            <p className="mt-1 text-xs text-[var(--text-faint)]">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-medium text-[var(--text)]">SkillTree Audit — ton arbre, calculé</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Scanne ta machine connectée et détecte les skills déjà en place.
            </p>
          </div>
          <Button type="button" size="sm" onClick={runAudit} disabled={auditState === "loading"} aria-busy={auditState === "loading"}>
            {auditState === "loading" ? "Calcul en cours…" : "Lancer l'audit"}
          </Button>
        </div>

        {auditState === "idle" && (
          <p className="mt-4 text-sm text-[var(--text-faint)]">Aucun audit lancé pour l&apos;instant.</p>
        )}
        {auditState === "loading" && (
          <p className="mt-4 text-sm text-[var(--text-faint)]" role="status">
            Analyse de ton arbre en cours…
          </p>
        )}
        {auditState === "done" &&
          (detected.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--text-faint)]">Aucun skill détecté sur cette machine.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--border-soft)]">
              {detected.map((s) => (
                <li key={s.slug} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[var(--text)]">{s.name}</span>
                  <span className="text-xs text-[var(--text-faint)]">Autonome</span>
                </li>
              ))}
            </ul>
          ))}
      </section>

      <div className="mt-6">
        <Link href="/hub" className="text-sm text-[var(--accent)] hover:underline">
          Parcourir les drops de la semaine →
        </Link>
      </div>
    </div>
  );
}
