import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

// /api/brain — les 8 sections du Brain (RLS: user_id = auth.uid()).
//   GET → { company:{content,source}, ... }  (défaut vide pour les sections absentes)
//   PUT → upsert { section, content, source }

const SECTIONS = ["company", "offer", "customers", "voice", "ops", "stack", "goals", "constraints"] as const;

const Body = z.object({
  section: z.enum(SECTIONS),
  content: z.string(),
  source: z.enum(["ai", "manual"]),
});

async function requireUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabase.from("brain").select("section, content, source");
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const map: Record<string, { content: string; source: string }> = {};
  for (const row of data ?? []) map[row.section] = { content: row.content, source: row.source };
  return NextResponse.json(map);
}

export async function PUT(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const { section, content, source } = parsed.data;
  const { data, error } = await supabase
    .from("brain")
    .upsert(
      { user_id: user.id, section, content, source, updated_at: new Date().toISOString() },
      { onConflict: "user_id,section" }
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json(data);
}
