import { CommunityFeed } from "@/components/community/CommunityFeed";

export const metadata = { title: "SkillTree · Communauté" };

export default function CommunityPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <header>
        <h1 className="display text-2xl text-[var(--text)]">Communauté</h1>
        <p className="mt-1 text-sm text-[var(--text-faint)]">La cohorte fondatrice · échanges entre les 100 premiers</p>
      </header>

      <div
        className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-5 py-4"
        role="note"
        aria-label="Message de bienvenue"
      >
        <p className="text-sm text-[var(--text)]">
          Bienvenue ! Tu fais partie des <strong>100 premiers</strong> — voici la pièce où tout se passe.
        </p>
      </div>

      <CommunityFeed />
    </div>
  );
}
