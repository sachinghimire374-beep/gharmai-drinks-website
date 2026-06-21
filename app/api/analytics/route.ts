import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

// Aggregated dashboard stats: revenue, orders, top products, ad CTR.
export async function GET() {
  try {
    await requireAdmin("analytics");

    const [orderAgg, orderCount, customerCount, productCount, deliveredCount] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
    ]);

    // Top-selling products by quantity
    const topItems = await prisma.orderItem.groupBy({
      by: ["name"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    // Ad performance (CTR)
    const ads = await prisma.bannerAd.findMany({
      select: { id: true, title: true, placement: true, impressions: true, clicks: true },
      orderBy: { clicks: "desc" },
      take: 10,
    });
    const adStats = ads.map((a) => ({
      ...a,
      ctr: a.impressions > 0 ? Math.round((a.clicks / a.impressions) * 1000) / 10 : 0,
    }));

    // Revenue over last 7 days
    const since = new Date(Date.now() - 7 * 86400000);
    const recent = await prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    });

    return NextResponse.json({
      revenue: orderAgg._sum.total ?? 0,
      orderCount,
      deliveredCount,
      customerCount,
      productCount,
      topItems: topItems.map((t) => ({ name: t.name, qty: t._sum.quantity ?? 0 })),
      adStats,
      recentOrders: recent,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}
