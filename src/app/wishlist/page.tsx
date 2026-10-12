"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/components/WishlistProvider";
import { useCart } from "@/components/CartProvider";
import { formatINR, isExternalImage } from "@/lib/utils";

export default function WishlistPage() {
  const { items, remove, clear } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-x pb-20 pt-10 text-center md:pt-14">
        <h1 className="section-title">Wishlist</h1>
        <p className="mt-4 text-[var(--muted)]">No saved pieces yet.</p>
        <Link href="/shop" className="btn btn-dark mt-8 inline-flex">
          Browse shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x pb-20 pt-10 md:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Saved</p>
          <h1 className="section-title mt-2">Wishlist</h1>
        </div>
        <button
          type="button"
          className="text-xs text-[var(--muted)] hover:text-[var(--ink)]"
          onClick={clear}
        >
          Clear all
        </button>
      </div>

      <ul className="mt-10 space-y-4">
        {items.map((item) => (
          <li
            key={item.productId}
            className="flex gap-4 border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4"
          >
            <Link
              href={`/product/${item.slug}`}
              className="relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--bg)] sm:h-28 sm:w-24"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized={isExternalImage(item.image)}
              />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/product/${item.slug}`}
                className="font-medium hover:text-[var(--accent)]"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm">{formatINR(item.priceInPaise)}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs">
                <button
                  type="button"
                  className="text-[var(--accent)]"
                  onClick={() =>
                    addItem({
                      productId: item.productId,
                      slug: item.slug,
                      name: item.name,
                      image: item.image,
                      size: "One size",
                      priceInPaise: item.priceInPaise,
                    })
                  }
                >
                  Add to cart
                </button>
                <button
                  type="button"
                  className="text-[var(--muted)]"
                  onClick={() => remove(item.productId)}
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
