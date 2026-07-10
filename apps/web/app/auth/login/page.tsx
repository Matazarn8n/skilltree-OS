"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

// Écran d'authentification FR : email/mot de passe (connexion + création de compte) et lien magique.
// Réutilise les tokens de style du shell (aucune refonte visuelle).
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function withBusy(fn: () => Promise<void>) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur inattendue.");
    } finally {
      setBusy(false);
    }
  }

  const signIn = () =>
    withBusy(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/hub");
      router.refresh();
    });

  const signUp = () =>
    withBusy(async () => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      router.push("/hub");
      router.refresh();
    });

  const magicLink = () =>
    withBusy(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setMsg("Lien magique envoyé — vérifie ta boîte mail.");
    });

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6 py-10">
      <p className="text-xs uppercase tracking-widest text-[var(--text-faint)]">SkillTree</p>
      <h1 className="display mt-2 text-3xl text-[var(--text)]">Connexion</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Accède à ton arbre, ton Brain et tes skills installés.</p>

      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          signIn();
        }}
      >
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          Se connecter
        </Button>
      </form>

      <div className="mt-3 flex gap-2">
        <Button type="button" variant="soft" size="sm" className="flex-1" onClick={signUp} disabled={busy}>
          Créer un compte
        </Button>
        <Button type="button" variant="soft" size="sm" className="flex-1" onClick={magicLink} disabled={busy || !email}>
          Recevoir un lien magique
        </Button>
      </div>

      {msg && <p className="mt-4 text-sm text-[var(--text-muted)]" role="status">{msg}</p>}
    </main>
  );
}
