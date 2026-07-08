import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

// slug simple (titres de section FR courts, sans accents dans ce module).
function headingId(title: string) {
  return `settings-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-heading`;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  const id = headingId(title);
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-6" aria-labelledby={id}>
      <div className="mb-5 flex flex-col gap-1">
        <h2 id={id} className="text-base font-semibold text-[var(--text)]">
          {title}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}
