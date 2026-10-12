import { prisma } from "@/lib/prisma";

export const KIDS_SIZES = ["2-3Y", "4-5Y", "6-7Y", "8-9Y"];
export const BED_SIZES = ["King (108 × 108 in)", "Queen (90 × 108 in)"];

export const CATALOG_KEY = "catalogTaxonomy";

export type CatalogSubcategory = {
  id: string;
  label: string;
  sizes: string[];
};

export type CatalogCategory = {
  id: string;
  label: string;
  sizes: string[];
  subcategories: CatalogSubcategory[];
};

export const DEFAULT_CATALOG: CatalogCategory[] = [
  {
    id: "bathrobe",
    label: "Bathrobes",
    sizes: [...KIDS_SIZES],
    subcategories: [],
  },
  {
    id: "towel",
    label: "Towels",
    sizes: [...KIDS_SIZES],
    subcategories: [],
  },
  {
    id: "bedsheet",
    label: "Bedsheets",
    sizes: [...BED_SIZES],
    subcategories: [],
  },
];

export function slugifyCatalog(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeCategory(raw: unknown): CatalogCategory | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<CatalogCategory>;
  const id = typeof row.id === "string" ? row.id.trim() : "";
  const label = typeof row.label === "string" ? row.label.trim() : "";
  if (!id || !label) return null;
  const sizes = Array.isArray(row.sizes)
    ? row.sizes.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const subcategories = Array.isArray(row.subcategories)
    ? row.subcategories
        .map((s) => {
          if (!s || typeof s !== "object") return null;
          const sub = s as Partial<CatalogSubcategory>;
          const sid = typeof sub.id === "string" ? sub.id.trim() : "";
          const slabel = typeof sub.label === "string" ? sub.label.trim() : "";
          if (!sid || !slabel) return null;
          const subSizes = Array.isArray(sub.sizes)
            ? sub.sizes.map((s) => String(s).trim()).filter(Boolean)
            : [];
          return {
            id: sid,
            label: slabel,
            sizes: subSizes.length ? subSizes : sizes.length ? [...sizes] : [...KIDS_SIZES],
          };
        })
        .filter((s): s is CatalogSubcategory => Boolean(s))
    : [];
  const builtin = DEFAULT_CATALOG.find((c) => c.id === id);
  return {
    id,
    label,
    sizes: sizes.length ? sizes : builtin?.sizes || [...KIDS_SIZES],
    subcategories,
  };
}

export function parseCatalog(value: string | null | undefined): CatalogCategory[] {
  if (!value) return DEFAULT_CATALOG.map((c) => ({ ...c, sizes: [...c.sizes], subcategories: [] }));
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return DEFAULT_CATALOG;
    const categories = parsed
      .map(normalizeCategory)
      .filter((c): c is CatalogCategory => Boolean(c));
    if (!categories.length) return DEFAULT_CATALOG;
    for (const builtin of DEFAULT_CATALOG) {
      const existing = categories.find((c) => c.id === builtin.id);
      if (!existing) {
        categories.push({
          ...builtin,
          sizes: [...builtin.sizes],
          subcategories: [],
        });
      }
    }
    return categories;
  } catch {
    return DEFAULT_CATALOG;
  }
}

export async function getCatalog(): Promise<CatalogCategory[]> {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: CATALOG_KEY },
    });
    return parseCatalog(row?.value);
  } catch {
    return DEFAULT_CATALOG;
  }
}

export async function saveCatalog(catalog: CatalogCategory[]): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: CATALOG_KEY },
    create: { key: CATALOG_KEY, value: JSON.stringify(catalog) },
    update: { value: JSON.stringify(catalog) },
  });
}

export function sizesForCategory(
  catalog: CatalogCategory[],
  categoryId: string,
  subcategoryId?: string
): string[] {
  const cat =
    catalog.find((c) => c.id === categoryId) ||
    DEFAULT_CATALOG.find((c) => c.id === categoryId);
  if (!cat) return [...KIDS_SIZES];
  if (subcategoryId) {
    const sub = cat.subcategories.find((s) => s.id === subcategoryId);
    if (sub?.sizes.length) return sub.sizes;
  }
  return cat.sizes.length ? cat.sizes : [...KIDS_SIZES];
}

export function categoryLabelFromCatalog(
  catalog: CatalogCategory[],
  id: string
): string {
  return catalog.find((c) => c.id === id)?.label || id;
}

export function subcategoryLabel(
  catalog: CatalogCategory[],
  categoryId: string,
  subcategoryId: string
): string {
  const cat = catalog.find((c) => c.id === categoryId);
  return cat?.subcategories.find((s) => s.id === subcategoryId)?.label || subcategoryId;
}
