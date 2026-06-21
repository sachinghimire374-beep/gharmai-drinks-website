import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { adminId } = await requireAdmin("ads");
    const p = await req.json();
    const data: any = {};
    for (const k of ["description", "type"]) if (p[k] !== undefined) data[k] = p[k];
    if (p.code !== undefined) data.code = String(p.code).toUpperCase().trim();
    if (p.value !== undefined) data.value = Number(p.value);
    if (p.minOrder !== undefined) data.minOrder = Number(p.minOrder);
    if (p.usageLimit !== undefined) data.usageLimit = p.usageLimit ? Number(p.usageLimit) : null;
    if (p.active !== undefined) data.active = !!p.active;
    if (p.startAt !== undefined) data.startAt = p.startAt ? new Date(p.startAt) : null;
    if (p.endAt !== undefined) data.endAt = p.endAt ? new Date(p.endAt) : null;
    const promo = await prisma.promotion.update({ where: { id }, data });
    await logActivity({ adminId, action: "UPDATE", entity: "Promotion", entityId: promo.id, detail: promo.code });
    return NextResponse.json(promo);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { adminId } = await requireAdmin("ads");
    await prisma.promotion.delete({ where: { id } });
    await logActivity({ adminId, action: "DELETE", entity: "Promotion", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }
}
