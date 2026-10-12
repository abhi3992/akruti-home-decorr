"use client";

import { useMemo, useState } from "react";
import type { CatalogCategory } from "@/lib/catalog";

function parseSizeList(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((s) => String(s).trim()).filter(Boolean);
    }
  } catch {
    /* comma-separated */
  }
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProductCategoryFields({
  catalog,
  defaultCategory = "towel",
  defaultSubcategory = "",
  defaultSizes = "",
}: {
  catalog: CatalogCategory[];
  defaultCategory?: string;
  defaultSubcategory?: string;
  defaultSizes?: string;
}) {
  const initialSizes = parseSizeList(defaultSizes);
  const [category, setCategory] = useState(
    catalog.some((c) => c.id === defaultCategory) ? defaultCategory : catalog[0]?.id || "towel"
  );
  const [subcategory, setSubcategory] = useState(defaultSubcategory);
  const [selected, setSelected] = useState<string[]>(
    initialSizes.length
      ? initialSizes
      : catalog.find((c) => c.id === category)?.sizes || []
  );

  const current = catalog.find((c) => c.id === category) || catalog[0];
  const currentSub = current?.subcategories.find((s) => s.id === subcategory);
  const sizeOptions = useMemo(() => {
    const base = currentSub?.sizes?.length
      ? currentSub.sizes
      : current?.sizes || [];
    const extra = selected.filter((s) => !base.includes(s));
    return [...base, ...extra];
  }, [current, currentSub, selected]);

  function sizesFor(categoryId: string, subcategoryId: string) {
    const cat = catalog.find((c) => c.id === categoryId);
    const sub = cat?.subcategories.find((s) => s.id === subcategoryId);
    if (sub?.sizes?.length) return sub.sizes;
    return cat?.sizes || [];
  }

  function onCategory(next: string) {
    setCategory(next);
    setSubcategory("");
    setSelected(sizesFor(next, ""));
  }

  function onSubcategory(next: string) {
    setSubcategory(next);
    setSelected(sizesFor(category, next));
  }

  function toggleSize(size: string) {
    setSelected((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  return (
    <div className="grid gap-3">
      <label className="block text-xs text-[var(--muted)]">
        Category
        <select
          name="category"
          value={category}
          onChange={(e) => onCategory(e.target.value)}
          className="mt-1 w-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
        >
          {catalog.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-[var(--muted)]">
        Subcategory
        <select
          name="subcategory"
          value={subcategory}
          onChange={(e) => onSubcategory(e.target.value)}
          className="mt-1 w-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
        >
          <option value="">None</option>
          {(current?.subcategories || []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="text-xs text-[var(--muted)]">Sizes</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizeOptions.map((size) => {
            const on = selected.includes(size);
            return (
              <label
                key={size}
                className={`cursor-pointer border px-3 py-2 text-sm ${
                  on
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                    : "border-[var(--line)] bg-[var(--surface)]"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => toggleSize(size)}
                />
                {size}
              </label>
            );
          })}
        </div>
        <input type="hidden" name="sizes" value={selected.join(", ")} />
      </fieldset>
    </div>
  );
}
