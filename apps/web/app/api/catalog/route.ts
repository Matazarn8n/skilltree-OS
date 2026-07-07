import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/db";
import { CatalogResponse } from "@/lib/contracts";

// GET /api/catalog — secteurs + skills (lu souvent, change peu -> caché 5 min).
export const revalidate = 300;

export async function GET() {
  try {
    const data = await getCatalog();
    const payload = CatalogResponse.parse(data); // garantit le contrat en sortie
    return NextResponse.json(payload, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch (e) {
    return NextResponse.json({ error: "catalog_unavailable", code: "CATALOG_500" }, { status: 500 });
  }
}
