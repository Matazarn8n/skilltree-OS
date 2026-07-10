import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Déconnexion : détruit la session Supabase puis renvoie vers l'écran de login.
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${new URL(request.url).origin}/auth/login`, { status: 303 });
}
