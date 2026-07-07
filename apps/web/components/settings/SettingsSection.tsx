import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-6">
      <div className="mb-5 flex flex-col gap-1">
        <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}
