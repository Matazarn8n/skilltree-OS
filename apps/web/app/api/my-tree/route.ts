import { NextResponse } from "next/server";
import { getMyTree } from "@/lib/db";
import { SkillDTO } from "@/lib/contracts";
import { z } from "zod";

// GET /api/my-tree — skills installés de l'utilisateur (démo : sous-ensemble ; prod : RLS auth.uid()).
export async function GET() {
  const skills = await getMyTree();
  return NextResponse.json({ skills: z.array(SkillDTO).parse(skills), count: skills.length });
}
