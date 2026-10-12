/**
 * Migrate data: URL images in SiteSetting + Product.images to Vercel Blob.
 * Run: node --env-file=.env scripts/migrate-data-urls-to-blob.mjs
 */
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();
const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN required");
  process.exit(1);
}

function parseDataUrl(value) {
  const m = value.match(/^data:([^;]+);base64,(.+)$/s);
  if (!m) return null;
  return { contentType: m[1], bytes: Buffer.from(m[2], "base64") };
}

async function toBlob(dataUrl, label) {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return dataUrl;
  const ext =
    parsed.contentType.includes("png")
      ? "png"
      : parsed.contentType.includes("webp")
        ? "webp"
        : "jpg";
  const filename = `migrated/${Date.now()}-${randomBytes(3).toString("hex")}.${ext}`;
  const blob = await put(filename, parsed.bytes, {
    access: "public",
    contentType: parsed.contentType,
    token,
    addRandomSuffix: false,
  });
  console.log(
    "OK",
    label,
    "bytes=" + parsed.bytes.length,
    "->",
    blob.url.slice(0, 60) + "..."
  );
  return blob.url;
}

async function main() {
  const settings = await prisma.siteSetting.findMany();
  for (const row of settings) {
    if (!row.value.startsWith("data:")) continue;
    const url = await toBlob(row.value, "setting:" + row.key);
    await prisma.siteSetting.update({
      where: { key: row.key },
      data: { value: url },
    });
  }

  const products = await prisma.product.findMany();
  for (const p of products) {
    let images;
    try {
      images = JSON.parse(p.images);
    } catch {
      continue;
    }
    if (!Array.isArray(images)) continue;
    let changed = false;
    const next = [];
    for (let i = 0; i < images.length; i++) {
      const src = String(images[i] || "");
      if (src.startsWith("data:")) {
        next.push(await toBlob(src, `product:${p.slug}[${i}]`));
        changed = true;
      } else {
        next.push(src);
      }
    }
    if (changed) {
      await prisma.product.update({
        where: { id: p.id },
        data: { images: JSON.stringify(next) },
      });
    }
  }

  console.log("Migration complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
