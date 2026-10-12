"use client";

import { useEffect } from "react";
import { trackProductView } from "@/lib/analytics-client";
import { useWishlist } from "./WishlistProvider";

type Props = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceInPaise: number;
};

export function ProductActions({
  productId,
  slug,
  name,
  image,
  priceInPaise,
}: Props) {
  const { toggle, has } = useWishlist();
  const wished = has(productId);

  useEffect(() => {
    trackProductView(productId);
  }, [productId]);

  return (
    <button
      type="button"
      className="btn btn-outline mt-3 w-full sm:w-auto"
      aria-pressed={wished}
      onClick={() =>
        toggle({ productId, slug, name, image, priceInPaise })
      }
    >
      {wished ? "Saved in wishlist" : "Add to wishlist"}
    </button>
  );
}
