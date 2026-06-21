import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { adminId } = await requireAdmin("posts");
    const p = await req.json();
    const data: any = {};
    for (const k of ["title", "slug", "excerpt", "body", "coverImage", "status", "metaTitle", "metaDescription"]) {
      if (p[k] !== undefined) data[k] = p[k];
    }
    if (p.publishAt !== undefined) data.publishAt = p.publishAt ? new Date(p.publishAt) : null;
    const post = await prisma.post.update({ where: { id }, data });
    await logActivity({ adminId, action: "UPDATE", entity: "Post", entityId: post.id, detail: post.title });
    return NextResponse.json(post);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { adminId } = await requireAdmin("posts");
    await prisma.post.delete({ where: { id } });
    await logActivity({ adminId, action: "DELETE", entity: "Post", entityId: id });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
  }
}
