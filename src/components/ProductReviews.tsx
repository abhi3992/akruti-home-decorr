"use client";

import { useState } from "react";
import { CustomerReviewForm } from "./CustomerReviewForm";

export type ReviewItem = {
  id: string;
  author: string;
  rating: number;
  body: string;
  image?: string;
  createdAt: string;
};

export function ProductReviews({
  productId,
  initial,
}: {
  productId: string;
  initial: ReviewItem[];
}) {
  const [reviews] = useState(initial);
  const [tab, setTab] = useState<"reviews" | "write">("reviews");
  const [done, setDone] = useState("");

  const average =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <section id="reviews" className="container-x border-t border-[var(--line)] py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Customers</p>
          <h2 className="section-title mt-2">Reviews</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {reviews.length === 0
              ? "Be the first to review this piece."
              : `${average.toFixed(1)} · ${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("reviews")}
            className={`px-3 py-2 text-[11px] uppercase tracking-[0.14em] ${
              tab === "reviews" ? "bg-[var(--ink)] text-white" : "text-[var(--muted)]"
            }`}
          >
            Reviews
          </button>
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`px-3 py-2 text-[11px] uppercase tracking-[0.14em] ${
              tab === "write" ? "bg-[var(--ink)] text-white" : "text-[var(--muted)]"
            }`}
          >
            Write a review
          </button>
        </div>
      </div>

      {tab === "write" ? (
        <div className="mt-8 max-w-xl">
          <p className="mb-3 text-sm text-[var(--muted)]">
            Reviews are open to customers who have ordered. Enter your order number and the email from checkout.
          </p>
          <CustomerReviewForm
            productId={productId}
            onSaved={() => {
              setDone("Thank you — your review is live.");
              setTab("reviews");
            }}
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {done && (
            <li className="md:col-span-2 text-sm text-emerald-800">{done}</li>
          )}
          {reviews.map((review) => (
            <li
              key={review.id}
              className="border border-[var(--line)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{review.author}</p>
                <p className="text-sm text-[var(--accent)]" aria-label={`${review.rating} stars`}>
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {review.body}
              </p>
              {review.image ? (
                <img
                  src={review.image}
                  alt={`Photo from ${review.author}`}
                  className="mt-3 aspect-[4/3] w-full object-cover"
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
