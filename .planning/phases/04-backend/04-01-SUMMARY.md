# 04-01 SUMMARY — Schéma + RLS + Auth (BACK-01)

**Statut : DONE + PROUVÉ + POUSSÉ** (commits `ad1a6f7` cœur schéma/RLS, `acce328` clients+auth).

## Livré
- `supabase/schema.sql` = ARCHITECTURE §5 : 6 tables (`users, progress, installs, brain, tree_state, onboarding`) + 5 enums (`lesson_status, brain_section, brain_source, job_level, onboarding_path`). RLS activé sur les 6, policies `user_id = auth.uid()` (users : `id = auth.uid()`). Trigger `handle_new_user` → crée la ligne `users` au signup. Aucune table catalogue (D4). Appliqué au Supabase local (`docker exec … psql < schema.sql`).
- Clients : `lib/supabase/server.ts` (`createServerClient` cookies/RLS + `createServiceClient` SERVER-ONLY, throw côté client/clé absente), `lib/supabase/client.ts` (`createBrowserClient`), `middleware.ts` (refresh session cookies → persistance reload).
- Auth FR : `app/auth/login/page.tsx` (email/pw `signInWithPassword`+`signUp`, magic link `signInWithOtp`), `callback/route.ts` (`exchangeCodeForSession`), `signout/route.ts`.
- `.env.example` committé (clés sans valeur, dont HERMES gateway via X-Internal-Token). `.env.local` peuplé (SUPABASE_URL/anon/service_role SERVER-ONLY, PERSONAL_MODE=true, HERMES_GATEWAY_URL, HERMES_INTERNAL_TOKEN copié depuis `~/hermes-proxy/config/.env`) — **gitignoré, non committé**.

## Preuve d'isolation (contre-preuve RLS)
`supabase/tests/rls_isolation.mjs` → PASS : service-role voit la ligne de A sur les 5 tables ; client B authentifié voit 0 ligne de A. **Contre-preuve observée** : `alter table installs disable row level security` → le test vire ROUGE (B voit la ligne de A) → réactivé. Un PASS n'est possible QUE si le RLS masque A à B. Preuve `orchestration/verify/p6/rls-isolation.txt`.

## Notes
- `supabase/config.toml` : `[analytics] enabled=false` (vector échoue sur docker.sock de cet hôte). `[auth.email] enable_confirmations=false` (signup testable sans lien mail — vérifié : signup GoTrue renvoie un `access_token`).
- 04-02 upsert/lit les lignes `users` via les clients posés ici. Valeurs URL/keys locales NON committées.
