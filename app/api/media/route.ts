import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// GET — list media library
export async function GET() {
  try {
    await requireAdmin("products");
    const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
    return NextResponse.json(media);
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Error" }, { status: 400 });
  }
}

// POST — upload. If Cloudinary env is set, uploads there; else saves to /public/uploads (dev).
export async function POST(req: NextRequest) {
  try {
    await requireAdmin("products");
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const type = file.type.startsWith("video") ? "video" : "image";

    // --- Cloudinary path ---
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const cloudinary = (await import("./cloudinary")).uploadToCloudinary;
      const result = await cloudinary(bytes, file.name);
      const asset = await prisma.mediaAsset.create({
        data: { url: result.secure_url, publicId: result.public_id, type, filename: file.name, bytes: file.size, width: result.width, height: result.height },
      });
      return NextResponse.json(asset, { status: 201 });
    }

    // --- Local dev fallback ---
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const safeName = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    await writeFile(path.join(uploadsDir, safeName), bytes);
    const asset = await prisma.mediaAsset.create({
      data: { url: `/uploads/${safeName}`, type, filename: file.name, bytes: file.size },
    });
    return NextResponse.json(asset, { status: 201 });
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Upload failed" }, { status: 400 });
  }
}
