"use client";

import { useState } from "react";

type Tab = "traffic" | "site" | "products" | "orders";

const TABS: { id: Tab; label: string }[] = [
  { id: "traffic", label: "Insights" },
  { id: "site", label: "Site" },
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
];

export function AdminTabs({
  traffic,
  site,
  products,
  orders,
}: {
  traffic: React.ReactNode;
  site: React.ReactNode;
  products: React.ReactNode;
  orders: React.ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("traffic");

  return (
    <div className="mt-8">
      <div className="flex gap-2 overflow-x-auto border-b border-[var(--line)] pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 py-2.5 text-[11px] uppercase tracking-[0.14em] ${
              tab === t.id
                ? "bg-[var(--ink)] text-white"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {tab === "traffic" && traffic}
        {tab === "site" && site}
        {tab === "products" && products}
        {tab === "orders" && orders}
      </div>
    </div>
  );
}
