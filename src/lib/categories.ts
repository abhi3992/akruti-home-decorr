export const PRODUCT_CATEGORIES = [
  { id: "bathrobe", label: "Bathrobes", slug: "bathrobes" },
  { id: "towel", label: "Towels", slug: "towels" },
  { id: "bedsheet", label: "Bedsheets", slug: "bedsheets" },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["id"];

export const CATEGORY_IDS = PRODUCT_CATEGORIES.map((c) => c.id);

export function isProductCategory(value: string): value is ProductCategory {
  return (CATEGORY_IDS as readonly string[]).includes(value);
}

export function categoryLabel(id: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.id === id)?.label || id;
}

/** Infer category from product name when not set explicitly. */
export function inferCategoryFromName(name: string): ProductCategory {
  const n = name.toLowerCase();
  if (
    n.includes("bathrobe") ||
    n.includes("bath robe") ||
    (n.includes("robe") && !n.includes("bedsheet"))
  ) {
    return "bathrobe";
  }
  if (
    n.includes("bedsheet") ||
    n.includes("bed sheet") ||
    n.includes("pillow") ||
    n.includes("dohar") ||
    n.includes("quilt")
  ) {
    return "bedsheet";
  }
  return "towel";
}
