import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3470";
  const routes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];
  try {
    const posts = await prisma.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } });
    posts.forEach((p) => routes.push({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 }));
  } catch {}
  return routes;
}
