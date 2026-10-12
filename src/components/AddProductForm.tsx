"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { prepareImageForUpload } from "@/lib/compress-image";
import { ProductCategoryFields } from "./ProductCategoryFields";
import type { CatalogCategory } from "@/lib/catalog";

type Preview = { file: File; url: string };

export function AddProductForm({ catalog }: { catalog: CatalogCategory[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function clearPreviews() {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
  }

  function onFilesChange(list: FileList | null) {
    setError("");
    clearPreviews();
    if (!list?.length) return;
    setPreviews(
      Array.from(list).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const imageUrls: string[] = [];

      for (const { file } of previews) {
        const prepared = await prepareImageForUpload(file);
        const uploadData = new FormData();
        uploadData.set("file", prepared);
        const up = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadData,
        });
        const json = await up.json();
        if (!up.ok) throw new Error(json.error || "Upload failed");
        imageUrls.push(json.url);
      }

      const pathExtra = String(data.get("imagePath") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      imageUrls.push(...pathExtra);

      if (imageUrls.length === 0) {
        throw new Error("Please upload at least one photo");
      }

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          slug: data.get("slug"),
          description: data.get("description"),
          price: data.get("price"),
          fabric: data.get("fabric"),
          stock: data.get("stock"),
          featured: data.get("featured") === "on",
          images: imageUrls,
          sizes: String(data.get("sizes") || ""),
          category: String(data.get("category") || "towel"),
          subcategory: String(data.get("subcategory") || ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create product");

      form.reset();
      clearPreviews();
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid max-w-xl gap-3 text-sm">
      <input
        name="name"
        required
        placeholder="Name"
        className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
      />
      <input
        name="slug"
        required
        placeholder="slug-like-this"
        className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
      />
      <textarea
        name="description"
        required
        placeholder={"Description (kept as typed)\n\nBlank line = new paragraph\n- Bullet one\n- Bullet two"}
        rows={8}
        className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2 font-sans leading-relaxed"
      />
      <input
        name="price"
        type="number"
        required
        min={1}
        placeholder="Price INR"
        className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
      />
      <input
        name="fabric"
        defaultValue="Waffle Cotton"
        className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
      />
      <ProductCategoryFields catalog={catalog} defaultCategory="towel" />
      <input
        name="stock"
        type="number"
        defaultValue={10}
        className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
      />

      <div className="border border-dashed border-[var(--line)] bg-[var(--bg)] p-5">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Product photos
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => onFilesChange(e.target.files)}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn btn-dark"
            onClick={() => fileRef.current?.click()}
          >
            {previews.length ? "Change photos" : "Upload photos"}
          </button>
          {previews.length > 0 && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                clearPreviews();
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Clear
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-[var(--muted)]">
          {previews.length
            ? `${previews.length} photo(s) selected · first is the main image`
            : "Select one or more · up to 5MB each · JPG/PNG/WEBP"}
        </p>

        {previews.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {previews.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.url}
                src={p.url}
                alt={`Preview ${i + 1}`}
                className="h-24 w-20 border border-[var(--line)] object-cover"
              />
            ))}
          </div>
        )}

        <input
          name="imagePath"
          placeholder="Or paste paths / URLs, comma-separated (optional)"
          className="mt-4 w-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="featured" /> Featured
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="btn btn-dark disabled:opacity-50"
      >
        {busy ? "Saving…" : "Create product"}
      </button>
    </form>
  );
}
