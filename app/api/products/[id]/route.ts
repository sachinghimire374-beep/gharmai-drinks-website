import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";
import { productOut, stringifyArr } from "@/lib/serialize";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true, brand: true } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(productOut(product));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { adminId } = await requireAdmin("products");
    const body = await req.json();
    const data: any = {};
    for (const k of ["name", "slug", "description", "badge", "stock", "categoryId", "metaTitle", "metaDescription"]) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.compareAt !== undefined) data.compareAt = body.compareAt ? Number(body.compareAt) : null;
    if (body.images !== undefined) data.images = stringifyArr(body.images);
    if (body.tags !== undefined) data.tags = stringifyArr(body.tags);
    if (body.featured !== undefined) data.featured = !!body.featured;
    if (body.sponsored !== undefined) data.sponsored = !!body.sponsored;
    if (body.luxury !== undefined) data.luxury = !!body.luxury;
    if (body.brandId !== undefined) data.brandId = body.brandId || null;
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);
    if (body.active !== undefined) data.active = !!body.active;

    const product = await prisma.product.update({ where: { id }, data });
    await logActivity({ adminId, action: "UPDATE", entity: "Product", entityId: product.id, detail: product.name });
    return NextResponse.json(productOut(product));
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { adminId } = await requireAdmin("products");
    await prisma.product.delete({ where: { id } });
    await logActivity({ adminId, action: "DELETE", entity: "Product", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }
}
