import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public list of top-level categories (used by storefront filters and admin product form).
export async function GET() {
  try {
    const cats = await prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
    return NextResponse.json(cats);
  } catch {
    return NextResponse.json([]);
  }
}
