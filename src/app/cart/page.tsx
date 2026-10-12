"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatINR, isExternalImage } from "@/lib/utils";
import { normalizeCustomName } from "@/lib/name-print";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotalPaise } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-x pb-16 pt-8 text-center sm:pb-20 sm:pt-10 md:pt-14">
        <h1 className="section-title">Your cart</h1>
        <p className="mt-4 text-[var(--muted)]">Cart is empty.</p>
        <Link href="/shop" className="btn btn-dark mt-8 inline-flex min-h-12 w-full sm:w-auto">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x pb-16 pt-8 sm:pb-20 sm:pt-10 md:pt-14">
      <h1 className="section-title">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[1fr_300px] lg:gap-12 xl:grid-cols-[1fr_320px]">
        <ul className="space-y-5 sm:space-y-6">
          {items.map((item) => {
            const custom = normalizeCustomName(item.customName);
            return (
              <li
                key={`${item.productId}-${item.size}-${custom}`}
                className="flex gap-3 border-b border-[var(--line)] pb-5 sm:gap-4 sm:pb-6"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--bg)] sm:h-28 sm:w-24">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized={isExternalImage(item.image)}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-[family-name:var(--font-display)] text-base leading-snug hover:text-[var(--accent)] sm:text-lg"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-[var(--muted)]">
                        Size {item.size}
                        {item.sheetFit === "elastic"
                          ? " · Elastic fitted"
                          : item.sheetFit === "deep"
                            ? " · Deep Elastic Fitted"
                            : item.sheetFit === "flat"
                              ? " · Flat bedsheet"
                              : ""}
                        {item.mattress ? ` · Mattress ${item.mattress}` : ""}
                      </p>
                      {custom ? (
                        <p className="mt-0.5 text-sm text-[var(--accent)]">
                          Name customisation: “{custom}”
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-sm">
                      {formatINR(item.priceInPaise * item.quantity)}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-3 sm:gap-4">
                    <div className="flex items-center border border-[var(--line)]">
                      <button
                        type="button"
                        className="flex min-h-10 min-w-10 items-center justify-center"
                        onClick={() =>
                          updateQty(
                            item.productId,
                            item.size,
                            item.quantity - 1,
                            custom,
                            item.sheetFit,
                            item.mattress
                          )
                        }
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="flex min-h-10 min-w-10 items-center justify-center"
                        onClick={() =>
                          updateQty(
                            item.productId,
                            item.size,
                            item.quantity + 1,
                            custom,
                            item.sheetFit,
                            item.mattress
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="min-h-10 text-sm text-[var(--muted)] hover:text-[var(--accent)]"
                      onClick={() =>
                        removeItem(item.productId, item.size, custom, item.sheetFit, item.mattress)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatINR(subtotalPaise)}</span>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Shipping confirmed when we pack your order.
          </p>
          <Link
            href="/checkout"
            className="btn btn-dark mt-6 flex min-h-12 w-full items-center justify-center"
          >
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
