"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const fabrics = ["Waffle Cotton", "Kantha Cotton"];
const sizes = ["2-3Y", "4-5Y", "6-7Y", "8-9Y"];

export function ShopFilters({
  fabric,
  size,
  count,
}: {
  fabric?: string;
  size?: string;
  count: number;
}) {
  const router = useRouter();

  function update(key: string, value: string) {
    const params = new URLSearchParams();
    const nextFabric = key === "fabric" ? value : fabric || "";
    const nextSize = key === "size" ? value : size || "";
    if (nextFabric) params.set("fabric", nextFabric);
    if (nextSize) params.set("size", nextSize);
    const q = params.toString();
    router.push(q ? `/shop?${q}` : "/shop");
  }

  return (
    <div className="flex flex-col gap-4 border-y border-[var(--ink)]/10 py-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-[var(--ink)]/60">{count} pieces</p>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={fabric || ""}
          onChange={(e) => update("fabric", e.target.value)}
          className="border border-[var(--ink)]/20 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All fabrics</option>
          {fabrics.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          value={size || ""}
          onChange={(e) => update("size", e.target.value)}
          className="border border-[var(--ink)]/20 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All sizes</option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {(fabric || size) && (
          <Link href="/shop" className="text-sm text-[var(--ochre)]">
            Clear
          </Link>
        )}
      </div>
    </div>
  );
}
