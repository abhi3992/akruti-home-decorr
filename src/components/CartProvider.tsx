"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { normalizeCustomName } from "@/lib/name-print";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  priceInPaise: number;
  quantity: number;
  /** Name-print text on towels/bathrobes; empty when not opted in */
  customName?: string;
  /** flat | elastic | deep for bedsheets */
  sheetFit?: string;
  /** Mattress length × width × height for fitted sheets */
  mattress?: string;
};

type CartLineKey = {
  productId: string;
  size: string;
  customName?: string;
  sheetFit?: string;
  mattress?: string;
};

function lineKey(item: CartLineKey) {
  return `${item.productId}::${item.size}::${normalizeCustomName(item.customName)}::${item.sheetFit || ""}::${item.mattress || ""}`;
}

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (
    productId: string,
    size: string,
    customName?: string,
    sheetFit?: string,
    mattress?: string
  ) => void;
  updateQty: (
    productId: string,
    size: string,
    quantity: number,
    customName?: string,
    sheetFit?: string,
    mattress?: string
  ) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalPaise: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "akruti-cart-v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(
          parsed.map((i) => ({
            ...i,
            customName: normalizeCustomName(i.customName),
          }))
        );
      }
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
      const customName = normalizeCustomName(item.customName);
      const incoming = {
        ...item,
        customName,
        sheetFit: item.sheetFit || "",
        mattress: item.mattress || "",
      };
      setItems((prev) => {
        const idx = prev.findIndex((p) => lineKey(p) === lineKey(incoming));
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + qty,
            priceInPaise: incoming.priceInPaise,
          };
          return next;
        }
        return [...prev, { ...incoming, quantity: qty }];
      });
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, size: string, customName?: string, sheetFit?: string, mattress?: string) => {
      const key = lineKey({ productId, size, customName, sheetFit, mattress });
      setItems((prev) => prev.filter((p) => lineKey(p) !== key));
    },
    []
  );

  const updateQty = useCallback(
    (
      productId: string,
      size: string,
      quantity: number,
      customName?: string,
      sheetFit?: string,
      mattress?: string
    ) => {
      const key = lineKey({ productId, size, customName, sheetFit, mattress });
      setItems((prev) =>
        prev
          .map((p) =>
            lineKey(p) === key ? { ...p, quantity } : p
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
