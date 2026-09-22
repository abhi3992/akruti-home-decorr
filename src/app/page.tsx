import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { featured: true },
    take: 4,
    orderBy: { name: "asc" },
  });

  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 hero-grain" />
        <Image
          src="/products/sky-voyage.png"
          alt="Akruti kids robe"
          fill
          priority
          className="object-cover object-[70%_center] opacity-90 animate-fade-in"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--sand)]/90 via-[var(--sand)]/55 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-8 md:pb-24">
          <p className="animate-fade-up text-xs uppercase tracking-[0.22em] text-[var(--ink)]/60">
            Kids robes · Hand-printed cotton
          </p>
          <h1 className="animate-fade-up mt-3 max-w-xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] text-[var(--ink)] md:text-7xl"
            style={{ animationDelay: "120ms" }}
          >
            Akruti Home Decor
          </h1>
          <p
            className="animate-fade-up mt-4 max-w-md text-base leading-relaxed text-[var(--ink)]/75 md:text-lg"
            style={{ animationDelay: "220ms" }}
          >
            Soft waffle and kantha robes with playful prints — made for little
            mornings and quiet evenings.
          </p>
          <div
            className="animate-fade-up mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "320ms" }}
          >
            <Link
              href="/shop"
              className="bg-[var(--ink)] px-7 py-3.5 text-sm tracking-wide text-white transition hover:bg-[var(--ochre)]"
            >
              Shop the collection
            </Link>
            <Link
              href="/about"
              className="border border-[var(--ink)]/25 bg-white/40 px-7 py-3.5 text-sm tracking-wide text-[var(--ink)] backdrop-blur transition hover:border-[var(--ochre)]"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink)]/50">
              New arrival
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-4xl">
              Featured robes
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-sm text-[var(--ochre)] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} {...p} index={i} />
          ))}
        </div>
      </section>

      <section className="bg-[var(--sand-deep)]/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/products/jungle-kantha.png"
              alt="Kantha robe detail"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink)]/50">
              About us
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-4xl">
              Prints with personality
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-[var(--ink)]/75">
              Akruti Home Decor brings artisanal textile craft into kids&apos;
              everyday wear — absorbent cottons, cheerful motifs, and careful
              finishing you can feel.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block text-sm text-[var(--ochre)] hover:underline"
            >
              Read more
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink)]/50">
          Customer reviews
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">
          Hear from them
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Just right",
              body: "The waffle robe is so soft and the print looks exactly like the photos. Fast delivery too.",
            },
            {
              title: "Gift hit",
              body: "Bought the kantha jungle print for my niece — she refuses to take it off after bath time.",
            },
            {
              title: "Quality stitch",
              body: "Trim and pockets feel sturdy. Finally kids loungewear that looks curated, not cartoonish.",
            },
          ].map((r) => (
            <blockquote
              key={r.title}
              className="border-t border-[var(--ink)]/15 pt-6"
            >
              <p className="font-[family-name:var(--font-display)] text-xl">
                {r.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]/70">
                {r.body}
              </p>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}
