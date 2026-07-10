import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

// POST /api/brain/draft — SEUL point LLM du produit. Relaie via la gateway HERMES :8765
// (header X-Internal-Token UNIQUEMENT — la gateway détient l'OAuth ; ZÉRO clé Anthropic ici).
// Gated paid (403), rate-limit par user (429), 502 si la gateway échoue (JAMAIS de fallback gabarit).

const SECTION_KEYS = ["company", "offer", "customers", "voice", "ops", "stack", "goals", "constraints"] as const;
type SectionKey = (typeof SECTION_KEYS)[number];

const Body = z.object({ url: z.string().optional(), notes: z.string().optional() });

// Rate-limit en mémoire process (Map<userId, timestamps[]>), fenêtre glissante 5 drafts / 10 min.
// ponytail: store process-local — upgrade multi-tenant = Redis/DB si plusieurs instances.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_DRAFTS = 5;
const hits = new Map<string, number[]>();

function rateLimited(userId: string): boolean {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_DRAFTS) {
    hits.set(userId, recent);
    return true;
  }
  recent.push(now);
  hits.set(userId, recent);
  return false;
}

function buildPrompt(input: { url?: string; notes?: string }): string {
  const url = input.url?.trim() || "(non fourni)";
  const notes = input.notes?.trim() || "(non fournies)";
  return `Tu aides un entrepreneur à rédiger le "Brain" de son entreprise : 8 sections courtes en français.
Site : ${url}
Notes : ${notes}

Rédige un brouillon concret et spécifique pour CHACUNE des 8 sections ci-dessous (2-4 phrases,
en français, sans méta-commentaire). Réponds EXACTEMENT dans ce format, une section par bloc :

[company] ...
[offer] ...
[customers] ...
[voice] ...
[ops] ...
[stack] ...
[goals] ...
[constraints] ...`;
}

function parseSections(text: string): Record<SectionKey, string> {
  const out = Object.fromEntries(SECTION_KEYS.map((k) => [k, ""])) as Record<SectionKey, string>;
  // Découpe sur les marqueurs [key]. Robuste aux retours à la ligne et à l'ordre.
  const re = /\[(company|offer|customers|voice|ops|stack|goals|constraints)\]\s*([\s\S]*?)(?=\n?\[(?:company|offer|customers|voice|ops|stack|goals|constraints)\]|$)/gi;
  let matched = false;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    matched = true;
    out[m[1].toLowerCase() as SectionKey] = m[2].trim();
  }
  // Fallback si le modèle n'a pas suivi le format : tout le texte dans company (jamais un gabarit inventé).
  if (!matched) out.company = text.trim();
  return out;
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Gating paid (PERSONAL_MODE force paid côté /api/access ; ici on lit users.paid, forcé si perso).
  const paid =
    process.env.PERSONAL_MODE === "true" ||
    (await supabase.from("users").select("paid").eq("id", user.id).single()).data?.paid === true;
  if (!paid) return NextResponse.json({ error: "payment_required" }, { status: 403 });

  if (rateLimited(user.id)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const gatewayUrl = process.env.HERMES_GATEWAY_URL;
  const token = process.env.HERMES_INTERNAL_TOKEN;
  if (!gatewayUrl || !token) return NextResponse.json({ error: "draft_upstream" }, { status: 502 });

  let res: Response;
  try {
    res = await fetch(`${gatewayUrl}/api/llm/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Internal-Token": token },
      body: JSON.stringify({
        prompt: buildPrompt(parsed.data),
        model: "balanced",
        max_tokens: 1200,
        source: "skilltree-brain-draft",
      }),
    });
  } catch {
    return NextResponse.json({ error: "draft_upstream" }, { status: 502 });
  }
  if (!res.ok) return NextResponse.json({ error: "draft_upstream" }, { status: 502 });

  const data = (await res.json().catch(() => null)) as { text?: string } | null;
  if (!data?.text) return NextResponse.json({ error: "draft_upstream" }, { status: 502 });

  return NextResponse.json(parseSections(data.text));
}
