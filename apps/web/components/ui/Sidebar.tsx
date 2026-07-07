"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const NAV: { href: string; label: string; badge?: string }[] = [
  { href: "/map", label: "Carte" },
  { href: "/hub", label: "Hub", badge: "13" },
  { href: "/modules", label: "Modules" },
  { href: "/tree", label: "Mon arbre" },
  { href: "/brain", label: "Brain" },
  { href: "/community", label: "Communauté" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="flex h-dvh w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-elev)] px-4 py-5">
      <Link href="/map" className="display px-2 text-sm font-semibold tracking-[0.2em] text-[var(--text)]">
        SKILLTREE
      </Link>
      <p className="mt-6 px-2 text-[11px] uppercase tracking-widest text-[var(--text-faint)]">Espace de travail</p>
      <nav className="mt-2 flex flex-col gap-0.5" aria-label="Navigation principale">
        {NAV.map((item) => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[var(--bg-panel)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-panel)] hover:text-[var(--text)]"
              )}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-[var(--accent)]/15 px-1.5 text-[11px] text-[var(--accent)]">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-1 border-t border-[var(--border-soft)] pt-3">
        <ThemeToggle />
        <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-[var(--bg-panel)]">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)]/20 text-xs text-[var(--accent)]">RA</span>
          <span className="flex flex-col text-xs">
            <span className="text-[var(--text)]">Membre</span>
            <span className="text-[var(--text-faint)]">Réglages</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}
