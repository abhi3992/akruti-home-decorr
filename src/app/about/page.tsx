import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getSiteImages, getSiteContent } from "@/lib/site-settings";
import { isExternalImage } from "@/lib/utils";

export const metadata = { title: "Our Story" };
export const revalidate = 3600;

export default async function AboutPage() {
  const [images, content] = await Promise.all([
    getSiteImages(),
    getSiteContent(),
  ]);

  return (
    <>
      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-8 md:py-12">
        <div className="container-x flex flex-col items-center px-1 text-center">
          <Logo href={null} size="lg" src={images.logoImage} />
          <p className="mt-4 max-w-xl text-sm text-[var(--muted)] md:mt-5 md:text-base">
            {content.aboutIntro}
          </p>
        </div>
      </section>

      <section className="container-x prose-story max-w-3xl space-y-4 py-10 md:space-y-5 md:py-16">
        <p className="eyebrow">{content.aboutEyebrow}</p>
        <h1 className="section-title">
          {content.aboutTitle}{" "}
          <span className="italic text-[var(--accent)]">
            {content.aboutTitleAccent}
          </span>
        </h1>
        <p>{content.aboutP1}</p>
        <p className="pull">{content.aboutPull}</p>
        <p>{content.aboutP2}</p>
        <p>{content.aboutP3}</p>
        <p>{content.aboutP4}</p>
      </section>

      <section
        id="founder"
        className="scroll-mt-24 border-y border-[var(--line)] bg-[var(--bg)] py-12 md:py-16"
      >
        <div className="container-x grid items-center gap-8 md:grid-cols-2 md:gap-14">
          <div className="prose-story space-y-4 md:space-y-5">
            <p className="eyebrow">{content.founderEyebrow}</p>
            <h2 className="section-title">
              {content.founderTitle}{" "}
              <span className="italic text-[var(--accent)]">
                {content.founderTitleAccent}
              </span>
            </h2>
            <p>{content.founderP1}</p>
            <p>{content.founderP2}</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              {content.founderTagline}
            </p>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden bg-[var(--line)]">
            <Image
              src={images.founderImage}
              alt="Shruti Koolwal, Founder of Akruti Home Decor"
              fill
              quality={94}
              className="object-cover object-top"
              sizes="(max-width:768px) 100vw, 50vw"
              unoptimized={isExternalImage(images.founderImage)}
            />
          </div>
        </div>
      </section>

      <section className="py-10 text-center md:py-14">
        <div className="container-x">
          <Link href="/shop" className="btn btn-dark w-full sm:w-auto">
            Shop the collection
          </Link>
        </div>
      </section>
    </>
  );
}
