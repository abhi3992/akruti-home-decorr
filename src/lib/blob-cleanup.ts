import { del, list } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const BLOB_HOST = "blob.vercel-storage.com";

export function blobUrlsIn(value: string | null | undefined): string[] {
  if (!value || !value.includes(BLOB_HOST)) return [];
  return (
    value.match(/https:\/\/[^"'\s]+blob\.vercel-storage\.com[^"'\s]*/g) || []
  ).map((url) => url.split("?")[0]);
}

export async function deleteBlobUrls(urls: string[]): Promise<number> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const unique = [...new Set(urls.flatMap((url) => blobUrlsIn(url)))];
  if (!token || unique.length === 0) return 0;
  try {
    await del(unique, { token });
    return unique.length;
  } catch {
    return 0;
  }
}

export async function usedBlobUrls(): Promise<Set<string>> {
  const used = new Set<string>();
  const add = (value: string | null | undefined) => {
    for (const url of blobUrlsIn(value)) used.add(url);
  };

  const [products, settings, reviews] = await Promise.all([
    prisma.product.findMany({ select: { images: true, description: true } }),
    prisma.siteSetting.findMany({ select: { value: true } }),
    prisma.review.findMany({ select: { image: true } }),
  ]);

  for (const product of products) {
    add(product.images);
    add(product.description);
  }
  for (const setting of settings) add(setting.value);
  for (const review of reviews) add(review.image);
  return used;
}

/** Delete Blob files that no product, site image, or review still points at. */
export async function pruneUnusedBlobs(): Promise<{
  removed: number;
  kept: number;
}> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) throw new Error("Blob storage is not configured");

  const used = await usedBlobUrls();
  const orphans: string[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({ token, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const url = blob.url.split("?")[0];
      if (!used.has(url)) orphans.push(url);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  if (orphans.length > 0) {
    await del(orphans, { token });
  }

  return { removed: orphans.length, kept: used.size };
}
