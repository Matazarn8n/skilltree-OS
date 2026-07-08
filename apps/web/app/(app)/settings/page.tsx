import { SettingsSection } from "@/components/settings/SettingsSection";
import { AvatarUploader } from "@/components/settings/AvatarUploader";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { LogoutButton } from "@/components/settings/LogoutButton";

export const metadata = { title: "SkillTree · Réglages" };

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <h1 className="display text-2xl text-[var(--text)]">Réglages</h1>

      <SettingsSection title="Compte" description="Ton profil et ton abonnement.">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <AvatarUploader />
            <div className="text-right text-sm">
              <p className="text-[var(--text-faint)]">Email</p>
              <p className="text-[var(--text)]">razel@nuveo.io</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[var(--border-soft)] px-4 py-3">
            <span className="text-sm text-[var(--text-muted)]">Plan</span>
            <span className="text-sm font-medium text-[var(--text)]">Membre · 47 $/mois</span>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Sécurité" description="Change ton mot de passe régulièrement.">
        <PasswordForm />
      </SettingsSection>

      <SettingsSection title="Facturation" description="Factures, moyen de paiement et abonnement.">
        <a
          href="#"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] px-4 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          Gérer la facturation sur Stripe
        </a>
      </SettingsSection>

      <SettingsSection title="Zone de danger" description="Termine ta session sur cet appareil.">
        <LogoutButton />
      </SettingsSection>
    </div>
  );
}
