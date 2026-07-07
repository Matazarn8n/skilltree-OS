import type { CommunityPost } from "@/lib/community-data";

export function PostCard({ author, initials, timeAgo, content, reactions }: CommunityPost) {
  return (
    <article className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] p-4">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--accent)]/20 text-xs font-medium text-[var(--accent)]"
        aria-hidden="true"
      >
        {initials}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-[var(--text)]">{author}</span>
          <span className="text-xs text-[var(--text-faint)]">{timeAgo}</span>
        </div>
        <p className="text-sm text-[var(--text-muted)]">{content}</p>
        <span className="text-xs text-[var(--text-faint)]">
          {reactions} réaction{reactions > 1 ? "s" : ""}
        </span>
      </div>
    </article>
  );
}
