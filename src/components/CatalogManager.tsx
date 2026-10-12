"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { CatalogCategory } from "@/lib/catalog";

export function CatalogManager({
  initial,
}: {
  initial: CatalogCategory[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sizeSet, setSizeSet] = useState<"kids" | "bed" | "custom">("kids");
  const [subSizeSet, setSubSizeSet] = useState<
    Record<string, "inherit" | "kids" | "bed" | "custom">
  >({});

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save");
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await send({
      action: "addCategory",
      label: String(data.get("label") || ""),
      sizeSet,
      customSizes: String(data.get("customSizes") || ""),
    });
    e.currentTarget.reset();
    setSizeSet("kids");
  }

  async function addSub(e: FormEvent<HTMLFormElement>, categoryId: string) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await send({
      action: "addSubcategory",
      categoryId,
      label: String(data.get("label") || ""),
      sizeSet: subSizeSet[categoryId] || "inherit",
      customSizes: String(data.get("customSizes") || ""),
    });
    e.currentTarget.reset();
  }

  return (
    <section className="mb-16">
      <h2 className="font-[family-name:var(--font-display)] text-2xl">
        Categories
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Add a size to a category and it is also added to that category’s
        subcategories and to the products already in it. A subcategory can
        take its own extra sizes.
      </p>

      <ul className="mt-6 space-y-4">
        {initial.map((cat) => (
          <li
            key={cat.id}
            className="border border-[var(--line)] bg-[var(--surface)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{cat.label}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Sizes: {cat.sizes.join(", ")}
                </p>
                <form
                  className="mt-2 flex flex-col gap-2 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    send({
                      action: "updateCategorySizes",
                      categoryId: cat.id,
                      sizes: String(data.get("sizes") || ""),
                    });
                  }}
                >
                  <input
                    key={cat.sizes.join("|")}
                    name="sizes"
                    defaultValue={cat.sizes.join(", ")}
                    placeholder="Sizes, comma separated"
                    className="min-h-10 min-w-0 flex-1 border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn btn-outline min-h-10 px-3 text-[11px] disabled:opacity-50"
                  >
                    Save sizes
                  </button>
                </form>
                <form
                  className="mt-2 flex flex-col gap-2 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const data = new FormData(form);
                    const sizes = String(data.get("size") || "").trim();
                    if (!sizes) return;
                    send({
                      action: "addSizes",
                      categoryId: cat.id,
                      sizes,
                    }).then((ok) => {
                      if (ok) form.reset();
                    });
                  }}
                >
                  <input
                    name="size"
                    required
                    placeholder="Add a new size"
                    className="min-h-10 min-w-0 flex-1 border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn btn-dark min-h-10 px-3 text-[11px] disabled:opacity-50"
                  >
                    Add size
                  </button>
                </form>
              </div>
              {!["bathrobe", "towel", "bedsheet"].includes(cat.id) && (
                <button
                  type="button"
                  disabled={busy}
                  className="text-xs text-red-800"
                  onClick={() =>
                    send({ action: "remove", categoryId: cat.id })
                  }
                >
                  Remove
                </button>
              )}
            </div>
            <ul className="mt-3 space-y-3 text-sm">
              {cat.subcategories.map((sub) => (
                <li
                  key={sub.id}
                  className="border border-[var(--line)] bg-[var(--bg)] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-[var(--ink)]">{sub.label}</span>
                    <button
                      type="button"
                      disabled={busy}
                      className="text-xs text-red-800"
                      onClick={() =>
                        send({
                          action: "remove",
                          categoryId: cat.id,
                          subcategoryId: sub.id,
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Sizes: {(sub.sizes || []).join(", ") || "Same as category"}
                  </p>
                  <form
                    className="mt-2 flex flex-col gap-2 sm:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const data = new FormData(e.currentTarget);
                      send({
                        action: "updateSubcategorySizes",
                        categoryId: cat.id,
                        subcategoryId: sub.id,
                        sizes: String(data.get("sizes") || ""),
                      });
                    }}
                  >
                    <input
                      key={(sub.sizes || []).join("|")}
                      name="sizes"
                      defaultValue={(sub.sizes || []).join(", ")}
                      placeholder="Sizes, comma separated"
                      className="min-h-10 flex-1 border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="btn btn-outline min-h-10 px-3 text-[11px] disabled:opacity-50"
                    >
                      Save sizes
                    </button>
                  </form>
                  <form
                    className="mt-2 flex flex-col gap-2 sm:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const data = new FormData(form);
                      const sizes = String(data.get("size") || "").trim();
                      if (!sizes) return;
                      send({
                        action: "addSizes",
                        categoryId: cat.id,
                        subcategoryId: sub.id,
                        sizes,
                      }).then((ok) => {
                        if (ok) form.reset();
                      });
                    }}
                  >
                    <input
                      name="size"
                      required
                      placeholder="Add a new size"
                      className="min-h-10 flex-1 border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="btn btn-dark min-h-10 px-3 text-[11px] disabled:opacity-50"
                    >
                      Add size
                    </button>
                  </form>
                </li>
              ))}
              {cat.subcategories.length === 0 && (
                <li className="text-xs text-[var(--muted)]">No subcategories yet.</li>
              )}
            </ul>
            <form
              onSubmit={(e) => addSub(e, cat.id)}
              className="mt-3 grid gap-2"
            >
              <input
                name="label"
                required
                placeholder="New subcategory"
                className="min-h-11 border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
              />
              <select
                value={subSizeSet[cat.id] || "inherit"}
                onChange={(e) =>
                  setSubSizeSet((prev) => ({
                    ...prev,
                    [cat.id]: e.target.value as "inherit" | "kids" | "bed" | "custom",
                  }))
                }
                className="min-h-11 border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
              >
                <option value="inherit">Same sizes as {cat.label}</option>
                <option value="kids">Kids sizes (2-3Y, 4-5Y, 6-7Y, 8-9Y)</option>
                <option value="bed">Bedsheet sizes (King 108×108, Queen 90×108)</option>
                <option value="custom">Custom sizes</option>
              </select>
              {(subSizeSet[cat.id] || "inherit") === "custom" && (
                <input
                  name="customSizes"
                  placeholder="Sizes, comma separated"
                  className="min-h-11 border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                />
              )}
              <button
                type="submit"
                disabled={busy}
                className="btn btn-outline min-h-11 w-fit px-4 text-[11px] disabled:opacity-50"
              >
                Add subcategory
              </button>
            </form>
          </li>
        ))}
      </ul>

      <form onSubmit={addCategory} className="mt-6 grid max-w-xl gap-3 text-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          New category
        </p>
        <input
          name="label"
          required
          placeholder="Category name"
          className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
        />
        <select
          value={sizeSet}
          onChange={(e) =>
            setSizeSet(e.target.value as "kids" | "bed" | "custom")
          }
          className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
        >
          <option value="kids">Kids sizes (2-3Y, 4-5Y, 6-7Y, 8-9Y)</option>
          <option value="bed">Bedsheet sizes (King 108×108, Queen 90×108)</option>
          <option value="custom">Custom sizes</option>
        </select>
        {sizeSet === "custom" && (
          <input
            name="customSizes"
            placeholder="Sizes, comma separated"
            className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
          />
        )}
        <button
          type="submit"
          disabled={busy}
          className="btn btn-dark w-fit px-4 py-2 text-[11px] disabled:opacity-50"
        >
          {busy ? "Saving…" : "Add category"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}
