"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "./ProductCard";
import type { CatalogCategory } from "@/lib/catalog";

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  priceInPaise: number;
  images: string;
  fabric: string;
  sizes: string;
  category: string;
  subcategory?: string;
};

const fabrics = ["Waffle Cotton", "Percale Cotton"];

export function ShopCatalog({
  products,
  catalog,
}: {
  products: ShopProduct[];
  catalog: CatalogCategory[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const fabric = searchParams.get("fabric") || "";
  const size = searchParams.get("size") || "";
  const activeCategory = catalog.find((c) => c.id === category);
  const activeSub = activeCategory?.subcategories.find((s) => s.id === subcategory);
  const sizeOptions = activeSub?.sizes?.length
    ? activeSub.sizes
    : activeCategory
      ? activeCategory.sizes
      : Array.from(
          new Set(
            catalog.flatMap((c) => [
              ...c.sizes,
              ...c.subcategories.flatMap((s) => s.sizes || []),
            ])
          )
        );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (subcategory && p.subcategory !== subcategory) return false;
      if (fabric && p.fabric !== fabric) return false;
      if (size) {
        try {
          const list: string[] = JSON.parse(p.sizes);
          if (!list.includes(size)) return false;
        } catch {
          return false;
        }
      }
      return true;
    });
  }, [products, category, subcategory, fabric, size]);

  function update(key: string, value: string) {
    const params = new URLSearchParams();
    const nextCategory = key === "category" ? value : category;
    let nextSub = key === "subcategory" ? value : subcategory;
    const nextFabric = key === "fabric" ? value : fabric;
    let nextSize = key === "size" ? value : size;
    if (key === "category") {
      nextSub = "";
      const sizes = catalog.find((c) => c.id === value)?.sizes || [];
      if (nextSize && !sizes.includes(nextSize) && value) nextSize = "";
    }
    if (key === "subcategory") {
      const cat = catalog.find((c) => c.id === nextCategory);
      const sub = cat?.subcategories.find((s) => s.id === value);
      const sizes = sub?.sizes?.length ? sub.sizes : cat?.sizes || [];
      if (nextSize && value && !sizes.includes(nextSize)) nextSize = "";
    }
    if (nextCategory) params.set("category", nextCategory);
    if (nextSub) params.set("subcategory", nextSub);
    if (nextFabric) params.set("fabric", nextFabric);
    if (nextSize) params.set("size", nextSize);
    const q = params.toString();
    router.replace(q ? `/shop?${q}` : "/shop", { scroll: false });
  }

  const hasFilters = Boolean(category || subcategory || fabric || size);

  return (
    <>
      <div className="border-y border-[var(--line)] py-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
          <button
            type="button"
            onClick={() => update("category", "")}
            className={`shrink-0 border px-3.5 py-2.5 text-xs uppercase tracking-[0.12em] ${
              !category
                ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                : "border-[var(--line)] text-[var(--muted)]"
            }`}
          >
            All
          </button>
          {catalog.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => update("category", c.id)}
              className={`shrink-0 border px-3.5 py-2.5 text-xs uppercase tracking-[0.12em] ${
                category === c.id
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {activeCategory && activeCategory.subcategories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => update("subcategory", "")}
              className={`border px-3 py-2 text-xs ${
                !subcategory
                  ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                  : "border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              All {activeCategory.label}
            </button>
            {activeCategory.subcategories.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update("subcategory", s.id)}
                className={`border px-3 py-2 text-xs ${
                  subcategory === s.id
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                    : "border-[var(--line)] text-[var(--muted)]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">
            {filtered.length} piece{filtered.length === 1 ? "" : "s"}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select
              value={fabric}
              onChange={(e) => update("fabric", e.target.value)}
              className="min-h-11 flex-1 border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm sm:flex-none"
            >
              <option value="">All fabrics</option>
              {fabrics.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <select
              value={size}
              onChange={(e) => update("size", e.target.value)}
              className="min-h-11 flex-1 border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm sm:flex-none"
            >
              <option value="">All sizes</option>
              {sizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {hasFilters && (
              <Link
                href="/shop"
                className="min-h-11 px-2 py-2 text-sm text-[var(--accent)]"
              >
                Clear
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {filtered.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-[var(--muted)]">
          No products match these filters.
        </p>
      )}
    </>
  );
}
