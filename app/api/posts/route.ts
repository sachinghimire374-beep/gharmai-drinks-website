import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { logActivity } from "@/lib/activity";

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// GET — public returns PUBLISHED only; ?admin=1 returns all
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("admin") === "1") {
    try {
      await requireAdmin("posts");
      const all = await prisma.post.findMany({ orderBy: { createdAt: "desc" }, include: { author: true } });
      return NextResponse.json(all);
    } catch (e) {
      if (e instanceof Response) return e;
    }
  }
  const now = new Date();
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
    orderBy: { publishAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  try {
    const { adminId } = await requireAdmin("posts");
    const p = await req.json();
    const post = await prisma.post.create({
      data: {
        title: p.title,
        slug: p.slug || slugify(p.title),
        excerpt: p.excerpt ?? "",
        body: p.body ?? "",
        coverImage: p.coverImage ?? null,
        status: p.status ?? "DRAFT",
        publishAt: p.publishAt ? new Date(p.publishAt) : null,
        metaTitle: p.metaTitle ?? null,
        metaDescription: p.metaDescription ?? null,
        authorId: adminId,
      },
    });
    await logActivity({ adminId, action: "CREATE", entity: "Post", entityId: post.id, detail: post.title });
    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Failed to create post" }, { status: 400 });
  }
}
