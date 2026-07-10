import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

// /api/tree — niveau d'automatisation par job (tree_state, RLS: user_id = auth.uid()).
//   GET  → { states: { jobId, level }[] }
//   POST → upsert { jobId, level }
// Le catalogue des jobs reste servi par /api/catalog (statique, 0-DB) — non dupliqué ici.

const Body = z.object({
  jobId: z.string().min(1),
  level: z.enum(["none", "manual", "assisted", "autonomous"]),
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
  const { data, error } = await supabase.from("tree_state").select("job_id, level");
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ states: (data ?? []).map((r) => ({ jobId: r.job_id, level: r.level })) });
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const { data, error } = await supabase
    .from("tree_state")
    .upsert(
      { user_id: user.id, job_id: parsed.data.jobId, level: parsed.data.level, updated_at: new Date().toISOString() },
      { onConflict: "user_id,job_id" }
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json(data);
}
