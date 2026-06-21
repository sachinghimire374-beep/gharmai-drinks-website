// Minimal Cloudinary uploader using their REST API (no SDK dependency).
import crypto from "crypto";

export async function uploadToCloudinary(buffer: Buffer, filename: string) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME!;
  const key = process.env.CLOUDINARY_API_KEY!;
  const secret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary auto-optimizes; we request eager transformation for web delivery.
  const paramsToSign = `timestamp=${timestamp}`;
  const signature = crypto.createHash("sha1").update(paramsToSign + secret).digest("hex");

  const body = new FormData();
  body.append("file", new Blob([new Uint8Array(buffer)]), filename);
  body.append("api_key", key);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, { method: "POST", body });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  return res.json() as Promise<{ secure_url: string; public_id: string; width: number; height: number }>;
}
