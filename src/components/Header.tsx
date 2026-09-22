"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
];

export function Header() {
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl tracking-tight text-[var(--ink)] md:text-2xl"
        >
          Akruti Home Decor
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm tracking-wide text-[var(--ink)]/80 transition hover:text-[var(--ochre)]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="relative text-sm tracking-wide text-[var(--ink)]"
          >
            Cart
            {itemCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ochre)] px-1 text-[11px] font-medium text-white">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden text-sm text-[var(--ink)]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--ink)]/10 bg-[var(--sand)]/95 px-5 py-4 backdrop-blur md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-[var(--ink)]"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setOpen(false)}>
              Cart ({itemCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
