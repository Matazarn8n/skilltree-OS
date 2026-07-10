import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/me — profil user (paid, plan) + agrégats de progression. Upsert la ligne
// users si absente (le trigger handle_new_user la crée au signup ; upsert = filet).
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Filet : garantit la ligne users (RLS: id = auth.uid()).
  await supabase.from("users").upsert({ id: user.id, email: user.email ?? "" }, { onConflict: "id" });

  const [{ data: me }, { count: installs }, { count: lessonsDone }] = await Promise.all([
    supabase.from("users").select("paid, plan").eq("id", user.id).single(),
    supabase.from("installs").select("*", { count: "exact", head: true }),
    supabase.from("progress").select("*", { count: "exact", head: true }).eq("status", "done"),
  ]);

  return NextResponse.json({
    id: user.id,
    email: user.email,
    paid: me?.paid ?? false,
    plan: me?.plan ?? "member",
    installs: installs ?? 0,
    lessonsDone: lessonsDone ?? 0,
  });
}
