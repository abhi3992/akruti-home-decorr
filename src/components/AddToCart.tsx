"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { formatINR } from "@/lib/utils";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    priceInPaise: number;
    stock: number;
  };
  image: string;
  sizes: string[];
};

export function AddToCart({ product, image, sizes }: Props) {
  const { addItem } = useCart();
  const [size, setSize] = useState(sizes[0] || "4-5Y");
  const [added, setAdded] = useState(false);

  function onAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      size,
      priceInPaise: product.priceInPaise,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--ink)]/50">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`min-w-16 border px-3 py-2 text-sm transition ${
                size === s
                  ? "border-[var(--ochre)] bg-[var(--ochre)] text-white"
                  : "border-[var(--ink)]/20 text-[var(--ink)] hover:border-[var(--ochre)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
        {formatINR(product.priceInPaise)}
      </p>

      <button
        type="button"
        onClick={onAdd}
        disabled={product.stock < 1}
        className="w-full bg-[var(--ink)] px-6 py-3.5 text-sm tracking-wide text-white transition hover:bg-[var(--ochre)] disabled:opacity-40"
      >
        {product.stock < 1 ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
      </button>
    </div>
  );
}
