import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--ink)]/10 bg-[var(--sand-deep)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Akruti Home Decor
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--ink)]/70">
            Hand-printed kids robes and home textiles, crafted for everyday
            comfort with a playful artisanal spirit.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-[var(--ink)]/80">
          <Link href="/shop" className="hover:text-[var(--ochre)]">
            Shop
          </Link>
          <Link href="/about" className="hover:text-[var(--ochre)]">
            About
          </Link>
          <Link href="/admin" className="hover:text-[var(--ochre)]">
            Admin
          </Link>
        </div>
      </div>
      <div className="border-t border-[var(--ink)]/10 px-5 py-4 text-center text-xs text-[var(--ink)]/50">
        © {new Date().getFullYear()} Akruti Home Decor
      </div>
    </footer>
  );
}
