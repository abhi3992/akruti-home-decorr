"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductImagesManager } from "./ProductImagesManager";
import { ProductCategoryFields } from "./ProductCategoryFields";
import type { CatalogCategory } from "@/lib/catalog";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceInPaise: number;
  fabric: string;
  sizes: string;
  category: string;
  subcategory?: string;
  stock: number;
  featured: boolean;
  images: string[];
};

export function EditProductForm({
  product,
  catalog,
}: {
  product: Product;
  catalog: CatalogCategory[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(true);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          name: data.get("name"),
          slug: data.get("slug"),
          description: data.get("description"),
          price: data.get("price"),
          fabric: data.get("fabric"),
          stock: data.get("stock"),
          featured: data.get("featured") === "on",
          sizes: String(data.get("sizes") || ""),
          category: String(data.get("category") || product.category),
          subcategory: String(data.get("subcategory") || ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setMsg("Product saved");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (
      !confirm(
        `Remove “${product.name}” from the shop? If it appears in past orders it will be hidden (not permanently erased).`
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      setMsg(json.soft ? "Removed from shop" : "Product deleted");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-[var(--line)] pt-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="text-xs text-[var(--accent)]"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide editor" : "Edit product details"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 disabled:opacity-50"
        >
          {busy ? "Working…" : "Remove from shop"}
        </button>
      </div>
      {msg && (
        <p className="mt-2 text-xs text-[var(--muted)]" role="status">
          {msg}
        </p>
      )}

      {open && (
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 text-sm">
          <input
            name="name"
            required
            defaultValue={product.name}
            placeholder="Name"
            className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
          />
          <input
            name="slug"
            required
            defaultValue={product.slug}
            placeholder="slug"
            className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
          />
          <textarea
            name="description"
            required
            rows={8}
            defaultValue={product.description}
            placeholder="Description — line breaks & bullets kept as typed"
            className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-sans leading-relaxed"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="price"
              type="number"
              required
              min={1}
              defaultValue={product.priceInPaise / 100}
              placeholder="Price INR"
              className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
            />
            <input
              name="stock"
              type="number"
              defaultValue={product.stock}
              className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
            />
          </div>
          <input
            name="fabric"
            defaultValue={product.fabric}
            className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
          />
          <ProductCategoryFields
            catalog={catalog}
            defaultCategory={product.category || "towel"}
            defaultSubcategory={product.subcategory || ""}
            defaultSizes={product.sizes}
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product.featured}
            />
            Featured
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="btn btn-dark px-4 py-2 text-[11px] disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Photos
        </p>
        <ProductImagesManager productId={product.id} images={product.images} />
      </div>
    </div>
  );
}
