import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { inferCategoryFromName } from "@/lib/categories";
import { getCatalog, sizesForCategory } from "@/lib/catalog";
import { deleteBlobUrls } from "@/lib/blob-cleanup";
import { productImages } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  price: z.union([z.string(), z.number()]),
  fabric: z.string().min(1),
  stock: z.union([z.string(), z.number()]),
  featured: z.boolean().optional().default(false),
  images: z.array(z.string().min(1)).optional(),
  image: z.string().min(1).optional(),
  sizes: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional().default(""),
});

const updateSchema = createSchema.extend({
  id: z.string().min(1),
  images: z.array(z.string().min(1)).optional(),
  image: z.string().min(1).optional(),
});

function slugify(slug: string) {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseSizes(sizes: string | undefined, fallback: string[]) {
  const list = (sizes || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : fallback;
}

function resolveCategory(
  name: string,
  category: string | undefined,
  allowed: string[]
) {
  if (category && allowed.includes(category)) return category;
  const inferred = inferCategoryFromName(name);
  return allowed.includes(inferred) ? inferred : allowed[0] || "towel";
}

function resolveSubcategory(
  categoryId: string,
  subcategory: string | undefined,
  catalog: Awaited<ReturnType<typeof getCatalog>>
) {
  const id = (subcategory || "").trim();
  if (!id) return "";
  const cat = catalog.find((c) => c.id === categoryId);
  if (!cat?.subcategories.some((s) => s.id === id)) return "";
  return id;
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createSchema.parse(await req.json());
    const imageList =
      body.images && body.images.length > 0
        ? body.images
        : body.image
          ? [body.image]
          : [];

    if (imageList.length === 0) {
      return NextResponse.json(
        { error: "At least one product photo is required" },
        { status: 400 }
      );
    }

    const catalog = await getCatalog();
    const category = resolveCategory(
      body.name,
      body.category,
      catalog.map((c) => c.id)
    );
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: slugify(body.slug),
        description: body.description,
        priceInPaise: Math.round(Number(body.price) * 100),
        fabric: body.fabric,
        images: JSON.stringify(imageList),
        sizes: JSON.stringify(
          parseSizes(
            body.sizes,
            sizesForCategory(
              catalog,
              category,
              resolveSubcategory(category, body.subcategory, catalog)
            )
          )
        ),
        category,
        subcategory: resolveSubcategory(category, body.subcategory, catalog),
        stock: Number(body.stock) || 0,
        featured: body.featured,
      },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    return NextResponse.json({ id: product.id, slug: product.slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = updateSchema.parse(await req.json());
    const existing = await prisma.product.findUnique({ where: { id: body.id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const catalog = await getCatalog();
    const category = resolveCategory(
      body.name,
      body.category,
      catalog.map((c) => c.id)
    );
    const data: {
      name: string;
      slug: string;
      description: string;
      priceInPaise: number;
      fabric: string;
      sizes: string;
      category: string;
      subcategory: string;
      stock: number;
      featured: boolean;
      images?: string;
    } = {
      name: body.name,
      slug: slugify(body.slug),
      description: body.description,
      priceInPaise: Math.round(Number(body.price) * 100),
      fabric: body.fabric,
      sizes: JSON.stringify(
        parseSizes(
          body.sizes,
          sizesForCategory(
            catalog,
            category,
            resolveSubcategory(category, body.subcategory, catalog)
          )
        )
      ),
      category,
      subcategory: resolveSubcategory(category, body.subcategory, catalog),
      stock: Number(body.stock) || 0,
      featured: Boolean(body.featured),
    };

    if (body.images && body.images.length > 0) {
      data.images = JSON.stringify(body.images);
    } else if (body.image) {
      data.images = JSON.stringify([body.image]);
    }

    const product = await prisma.product.update({
      where: { id: body.id },
      data,
    });

    if (data.images) {
      const nextImages = new Set(productImages(data.images));
      const dropped = productImages(existing.images).filter((url) => !nextImages.has(url));
      if (dropped.length) await deleteBlobUrls(dropped);
    }

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product/${existing.slug}`);
    revalidatePath(`/product/${product.slug}`);
    return NextResponse.json({ id: product.id, slug: product.slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(await req.json());
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const orderCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderCount > 0) {
      await prisma.product.update({
        where: { id },
        data: { active: false, stock: 0, featured: false },
      });
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin");
      revalidatePath(`/product/${existing.slug}`);
      return NextResponse.json({
        ok: true,
        soft: true,
        message: "Removed from shop (kept in past orders).",
      });
    }

    await prisma.$transaction([
      prisma.cartPresence.deleteMany({ where: { productId: id } }),
      prisma.wishlistPresence.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
    await deleteBlobUrls(productImages(existing.images));
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin");
    revalidatePath(`/product/${existing.slug}`);
    return NextResponse.json({ ok: true, soft: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
