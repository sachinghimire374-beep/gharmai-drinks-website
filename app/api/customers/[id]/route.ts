import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAdmin("orders");
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { orders: { orderBy: { createdAt: "desc" }, include: { items: true } } },
    });
    if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(customer);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}

// PATCH — adjust VIP tier / reward points manually
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { adminId } = await requireAdmin("orders");
    const b = await req.json();
    const data: any = {};
    if (b.vipTier !== undefined) data.vipTier = b.vipTier;
    if (b.rewardPoints !== undefined) data.rewardPoints = Number(b.rewardPoints);
    const customer = await prisma.customer.update({ where: { id }, data });
    await logActivity({ adminId, action: "UPDATE", entity: "Customer", entityId: customer.id, detail: customer.name });
    return NextResponse.json(customer);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}
