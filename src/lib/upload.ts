import { put } from "@vercel/blob";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function extensionFor(type: string, fallbackName: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "image/jpeg" || type === "image/jpg") return "jpg";
  const fromName = fallbackName.split(".").pop()?.toLowerCase();
  if (fromName && ["png", "jpg", "jpeg", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  return "jpg";
}

function mimeFor(ext: string, type: string): string {
  if (type && type.startsWith("image/")) return type;
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "image/jpeg";
}

export async function saveUploadedImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("No image file provided");
  }
  if (!ALLOWED.has(file.type) && !file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed (JPG, PNG, WEBP)");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image must be under 5MB");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = extensionFor(file.type, file.name || "photo.jpg");
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const contentType = mimeFor(ext, file.type);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();

  if (blobToken) {
    const blob = await put(`uploads/${filename}`, bytes, {
      access: "public",
      contentType,
      token: blobToken,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  // Local/dev fallback only (Vercel must use Blob — data URLs cause lag + bandwidth)
  if (process.env.VERCEL) {
    throw new Error(
      "Image storage is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel."
    );
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), bytes);
  return `/uploads/${filename}`;
}

/** Upload a raw buffer (used when migrating old data-URL images). */
export async function saveImageBuffer(
  bytes: Buffer,
  contentType = "image/jpeg"
): Promise<string> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!blobToken) {
    throw new Error("BLOB_READ_WRITE_TOKEN missing");
  }
  const ext = extensionFor(contentType, "photo.jpg");
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const blob = await put(`uploads/${filename}`, bytes, {
    access: "public",
    contentType,
    token: blobToken,
    addRandomSuffix: false,
  });
  return blob.url;
}
