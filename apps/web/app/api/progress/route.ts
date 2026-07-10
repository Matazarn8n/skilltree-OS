import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

// /api/progress — progression des leçons (RLS: user_id = auth.uid()).
//   GET  → { done: string[] }  (lesson_id des leçons terminées, hydrate useProgress)
//   POST → upsert { lessonId, status }

const Body = z.object({
  lessonId: z.string().min(1),
  status: z.enum(["locked", "in_progress", "done"]),
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
  const { data, error } = await supabase.from("progress").select("lesson_id").eq("status", "done");
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json({ done: (data ?? []).map((r) => r.lesson_id) });
}

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const { lessonId, status } = parsed.data;
  const { data, error } = await supabase
    .from("progress")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        status,
        completed_at: status === "done" ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,lesson_id" }
    )
    .select()
    .single();
  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });
  return NextResponse.json(data);
}
