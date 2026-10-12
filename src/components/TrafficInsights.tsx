"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  category: string;
  views: number;
  allTimeViews: number;
  cartAdds: number;
  inCart: number;
  wishlistAdds: number;
  inWishlist: number;
  ordered: number;
};

type Payload = {
  days: number;
  totals: {
    views: number;
    allTimeViews: number;
    cartAdds: number;
    inCart: number;
    wishlistAdds: number;
    inWishlist: number;
    ordered: number;
  };
  rows: Row[];
};

const WINDOWS = [7, 30, 90] as const;
type SortKey = "views" | "cartAdds" | "wishlistAdds" | "ordered";

function rank(rows: Row[], key: SortKey) {
  return [...rows].sort((a, b) => b[key] - a[key] || b.allTimeViews - a.allTimeViews);
}

export function TrafficInsights() {
  const [days, setDays] = useState<(typeof WINDOWS)[number]>(30);
  const [sort, setSort] = useState<SortKey>("views");
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError("");
    fetch(`/api/admin/insights?days=${days}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not load insights");
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load insights");
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const sorted = useMemo(
    () => (data ? rank(data.rows, sort) : []),
    [data, sort]
  );
  const leaders = useMemo(() => {
    if (!data) return [];
    return [
      { title: "Most viewed", key: "views" as const, rows: rank(data.rows, "views").slice(0, 5) },
      { title: "Added to cart", key: "cartAdds" as const, rows: rank(data.rows, "cartAdds").slice(0, 5) },
      { title: "Added to wishlist", key: "wishlistAdds" as const, rows: rank(data.rows, "wishlistAdds").slice(0, 5) },
      { title: "Ordered", key: "ordered" as const, rows: rank(data.rows, "ordered").slice(0, 5) },
    ];
  }, [data]);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl">Insights</h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Which pieces were opened, saved, added to cart, or ordered in the
            last {days} days. All-time views and what is in a cart or wishlist
            right now stay visible beside the window.
          </p>
        </div>
        <div className="flex gap-2">
          {WINDOWS.map((window) => (
            <button
              key={window}
              type="button"
              onClick={() => setDays(window)}
              className={`min-h-10 px-3 text-[11px] uppercase tracking-[0.12em] ${
                days === window
                  ? "bg-[var(--ink)] text-white"
                  : "border border-[var(--line)] text-[var(--muted)]"
              }`}
            >
              {window} days
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      {!data && !error && <p className="mt-6 text-sm text-[var(--muted)]">Loading insights…</p>}

      {data && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label={`Views · ${days}d`} value={data.totals.views} hint={`${data.totals.allTimeViews} all time`} />
            <Stat label={`Cart adds · ${days}d`} value={data.totals.cartAdds} hint={`${data.totals.inCart} in carts now`} />
            <Stat label={`Wishlist adds · ${days}d`} value={data.totals.wishlistAdds} hint={`${data.totals.inWishlist} saved now`} />
            <Stat label={`Units ordered · ${days}d`} value={data.totals.ordered} hint="From placed orders" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {leaders.map((panel) => {
              const max = panel.rows[0]?.[panel.key] || 0;
              return (
                <div key={panel.title} className="border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    {panel.title}
                  </p>
                  <ul className="mt-3 space-y-3">
                    {max === 0 && (
                      <li className="text-sm text-[var(--muted)]">Nothing in this window yet.</li>
                    )}
                    {max > 0 &&
                      panel.rows
                        .filter((row) => row[panel.key] > 0)
                        .map((row) => {
                          const value = row[panel.key];
                          const width = Math.max(4, Math.round((value / max) * 100));
                          return (
                            <li key={row.id}>
                              <div className="flex items-baseline justify-between gap-3 text-sm">
                                <Link href={`/product/${row.slug}`} className="truncate hover:text-[var(--accent)]">
                                  {row.name}
                                </Link>
                                <span className="shrink-0 font-medium">{value}</span>
                              </div>
                              <div className="mt-1 h-1.5 bg-[var(--bg)]">
                                <div className="h-1.5 bg-[var(--ink)]" style={{ width: `${width}%` }} />
                              </div>
                            </li>
                          );
                        })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Every product
            </p>
            <label className="text-sm text-[var(--muted)]">
              Sort by{" "}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="ml-1 border border-[var(--line)] bg-[var(--surface)] px-2 py-1.5 text-[var(--ink)]"
              >
                <option value="views">Views</option>
                <option value="cartAdds">Cart adds</option>
                <option value="wishlistAdds">Wishlist adds</option>
                <option value="ordered">Orders</option>
              </select>
            </label>
          </div>

          <div className="mt-3 overflow-x-auto border border-[var(--line)]">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[var(--bg)] text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">Views</th>
                  <th className="px-3 py-2 font-medium">All time</th>
                  <th className="px-3 py-2 font-medium">Cart adds</th>
                  <th className="px-3 py-2 font-medium">In cart</th>
                  <th className="px-3 py-2 font-medium">Wishlist</th>
                  <th className="px-3 py-2 font-medium">Saved</th>
                  <th className="px-3 py-2 font-medium">Ordered</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id} className="border-t border-[var(--line)]">
                    <td className="px-3 py-2.5">
                      <Link href={`/product/${row.slug}`} className="hover:text-[var(--accent)]">
                        {row.name}
                      </Link>
                      {!row.active && (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">{row.views}</td>
                    <td className="px-3 py-2.5 text-[var(--muted)]">{row.allTimeViews}</td>
                    <td className="px-3 py-2.5">{row.cartAdds}</td>
                    <td className="px-3 py-2.5 text-[var(--muted)]">{row.inCart}</td>
                    <td className="px-3 py-2.5">{row.wishlistAdds}</td>
                    <td className="px-3 py-2.5 text-[var(--muted)]">{row.inWishlist}</td>
                    <td className="px-3 py-2.5">{row.ordered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-3xl">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p>
    </div>
  );
}
