import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { productImages } from "@/lib/utils";
import { deleteBlobUrls } from "@/lib/blob-cleanup";

const schema = z.object({
  id: z.string().min(1),
  /** Full replacement list (order matters; first = primary) */
  images: z.array(z.string().min(1)).optional(),
  /** Append one or more images */
  add: z.array(z.string().min(1)).optional(),
  /** Remove by exact URL */
  remove: z.string().min(1).optional(),
  /** Move this URL to index 0 (primary) */
  makePrimary: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const product = await prisma.product.findUnique({ where: { id: body.id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const previous = productImages(product.images);
    let images = [...previous];

    if (body.images) {
      images = body.images;
    }
    if (body.add?.length) {
      images = [...images, ...body.add];
    }
    if (body.remove) {
      images = images.filter((src) => src !== body.remove);
    }
    if (body.makePrimary) {
      const idx = images.indexOf(body.makePrimary);
      if (idx > 0) {
        images = [
          images[idx],
          ...images.slice(0, idx),
          ...images.slice(idx + 1),
        ];
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        { error: "Keep at least one product photo" },
        { status: 400 }
      );
    }

    // Dedupe while preserving order
    const seen = new Set<string>();
    images = images.filter((src) => {
      if (seen.has(src)) return false;
      seen.add(src);
      return true;
    });

    await prisma.product.update({
      where: { id: body.id },
      data: { images: JSON.stringify(images) },
    });

    const removed = previous.filter((url) => !images.includes(url));
    if (removed.length) await deleteBlobUrls(removed);

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${product.slug}`);

    return NextResponse.json({ ok: true, images });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
