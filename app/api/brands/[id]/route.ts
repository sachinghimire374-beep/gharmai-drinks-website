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
    for (const k of ["name", "logo", "bannerImage", "tagline", "description", "accent", "linkUrl"]) {
      if (b[k] !== undefined) data[k] = b[k];
    }
    if (b.featured !== undefined) data.featured = !!b.featured;
    if (b.active !== undefined) data.active = !!b.active;
    if (b.sortOrder !== undefined) data.sortOrder = Number(b.sortOrder);
    const brand = await prisma.brand.update({ where: { id }, data });
    await logActivity({ adminId, action: "UPDATE", entity: "Brand", entityId: brand.id, detail: brand.name });
    return NextResponse.json(brand);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { adminId } = await requireAdmin("ads");
    await prisma.brand.delete({ where: { id } });
    await logActivity({ adminId, action: "DELETE", entity: "Brand", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to delete (brand may have products)" }, { status: 400 });
  }
}
