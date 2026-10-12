"use client";

import Link from "next/link";
import Image from "next/image";
import { formatINR, productImages, isExternalImage } from "@/lib/utils";
import { useCart } from "./CartProvider";
import { useWishlist } from "./WishlistProvider";

type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  priceInPaise: number;
  images: string;
  fabric: string;
  sizes: string;
};

export function ProductCard({
  id,
  name,
  slug,
  priceInPaise,
  images,
  fabric,
  sizes,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(id);
  const image = (
    productImages(images)[0] || "/products/sky-voyage.jpg"
  ).replace(/\.png$/i, ".jpg");
  let firstSize = "4-5Y";
  try {
    const parsed = JSON.parse(sizes);
    if (Array.isArray(parsed) && parsed[0]) firstSize = String(parsed[0]);
  } catch {
    /* ignore */
  }

  return (
    <article className="group flex h-full flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg)]">
        <Link href={`/product/${slug}`} prefetch className="absolute inset-0 block">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:768px) 45vw, 25vw"
            quality={75}
            unoptimized={isExternalImage(image)}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>
        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute right-1.5 top-1.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[var(--ink)] shadow-sm backdrop-blur-sm transition hover:bg-white sm:right-2 sm:top-2 sm:h-10 sm:w-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle({
              productId: id,
              slug,
              name,
              image,
              priceInPaise,
            });
          }}
        >
          <HeartIcon filled={wished} />
        </button>
      </div>
      <div className="flex flex-1 flex-col pt-2.5 sm:pt-3">
        <p className="truncate text-[9px] uppercase tracking-[0.12em] text-[var(--muted)] sm:text-[10px]">
          {fabric}
        </p>
        <Link
          href={`/product/${slug}`}
          prefetch
          className="mt-1 line-clamp-2 min-h-[2.4em] font-[family-name:var(--font-display)] text-[0.9rem] leading-snug hover:text-[var(--accent)] sm:text-[1.05rem]"
        >
          {name}
        </Link>
        <p className="mt-1 text-sm font-medium">{formatINR(priceInPaise)}</p>
        <button
          type="button"
          className="btn btn-outline mt-3 hidden min-h-10 w-full px-2 py-2 text-[10px] sm:mt-auto sm:inline-flex sm:min-h-11 sm:text-[11px]"
          onClick={() =>
            addItem({
              productId: id,
              slug,
              name,
              image,
              size: firstSize,
              priceInPaise,
            })
          }
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? "var(--accent)" : "none"}
      stroke={filled ? "var(--accent)" : "currentColor"}
      strokeWidth="1.8"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}
