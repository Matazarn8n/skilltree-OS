import { NextResponse } from "next/server";
import { getSkill } from "@/lib/db";
import { SkillDTO } from "@/lib/contracts";

// GET /api/skills/:slug — détail d'un skill.
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const skill = await getSkill(slug);
  if (!skill) return NextResponse.json({ error: "skill_not_found", code: "SKILL_404" }, { status: 404 });
  return NextResponse.json(SkillDTO.parse(skill));
}
