import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/banners/track  { id, type: "impression" | "click" }
// Public endpoint used by the storefront to record ad analytics.
export async function POST(req: NextRequest) {
  try {
    const { id, type } = await req.json();
    if (!id || !["impression", "click"].includes(type)) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    await prisma.bannerAd.update({
      where: { id },
      data: type === "click" ? { clicks: { increment: 1 } } : { impressions: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 }); // never break the UI
  }
}
