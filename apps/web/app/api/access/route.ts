import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/access — { paid }. D8 : PERSONAL_MODE=true force paid:true (sans exiger de session).
// Sinon, lit users.paid de la session (401 si non authentifié).
export async function GET() {
  if (process.env.PERSONAL_MODE === "true") {
    return NextResponse.json({ paid: true, mode: "personal" });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data } = await supabase.from("users").select("paid").eq("id", user.id).single();
  return NextResponse.json({ paid: data?.paid ?? false });
}
