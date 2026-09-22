"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotalPaise } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 text-center md:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          Your cart
        </h1>
        <p className="mt-4 text-[var(--ink)]/60">Cart is empty.</p>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-[var(--ink)] px-6 py-3 text-sm text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-4xl">
        Your cart
      </h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-6">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 border-b border-[var(--ink)]/10 pb-6"
            >
              <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-[var(--sand)]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-[family-name:var(--font-display)] text-lg"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-[var(--ink)]/60">
                      Size {item.size}
                    </p>
                  </div>
                  <p className="text-sm">
                    {formatINR(item.priceInPaise * item.quantity)}
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-4 pt-3">
                  <div className="flex items-center border border-[var(--ink)]/20">
                    <button
                      type="button"
                      className="px-3 py-1"
                      onClick={() =>
                        updateQty(item.productId, item.size, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1"
                      onClick={() =>
                        updateQty(item.productId, item.size, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-[var(--ink)]/50 hover:text-[var(--ochre)]"
                    onClick={() => removeItem(item.productId, item.size)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit border border-[var(--ink)]/10 bg-[var(--sand)]/40 p-6">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatINR(subtotalPaise)}</span>
          </div>
          <p className="mt-2 text-xs text-[var(--ink)]/50">
            Shipping calculated at checkout.
          </p>
          <Link
            href="/checkout"
            className="mt-6 block bg-[var(--ink)] py-3.5 text-center text-sm text-white transition hover:bg-[var(--ochre)]"
          >
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
