import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

// /api/onboarding — état d'onboarding (RLS: user_id = auth.uid()). Endpoint DB prêt ;
// le câblage UI complet arrive en Phase 5.
//   GET  → { path, step, done }
//   POST → upsert { path?, step?, done? }

const Body = z.object({
  path: z.enum(["agency", "business", "company", "exploring"]).optional(),
  step: z.number().int().min(0).optional(),
  done: z.boolean().optional(),
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
  const { data } = await supabase.from("onboarding").select("path, step, done").eq("user_id", user.id).maybeSingle();
  return NextResponse.json(data ?? { path: null, step: 0, done: false });
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const { data, error } = await supabase
    .from("onboarding")
    .upsert({ user_id: user.id, ...parsed.data }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json(data);
}
