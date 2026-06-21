import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";

// GET /api/banners — public: only ads that are active AND within their schedule window.
// ?placement=HERO  ·  ?admin=1 returns everything (admin list)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placement = searchParams.get("placement");
  const isAdmin = searchParams.get("admin") === "1";

  if (isAdmin) {
    await requireAdmin("ads").catch(() => null);
    const all = await prisma.bannerAd.findMany({ orderBy: [{ priority: "desc" }, { createdAt: "desc" }] });
    return NextResponse.json(all);
  }

  const now = new Date();
  const banners = await prisma.bannerAd.findMany({
    where: {
      active: true,
      ...(placement ? { placement: placement as any } : {}),
      AND: [
        { OR: [{ startAt: null }, { startAt: { lte: now } }] },
        { OR: [{ endAt: null }, { endAt: { gte: now } }] },
      ],
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(banners);
}

// POST /api/banners — admin create
export async function POST(req: NextRequest) {
  try {
    const { adminId } = await requireAdmin("ads");
    const b = await req.json();
    const banner = await prisma.bannerAd.create({
      data: {
        title: b.title,
        headline: b.headline ?? null,
        subtext: b.subtext ?? null,
        buttonLabel: b.buttonLabel ?? null,
        linkUrl: b.linkUrl ?? null,
        mediaUrl: b.mediaUrl ?? null,
        mediaType: b.mediaType ?? "image",
        placement: b.placement,
        audience: b.audience ?? "ALL",
        priority: Number(b.priority ?? 0),
        startAt: b.startAt ? new Date(b.startAt) : null,
        endAt: b.endAt ? new Date(b.endAt) : null,
        active: b.active ?? true,
        frequency: b.frequency ?? null,
      },
    });
    await logActivity({ adminId, action: "CREATE", entity: "BannerAd", entityId: banner.id, detail: `${banner.placement}: ${banner.title}` });
    return NextResponse.json(banner, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to create banner" }, { status: 400 });
  }
}
