import { SECTORS, SKILLS, skillBySlug } from "./data";
import type { Skill, Sector } from "./types";

/**
 * Couche d'accès données. Aujourd'hui : lit le catalogue seed en mémoire (runnable sans infra).
 * Demain : brancher Supabase (voir supabase/schema.sql). L'interface ne change pas — seul le corps.
 * ponytail: pas de client Supabase tant que le seed suffit à faire tourner l'app ; upgrade path ci-dessous.
 *
 * Pour passer en Postgres/Supabase : remplacer les corps par des requêtes
 *   `supabase.from('skills').select(...)` — signatures identiques, RLS gère le scoping user.
 */

export const isLiveDB = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

export async function getCatalog(): Promise<{ sectors: Sector[]; skills: Skill[] }> {
  // ponytail: cache implicite via RSC/fetch-less ; en prod ISR/unstable_cache sur cette fonction.
  return { sectors: SECTORS, skills: SKILLS };
}

export async function getSkill(slug: string): Promise<Skill | null> {
  return skillBySlug(slug) ?? null;
}

// "My tree" : sous-ensemble installé. Sans auth réelle -> heuristique démo (skills 'live' populaires).
// En prod : SELECT skill_id FROM user_skills WHERE user_id = auth.uid() (RLS).
export async function getMyTree(userId?: string): Promise<Skill[]> {
  void userId;
  return SKILLS.filter((s) => s.status === "live" && s.installCount > 30);
}
