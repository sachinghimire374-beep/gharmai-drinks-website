import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  try {
    await requireAdmin("orders");
    const customers = await prisma.customer.findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    return NextResponse.json(customers);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}
