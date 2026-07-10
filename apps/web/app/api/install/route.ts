import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

// /api/install — installs d'un user (RLS: user_id = auth.uid()).
//   GET    → { installed: string[] }  (hydrate useInstalls)
//   POST   → installe { slug } (upsert idempotent)
//   DELETE → désinstalle { slug }

const Body = z.object({ slug: z.string().min(1) });

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
  const { data, error } = await supabase.from("installs").select("skill_slug");
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ installed: (data ?? []).map((r) => r.skill_slug) });
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const { error } = await supabase
    .from("installs")
    .upsert({ user_id: user.id, skill_slug: parsed.data.slug }, { onConflict: "user_id,skill_slug" });
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const { data } = await supabase.from("installs").select("skill_slug");
  return NextResponse.json({ installed: (data ?? []).map((r) => r.skill_slug) });
}

export async function DELETE(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const { error } = await supabase
    .from("installs")
    .delete()
    .eq("user_id", user.id)
    .eq("skill_slug", parsed.data.slug);
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const { data } = await supabase.from("installs").select("skill_slug");
  return NextResponse.json({ installed: (data ?? []).map((r) => r.skill_slug) });
}
