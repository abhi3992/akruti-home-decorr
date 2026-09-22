"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  priceInPaise: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalPaise: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "akruti-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
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

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, qty = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex(
          (p) => p.productId === item.productId && p.size === item.size
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + qty,
          };
          return next;
        }
        return [...prev, { ...item, quantity: qty }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((prev) =>
      prev.filter((p) => !(p.productId === productId && p.size === size))
    );
  }, []);

  const updateQty = useCallback(
    (productId: string, size: string, quantity: number) => {
      setItems((prev) =>
        prev
          .map((p) =>
            p.productId === productId && p.size === size
              ? { ...p, quantity }
              : p
          )
          .filter((p) => p.quantity > 0)
      );
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const itemCount = items.reduce((s, i) => s + i.quantity, 0);
    const subtotalPaise = items.reduce(
      (s, i) => s + i.priceInPaise * i.quantity,
      0
    );
    return {
      items,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      itemCount,
      subtotalPaise,
    };
  }, [items, addItem, removeItem, updateQty, clearCart]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
