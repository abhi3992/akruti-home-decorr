import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderReviewLookup } from "@/components/OrderReviewLookup";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
    include: { product: { select: { name: true, slug: true } } },
  });
  const count = await prisma.review.count();
  const average =
    count === 0
      ? 0
      : (
          await prisma.review.aggregate({ _avg: { rating: true } })
        )._avg.rating || 0;

  return (
    <div className="container-x pb-16 pt-8 sm:pb-20 sm:pt-10 md:pt-14">
      <p className="eyebrow">From our customers</p>
      <h1 className="section-title mt-2">Reviews</h1>
      <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
        {count} review{count === 1 ? "" : "s"}
        {count > 0 ? ` · ${average.toFixed(1)} average` : ""}
      </p>

      <div className="mt-8">
        <OrderReviewLookup />
      </div>

      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="border border-[var(--line)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{review.author}</p>
                <Link
                  href={`/product/${review.product.slug}#reviews`}
                  className="mt-1 block text-sm text-[var(--accent)] hover:underline"
                >
                  {review.product.name}
                </Link>
              </div>
              <p className="shrink-0 text-sm text-[var(--accent)]">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
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
    </div>
  );
}
