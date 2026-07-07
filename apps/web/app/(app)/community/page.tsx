import { CommunityFeed } from "@/components/community/CommunityFeed";

export const metadata = { title: "SkillTree · Communauté" };

export default function CommunityPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] px-5 py-4">
        <p className="text-sm text-[var(--text)]">
          Bienvenue ! Tu fais partie des <strong>100 premiers</strong> — voici la pièce où tout se passe.
        </p>
      </div>
      <CommunityFeed />
    </div>
  );
}
