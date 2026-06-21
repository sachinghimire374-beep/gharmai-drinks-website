import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireAdmin("orders");
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true, customer: true } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}

// PATCH — update status (Received → Preparing → Out for Delivery → Delivered)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { adminId } = await requireAdmin("orders");
    const { status } = await req.json();
    const order = await prisma.order.update({ where: { id }, data: { status } });
    await logActivity({ adminId, action: "STATUS", entity: "Order", entityId: order.id, detail: `${order.orderNumber} → ${status}` });
    return NextResponse.json(order);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}
