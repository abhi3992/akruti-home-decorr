import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-8">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink)]/50">
        Our background
      </p>
      <h1 className="mt-2 max-w-2xl font-[family-name:var(--font-display)] text-4xl md:text-5xl">
        Akruti Home Decor
      </h1>

      <div className="mt-12 grid gap-10 md:grid-cols-2 md:items-start">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src="/products/berry-elephant.png"
            alt="Akruti product"
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 50vw"
          />
        </div>
        <div className="space-y-5 text-[var(--ink)]/80 leading-relaxed">
          <p>
            At Akruti Home Decor, we craft home textiles and kids loungewear
            with personality — soft cottons, cheerful prints, and finishes that
            feel thoughtfully made.
          </p>
          <p>
            Our kids robe collection pairs absorbent waffle and quilted kantha
            fabrics with playful motifs: elephants, balloons, dinosaurs, and
            seaside dreams. Each piece is designed to look as good hanging by
            the bath as it feels wrapped up after.
          </p>
          <p>
            We believe everyday comfort can still be beautiful. Shop with us
            for gifts, gifting sets, and pieces that grow with your home.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-[var(--ink)] px-6 py-3 text-sm text-white transition hover:bg-[var(--ochre)]"
          >
            Explore the shop
          </Link>
        </div>
      </div>
    </div>
  );
}
