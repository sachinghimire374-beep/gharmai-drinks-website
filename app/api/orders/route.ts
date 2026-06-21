import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

// GET /api/orders — admin list with ?status= filter
export async function GET(req: NextRequest) {
  try {
    await requireAdmin("orders");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const orders = await prisma.order.findMany({
      where: status ? { status: status as any } : {},
      include: { items: true, customer: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json(orders);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}

// POST /api/orders — public: create an order (called at checkout, before WhatsApp handoff)
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const orderNumber = "GD-" + Date.now().toString(36).toUpperCase();

    // Upsert customer by phone, accumulate reward points (1 pt / Rs.100)
    let customerId: string | undefined;
    if (b.phone) {
      const customer = await prisma.customer.upsert({
        where: { phone: b.phone },
        update: { name: b.customerName, rewardPoints: { increment: Math.floor(b.total / 100) } },
        create: { name: b.customerName, phone: b.phone, email: b.email ?? null, rewardPoints: Math.floor(b.total / 100) },
      });
      customerId = customer.id;
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: b.customerName,
        phone: b.phone,
        address: b.address,
        mapsLink: b.mapsLink ?? null,
        notes: b.notes ?? null,
        subtotal: Number(b.subtotal),
        deliveryFee: Number(b.deliveryFee ?? 0),
        discount: Number(b.discount ?? 0),
        total: Number(b.total),
        couponCode: b.couponCode ?? null,
        whatsappLog: b.whatsappLog ?? null,
        customerId,
        items: {
          create: (b.items ?? []).map((i: any) => ({
            productId: i.productId ?? null,
            name: i.name,
            price: Number(i.price),
            quantity: Number(i.quantity),
          })),
        },
      },
      include: { items: true },
    });

    // Increment coupon usage if one was applied
    if (b.couponCode) {
      await prisma.promotion.updateMany({ where: { code: b.couponCode }, data: { usageCount: { increment: 1 } } });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 400 });
  }
}
