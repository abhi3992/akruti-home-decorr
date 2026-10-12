"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { syncPresence } from "@/lib/analytics-client";

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceInPaise: number;
};

type WishlistContextValue = {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
  count: number;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "akruti-wishlist-v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.productId === item.productId);
      return exists
        ? prev.filter((p) => p.productId !== item.productId)
        : [...prev, item];
    });
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const has = useCallback(
    (productId: string) => items.some((p) => p.productId === productId),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      toggle,
      remove,
      has,
      clear,
      count: items.length,
    }),
    [items, toggle, remove, has, clear]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

/** Sync cart + wishlist presence to the server for admin traffic stats. */
export function PresenceSync({
  cartProductIds,
  wishlistProductIds,
}: {
  cartProductIds: string[];
  wishlistProductIds: string[];
}) {
  const cartKey = cartProductIds.slice().sort().join(",");
  const wishKey = wishlistProductIds.slice().sort().join(",");
  useEffect(() => {
    syncPresence(cartProductIds, wishlistProductIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, wishKey]);
  return null;
}
