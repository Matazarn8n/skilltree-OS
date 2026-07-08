import type { BuildLogPost } from "@/lib/hub-data";

export interface BuildLogsProps {
  posts: BuildLogPost[];
}

// "Build logs" — posts de démo (lib/hub-data.ts#buildLogs), prose FR neuve, explicitement
// étiquetés "démo" en en-tête (D3 : aucun auteur/historique réel n'existe côté perso).
export function BuildLogs({ posts }: BuildLogsProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-4">
      <p className="text-[11px] uppercase tracking-widest text-[var(--text-faint)]">Notes de démo</p>
      {posts.map((post) => (
        <article key={post.id} className="border-t border-[var(--border-soft)] pt-3 first:border-t-0 first:pt-0">
          <h3 className="text-sm font-semibold text-[var(--text)]">{post.title}</h3>
          <p className="mt-0.5 text-xs text-[var(--text-faint)]">
            {post.ageLabel} · {post.readTime}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
