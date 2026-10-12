/** Max upload accepted from the user (bytes). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/**
 * Compress/resize an image in the browser for fast uploads & pages.
 * Target ~800KB JPEG so pages stay light on Vercel.
 */
export async function prepareImageForUpload(
  file: File,
  opts?: { maxBytes?: number; maxEdge?: number; quality?: number }
): Promise<File> {
  const maxBytes = opts?.maxBytes ?? MAX_UPLOAD_BYTES;
  const maxEdge = opts?.maxEdge ?? 1800;
  const quality = opts?.quality ?? 0.82;
  const targetBytes = opts?.maxBytes
    ? Math.min(opts.maxBytes, 900_000)
    : 850_000;

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }
  if (file.size > maxBytes) {
    throw new Error("Image must be under 5MB");
  }

  if (file.size <= targetBytes && file.type === "image/jpeg") {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let q = quality;
  let blob: Blob | null = null;
  for (let i = 0; i < 8; i++) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", q)
    );
    if (!blob) break;
    if (blob.size <= targetBytes) break;
    q -= 0.08;
  }

  if (!blob) return file;

  const name = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
