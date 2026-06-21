import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/promotions/validate  { code, subtotal }
// Public — used at checkout to validate a coupon and compute the discount.
export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();
  const promo = await prisma.promotion.findUnique({ where: { code: String(code).toUpperCase().trim() } });

  if (!promo || !promo.active) return NextResponse.json({ valid: false, reason: "Invalid code" });

  const now = new Date();
  if (promo.startAt && promo.startAt > now) return NextResponse.json({ valid: false, reason: "Not started yet" });
  if (promo.endAt && promo.endAt < now) return NextResponse.json({ valid: false, reason: "Expired" });
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) return NextResponse.json({ valid: false, reason: "Usage limit reached" });
  if (subtotal < promo.minOrder) return NextResponse.json({ valid: false, reason: `Minimum order Rs. ${promo.minOrder}` });

  let discount = 0;
  if (promo.type === "PERCENT") discount = Math.round((subtotal * promo.value) / 100);
  else if (promo.type === "FIXED") discount = promo.value;
  // BOGO is handled at cart level; we just confirm validity here.

  return NextResponse.json({
    valid: true,
    code: promo.code,
    type: promo.type,
    discount: Math.min(discount, subtotal),
    description: promo.description,
  });
}
