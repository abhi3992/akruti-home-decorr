import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  BED_SIZES,
  KIDS_SIZES,
  getCatalog,
  saveCatalog,
  slugifyCatalog,
  type CatalogCategory,
} from "@/lib/catalog";

const addCategorySchema = z.object({
  action: z.literal("addCategory"),
  label: z.string().min(2).max(40),
  sizeSet: z.enum(["kids", "bed", "custom"]).default("kids"),
  customSizes: z.string().optional().default(""),
});

const addSubSchema = z.object({
  action: z.literal("addSubcategory"),
  categoryId: z.string().min(1),
  label: z.string().min(2).max(40),
  sizeSet: z.enum(["inherit", "kids", "bed", "custom"]).default("inherit"),
  customSizes: z.string().optional().default(""),
});

const updateCategorySizesSchema = z.object({
  action: z.literal("updateCategorySizes"),
  categoryId: z.string().min(1),
  sizes: z.string().min(1),
});

const updateSubSizesSchema = z.object({
  action: z.literal("updateSubcategorySizes"),
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1),
  sizes: z.string().min(1),
});

const addSizesSchema = z.object({
  action: z.literal("addSizes"),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
  sizes: z.string().min(1),
});

const removeSchema = z.object({
  action: z.literal("remove"),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
});

function sizesFromInput(sizeSet: "kids" | "bed" | "custom", custom: string) {
  if (sizeSet === "bed") return [...BED_SIZES];
  if (sizeSet === "custom") {
    const list = custom
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return list.length ? list : [...KIDS_SIZES];
  }
  return [...KIDS_SIZES];
}

function splitSizes(value: string) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mergeSizes(current: string[], incoming: string[]) {
  const next = [...current];
  for (const size of incoming) {
    if (!next.some((s) => s.toLowerCase() === size.toLowerCase())) next.push(size);
  }
  return next;
}

function parseProductSizes(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((s) => String(s).trim()).filter(Boolean);
    }
  } catch {
    /* comma-separated fallback */
  }
  return splitSizes(raw);
}

async function appendProductSizes(
  categoryId: string,
  subcategoryId: string | undefined,
  incoming: string[]
) {
  const products = await prisma.product.findMany({
    where: {
      category: categoryId,
      ...(subcategoryId ? { subcategory: subcategoryId } : {}),
    },
    select: { id: true, slug: true, sizes: true },
  });
  const slugs: string[] = [];
  for (const product of products) {
    const current = parseProductSizes(product.sizes);
    const next = mergeSizes(current, incoming);
    if (next.length === current.length && next.every((size, i) => size === current[i])) {
      continue;
    }
    await prisma.product.update({
      where: { id: product.id },
      data: { sizes: JSON.stringify(next) },
    });
    slugs.push(product.slug);
  }
  return slugs;
}

function uniqueId(base: string, taken: Set<string>) {
  let id = base || "category";
  let n = 2;
  while (taken.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ catalog: await getCatalog() });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const catalog = await getCatalog();
    const productSlugs: string[] = [];

    if (body?.action === "addCategory") {
      const data = addCategorySchema.parse(body);
      const taken = new Set(catalog.map((c) => c.id));
      const id = uniqueId(slugifyCatalog(data.label), taken);
      const next: CatalogCategory = {
        id,
        label: data.label.trim(),
        sizes: sizesFromInput(data.sizeSet, data.customSizes || ""),
        subcategories: [],
      };
      catalog.push(next);
      await saveCatalog(catalog);
    } else if (body?.action === "addSubcategory") {
      const data = addSubSchema.parse(body);
      const cat = catalog.find((c) => c.id === data.categoryId);
      if (!cat) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      const taken = new Set(cat.subcategories.map((s) => s.id));
      const id = uniqueId(slugifyCatalog(data.label), taken);
      const sizes =
        data.sizeSet === "inherit"
          ? [...cat.sizes]
          : sizesFromInput(
              data.sizeSet === "bed" ? "bed" : data.sizeSet === "custom" ? "custom" : "kids",
              data.customSizes || ""
            );
      cat.subcategories.push({ id, label: data.label.trim(), sizes });
      await saveCatalog(catalog);
    } else if (body?.action === "updateCategorySizes") {
      const data = updateCategorySizesSchema.parse(body);
      const cat = catalog.find((c) => c.id === data.categoryId);
      if (!cat) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      const sizes = data.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!sizes.length) {
        return NextResponse.json({ error: "Add at least one size" }, { status: 400 });
      }
      cat.sizes = sizes;
      await saveCatalog(catalog);
    } else if (body?.action === "updateSubcategorySizes") {
      const data = updateSubSizesSchema.parse(body);
      const cat = catalog.find((c) => c.id === data.categoryId);
      const sub = cat?.subcategories.find((s) => s.id === data.subcategoryId);
      if (!cat || !sub) {
        return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
      }
      const sizes = data.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!sizes.length) {
        return NextResponse.json({ error: "Add at least one size" }, { status: 400 });
      }
      sub.sizes = sizes;
      await saveCatalog(catalog);
    } else if (body?.action === "addSizes") {
      const data = addSizesSchema.parse(body);
      const incoming = splitSizes(data.sizes);
      if (!incoming.length) {
        return NextResponse.json({ error: "Add at least one size" }, { status: 400 });
      }
      const cat = catalog.find((c) => c.id === data.categoryId);
      if (!cat) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      if (data.subcategoryId) {
        const sub = cat.subcategories.find((s) => s.id === data.subcategoryId);
        if (!sub) {
          return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
        }
        sub.sizes = mergeSizes(sub.sizes, incoming);
        productSlugs.push(
          ...(await appendProductSizes(cat.id, sub.id, incoming))
        );
      } else {
        cat.sizes = mergeSizes(cat.sizes, incoming);
        for (const sub of cat.subcategories) {
          sub.sizes = mergeSizes(sub.sizes, incoming);
        }
        productSlugs.push(...(await appendProductSizes(cat.id, undefined, incoming)));
      }
      await saveCatalog(catalog);
    } else if (body?.action === "remove") {
      const data = removeSchema.parse(body);
      if (data.subcategoryId) {
        const cat = catalog.find((c) => c.id === data.categoryId);
        if (!cat) {
          return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        const used = await prisma.product.count({
          where: { category: data.categoryId, subcategory: data.subcategoryId },
        });
        if (used > 0) {
          return NextResponse.json(
            { error: "This subcategory is used by products" },
            { status: 400 }
          );
        }
        cat.subcategories = cat.subcategories.filter(
          (s) => s.id !== data.subcategoryId
        );
      } else {
        if (["bathrobe", "towel", "bedsheet"].includes(data.categoryId)) {
          return NextResponse.json(
            { error: "Built-in categories stay in the shop" },
            { status: 400 }
          );
        }
        const used = await prisma.product.count({
          where: { category: data.categoryId },
        });
        if (used > 0) {
          return NextResponse.json(
            { error: "This category is used by products" },
            { status: 400 }
          );
        }
        const idx = catalog.findIndex((c) => c.id === data.categoryId);
        if (idx >= 0) catalog.splice(idx, 1);
      }
      await saveCatalog(catalog);
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    revalidatePath("/shop");
    revalidatePath("/admin");
    for (const slug of productSlugs) {
      revalidatePath(`/product/${slug}`);
    }
    return NextResponse.json({ catalog });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update catalog";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
