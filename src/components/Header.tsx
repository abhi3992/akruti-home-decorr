"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { useWishlist } from "./WishlistProvider";
import { Logo } from "./Logo";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Our Story" },
  { href: "/reviews", label: "Reviews" },
];

export function Header({ logoSrc }: { logoSrc?: string }) {
  const { itemCount } = useCart();
  const { count: wishCount } = useWishlist();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-sm">
      <div className="container-x flex items-center justify-between gap-3 py-2.5 sm:gap-4 sm:py-3">
        <Logo priority size="md" src={logoSrc} />

        {/* Desktop nav from lg up — tablets use the hamburger */}
        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              prefetch
              className="text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/wishlist"
            prefetch
            className="text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--ink)]"
          >
            Wishlist{wishCount > 0 ? ` (${wishCount})` : ""}
          </Link>
          <Link
            href="/cart"
            prefetch
            className="text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--ink)]"
          >
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
        </nav>

        <div className="flex items-center gap-1 lg:hidden">
          <Link
            href="/wishlist"
            className="inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-[11px] uppercase tracking-[0.12em] text-[var(--ink)]"
          >
            Wish{wishCount > 0 ? ` (${wishCount})` : ""}
          </Link>
          <Link
            href="/cart"
            className="inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-[11px] uppercase tracking-[0.12em] text-[var(--ink)]"
          >
            Cart{itemCount > 0 ? ` (${itemCount})` : ""}
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-[11px] uppercase tracking-[0.12em]"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--line)] bg-[var(--surface)] lg:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center text-sm uppercase tracking-[0.12em]"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center text-sm uppercase tracking-[0.12em]"
            >
              Wishlist ({wishCount})
            </Link>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center text-sm uppercase tracking-[0.12em]"
            >
              Cart ({itemCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
