import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";

export async function GET() {
  try {
    await requireAdmin("ads");
    const promos = await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(promos);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { adminId } = await requireAdmin("ads");
    const p = await req.json();
    const promo = await prisma.promotion.create({
      data: {
        code: String(p.code).toUpperCase().trim(),
        description: p.description ?? "",
        type: p.type ?? "PERCENT",
        value: Number(p.value),
        minOrder: Number(p.minOrder ?? 0),
        bogoBuyQty: p.bogoBuyQty ? Number(p.bogoBuyQty) : null,
        bogoGetQty: p.bogoGetQty ? Number(p.bogoGetQty) : null,
        usageLimit: p.usageLimit ? Number(p.usageLimit) : null,
        perUserLimit: p.perUserLimit ? Number(p.perUserLimit) : null,
        startAt: p.startAt ? new Date(p.startAt) : null,
        endAt: p.endAt ? new Date(p.endAt) : null,
        active: p.active ?? true,
      },
    });
    await logActivity({ adminId, action: "CREATE", entity: "Promotion", entityId: promo.id, detail: promo.code });
    return NextResponse.json(promo, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to create promotion (code may already exist)" }, { status: 400 });
  }
}
