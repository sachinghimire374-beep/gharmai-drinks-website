import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { adminId } = await requireAdmin("ads");
    const b = await req.json();
    const data: any = {};
    for (const k of ["title", "headline", "subtext", "buttonLabel", "linkUrl", "mediaUrl", "mediaType", "placement", "audience", "frequency"]) {
      if (b[k] !== undefined) data[k] = b[k];
    }
    if (b.priority !== undefined) data.priority = Number(b.priority);
    if (b.active !== undefined) data.active = !!b.active;
    if (b.startAt !== undefined) data.startAt = b.startAt ? new Date(b.startAt) : null;
    if (b.endAt !== undefined) data.endAt = b.endAt ? new Date(b.endAt) : null;
    const banner = await prisma.bannerAd.update({ where: { id }, data });
    await logActivity({ adminId, action: "UPDATE", entity: "BannerAd", entityId: banner.id, detail: banner.title });
    return NextResponse.json(banner);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { adminId } = await requireAdmin("ads");
    await prisma.bannerAd.delete({ where: { id } });
    await logActivity({ adminId, action: "DELETE", entity: "BannerAd", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }
}
