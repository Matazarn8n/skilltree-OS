"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => { setLight(document.documentElement.classList.contains("light")); }, []);
  const toggle = () => {
    const next = !light;
    setLight(next);
    document.documentElement.classList.toggle("light", next);
    try { localStorage.setItem("theme", next ? "light" : "dark"); } catch {}
  };
  return (
    <button
      onClick={toggle}
      aria-pressed={light}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)] transition-colors"
    >
      <span aria-hidden>{light ? "☀" : "☾"}</span>
      {light ? "Mode clair" : "Mode sombre"}
    </button>
  );
}
