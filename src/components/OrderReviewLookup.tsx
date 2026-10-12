"use client";

import { FormEvent, useState } from "react";
import { CustomerReviewForm } from "./CustomerReviewForm";

type Item = { id: string; name: string; slug: string };

export function OrderReviewLookup() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [products, setProducts] = useState<Item[] | null>(null);

  async function onLookup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const nextEmail = String(data.get("email") || "");
    const nextOrder = String(data.get("orderNumber") || "");
    setEmail(nextEmail);
    setOrderNumber(nextOrder);
    try {
      const res = await fetch("/api/reviews/eligible", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: nextOrder, email: nextEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Lookup failed");
      setProducts(json.products || []);
    } catch (err) {
      setProducts(null);
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
      <h2 className="font-[family-name:var(--font-display)] text-2xl">
        Review your order
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Use the order number from your confirmation and the email you checked out with.
      </p>
      <form onSubmit={onLookup} className="mt-4 grid gap-3 text-sm sm:grid-cols-[1fr_1fr_auto]">
        <input
          name="orderNumber"
          required
          placeholder="AHD-2026-001555"
          className="border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email on the order"
          className="border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5"
        />
        <button type="submit" disabled={busy} className="btn btn-dark disabled:opacity-50">
          {busy ? "Checking…" : "Find order"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {products && products.length === 0 && (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Every item on this order already has a review.
        </p>
      )}
      {products && products.length > 0 && (
        <div className="mt-6 grid gap-6">
          {products.map((product) => (
            <CustomerReviewForm
              key={product.id}
              productId={product.id}
              productName={product.name}
              defaultOrderNumber={orderNumber}
              defaultEmail={email}
            />
          ))}
        </div>
      )}
    </div>
  );
}
