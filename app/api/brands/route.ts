import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// GET — public returns active featured brands; ?admin=1 returns all
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("admin") === "1") {
    try {
      await requireAdmin("ads");
      const all = await prisma.brand.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
      return NextResponse.json(all);
    } catch (e) {
      if (e instanceof Response) return e;
    }
  }
  const brands = await prisma.brand.findMany({
    where: { active: true, featured: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(brands);
}

// POST — admin create
export async function POST(req: NextRequest) {
  try {
    const { adminId } = await requireAdmin("ads");
    const b = await req.json();
    const brand = await prisma.brand.create({
      data: {
        name: b.name,
        slug: b.slug || slugify(b.name) + "-" + Math.random().toString(36).slice(2, 5),
        logo: b.logo ?? null,
        bannerImage: b.bannerImage ?? null,
        tagline: b.tagline ?? null,
        description: b.description ?? "",
        accent: b.accent || "#D4AF37",
        linkUrl: b.linkUrl ?? null,
        featured: b.featured ?? true,
        sortOrder: Number(b.sortOrder ?? 0),
        active: b.active ?? true,
      },
    });
    await logActivity({ adminId, action: "CREATE", entity: "Brand", entityId: brand.id, detail: brand.name });
    return NextResponse.json(brand, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to create brand" }, { status: 400 });
  }
}
