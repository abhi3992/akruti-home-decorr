import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteImages, getSiteContent } from "@/lib/site-settings";
import { isExternalImage } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 3600;

export default async function HomePage() {
  const [products, images, content] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      take: 8,
    }),
    getSiteImages(),
    getSiteContent(),
  ]);
  const loved = products.filter((p) => p.featured).slice(0, 4);
  const rest = products.slice(0, 4);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[var(--ink)]">
        {/* Match desktop photo framing (≈16:9) so the full AKRUTI mark stays in view */}
        <div className="relative aspect-[16/9] w-full md:aspect-auto md:min-h-[78svh]">
          <Image
            src={images.heroImage}
            alt="Akruti handblock textiles"
            fill
            priority
            quality={88}
            className="object-cover object-[50%_42%]"
            sizes="100vw"
            unoptimized={isExternalImage(images.heroImage)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent md:bg-gradient-to-r md:from-black/65 md:via-black/35 md:to-transparent" />
          {/* Keep copy on the LEFT so it never sits on the logo painted on the right */}
          <div className="container-x absolute inset-0 z-10 flex flex-col justify-end pb-5 pt-8 sm:pb-7 md:justify-center md:pb-24 md:pt-20">
            <div className="max-w-[58%] sm:max-w-md md:max-w-xl">
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/85 sm:text-[10px] md:text-[11px] md:tracking-[0.2em]">
                {content.heroEyebrow}
              </p>
              <h1 className="mt-1.5 font-[family-name:var(--font-display)] text-[1.25rem] leading-[1.15] text-white sm:mt-2 sm:text-3xl md:mt-4 md:text-6xl">
                {content.heroTitle}
              </h1>
              <p className="mt-1.5 hidden text-sm leading-relaxed text-white/90 sm:mt-2 sm:block md:mt-4 md:text-base">
                {content.heroSubtitle}
              </p>
              <div className="mt-3 flex flex-row items-center gap-2 sm:mt-5 sm:gap-3 md:mt-8">
                <Link
                  href="/shop"
                  className="btn btn-dark min-h-9 px-3 py-2 text-center text-[9px] tracking-[0.1em] text-[var(--ink)] bg-white hover:bg-[var(--accent)] hover:text-white sm:min-h-10 sm:px-4 sm:text-[11px] md:min-h-12 md:px-6 md:text-[0.8rem]"
                >
                  Shop collection
                </Link>
                <Link
                  href="/about"
                  className="btn min-h-9 border border-white/90 px-3 py-2 text-center text-[9px] tracking-[0.1em] text-white hover:bg-white hover:text-[var(--ink)] sm:min-h-10 sm:px-4 sm:text-[11px] md:min-h-12 md:px-6 md:text-[0.8rem]"
                >
                  Our story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-12 sm:py-14 md:py-20">
        <div className="mb-5 flex items-end justify-between gap-3 md:mb-8">
          <div className="min-w-0">
            <p className="eyebrow">Most loved</p>
            <h2 className="section-title mt-1.5 text-[1.55rem] sm:text-[1.75rem] md:mt-2 md:text-[length:inherit]">
              Customer favourites
            </h2>
          </div>
          <Link
            href="/shop"
            className="shrink-0 pb-0.5 text-xs text-[var(--accent)] hover:underline md:text-sm"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 md:gap-5">
          {(loved.length ? loved : rest).map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </section>

      <section className="bg-[var(--bg)] py-10 sm:py-12 md:py-20">
        <div className="container-x grid items-center gap-6 md:grid-cols-2 md:gap-14">
          <div className="relative -mx-4 aspect-[4/5] overflow-hidden bg-[var(--line)] sm:mx-0 sm:aspect-[3/4]">
            <Image
              src={images.homeStoryImage}
              alt="Akruti handblock textile"
              fill
              quality={80}
              className="object-cover object-center"
              sizes="(max-width:768px) 100vw, 50vw"
              unoptimized={isExternalImage(images.homeStoryImage)}
            />
          </div>
          <div className="prose-story space-y-3.5 md:space-y-5">
            <p className="eyebrow">{content.homeStoryEyebrow}</p>
            <h2 className="section-title text-[1.55rem] sm:text-[1.75rem]">
              {content.homeStoryTitle}{" "}
              <span className="italic text-[var(--accent)]">
                {content.homeStoryTitleAccent}
              </span>
            </h2>
            <p>{content.homeStoryP1}</p>
            <p className="pull text-[1.1rem] md:text-[1.25rem]">
              {content.homeStoryPull}
            </p>
            <p className="hidden sm:block">{content.homeStoryP2}</p>
            <Link href="/about" className="btn btn-outline mt-2 w-full sm:w-auto">
              Read our full story
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--surface)]">
        <div className="container-x py-10 sm:py-12 md:py-20">
          <div className="mb-5 flex items-end justify-between gap-3 md:mb-8">
            <div className="min-w-0">
              <p className="eyebrow">Shop</p>
              <h2 className="section-title mt-1.5 text-[1.55rem] sm:text-[1.75rem]">
                New from the workshop
              </h2>
            </div>
            <Link
              href="/shop"
              className="shrink-0 text-xs text-[var(--accent)] hover:underline md:text-sm"
            >
              Browse all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 md:gap-5">
            {rest.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--bg)] py-10 sm:py-12 md:py-20">
        <div className="container-x grid items-center gap-6 md:grid-cols-2 md:gap-14">
          <div className="relative -mx-4 order-1 aspect-[4/5] overflow-hidden bg-[var(--line)] sm:mx-0 sm:aspect-[3/4] md:order-2">
            <Image
              src={images.founderImage}
              alt="Shruti Koolwal, Founder of Akruti Home Decor"
              fill
              quality={90}
              className="object-cover object-[center_15%]"
              sizes="(max-width:768px) 100vw, 50vw"
              unoptimized={isExternalImage(images.founderImage)}
            />
          </div>
          <div className="prose-story order-2 space-y-3.5 md:order-1 md:space-y-5">
            <p className="eyebrow">{content.founderEyebrow}</p>
            <h2 className="section-title text-[1.55rem] sm:text-[1.75rem]">
              {content.founderTitle}{" "}
              <span className="italic text-[var(--accent)]">
                {content.founderTitleAccent}
              </span>
            </h2>
            <p>{content.founderP1}</p>
            <p className="hidden sm:block">{content.founderP2}</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {content.founderTagline}
            </p>
            <Link
              href="/about#founder"
              className="btn btn-outline mt-1 w-full sm:w-auto"
            >
              Meet Shruti
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-10 text-center sm:py-12 md:py-14">
        <div className="container-x max-w-2xl">
          <h2 className="section-title text-[1.55rem] sm:text-[1.75rem]">
            {content.ctaTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:mt-4 md:text-base">
            {content.ctaBody}
          </p>
          <Link
            href="/shop"
            className="btn btn-dark mt-6 min-h-12 w-full sm:mt-8 sm:w-auto"
          >
            Shop now
          </Link>
        </div>
      </section>
    </>
  );
}
