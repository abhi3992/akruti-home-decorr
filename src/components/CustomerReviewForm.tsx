"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CustomerReviewForm({
  productId,
  productName,
  defaultOrderNumber = "",
  defaultEmail = "",
  defaultAuthor = "",
  onSaved,
}: {
  productId: string;
  productName?: string;
  defaultOrderNumber?: string;
  defaultEmail?: string;
  defaultAuthor?: string;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setDone("");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          author: String(data.get("author") || ""),
          rating: Number(data.get("rating") || 5),
          body: String(data.get("body") || ""),
          orderNumber: String(data.get("orderNumber") || ""),
          email: String(data.get("email") || ""),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save review");
      setDone("Thank you — your review is live.");
      onSaved?.();
      router.refresh();
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 text-sm">
      {productName && (
        <p className="font-medium text-[var(--ink)]">{productName}</p>
      )}
      <input
        name="orderNumber"
        required
        defaultValue={defaultOrderNumber}
        placeholder="Order number (AHD-2026-…)"
        className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5"
      />
      <input
        name="email"
        type="email"
        required
        defaultValue={defaultEmail}
        placeholder="Email used on the order"
        className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5"
      />
      <input
        name="author"
        required
        minLength={2}
        defaultValue={defaultAuthor}
        placeholder="Name to show on the review"
        className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5"
      />
      <label className="text-xs text-[var(--muted)]">
        Rating
        <select
          name="rating"
          defaultValue="5"
          className="mt-1 w-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)]"
        >
          <option value="5">5 — Loved it</option>
          <option value="4">4 — Really good</option>
          <option value="3">3 — Okay</option>
          <option value="2">2 — Not quite</option>
          <option value="1">1 — Disappointed</option>
        </select>
      </label>
      <textarea
        name="body"
        required
        minLength={12}
        rows={4}
        placeholder="How was the fabric, print, and fit?"
        className="border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5"
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
      {done && <p className="text-sm text-emerald-800">{done}</p>}
      <button type="submit" disabled={busy} className="btn btn-dark w-fit disabled:opacity-50">
        {busy ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
