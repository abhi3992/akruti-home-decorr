"use client";

import { useMemo } from "react";
import { useCart } from "./CartProvider";
import { PresenceSync, useWishlist } from "./WishlistProvider";

/** Keeps server-side cart/wishlist presence in sync for admin traffic stats. */
export function AnalyticsPresenceBridge() {
  const { items: cart } = useCart();
  const { items: wish } = useWishlist();
  const cartIds = useMemo(
    () => [...new Set(cart.map((i) => i.productId))],
    [cart]
  );
  const wishIds = useMemo(
    () => [...new Set(wish.map((i) => i.productId))],
    [wish]
  );
  return <PresenceSync cartProductIds={cartIds} wishlistProductIds={wishIds} />;
}
