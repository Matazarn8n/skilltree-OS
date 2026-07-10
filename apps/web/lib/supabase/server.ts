import { createServerClient as createSSRClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Clients Supabase server-side (routes /api, Server Components).
// - createServerClient() : client par-requête, lié aux cookies de session → RLS applique auth.uid().
// - createServiceClient() : client service-role, BYPASS RLS. SERVER-ONLY (jamais NEXT_PUBLIC_,
//   throw si la clé manque). À réserver aux tâches d'admin (webhooks, back-office) — pas aux routes user.

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client scopé à la session de l'utilisateur (cookies). RLS s'applique. */
export async function createServerClient() {
  const cookieStore = await cookies();
  return createSSRClient(SUPABASE_URL, ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component (cookies en lecture seule) — le refresh
          // de session est assuré par le middleware, on peut ignorer ici.
        }
      },
    },
  });
}

/** Client service-role (BYPASS RLS). SERVER-ONLY. Throw si la clé absente ou côté client. */
export function createServiceClient() {
  if (typeof window !== "undefined") {
    throw new Error("createServiceClient() est SERVER-ONLY — jamais côté navigateur.");
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquant (server-only).");
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
