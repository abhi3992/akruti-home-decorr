import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productImages, productSizes } from "@/lib/utils";
import { AddToCart } from "@/components/AddToCart";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product?.name || "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const images = productImages(product.images);
  const sizes = productSizes(product.sizes);
  const main = images[0] || "/products/sky-voyage.png";

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-24 pt-28 md:grid-cols-2 md:gap-16 md:px-8">
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--sand)]">
        <Image
          src={main}
          alt={product.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width:768px) 100vw, 50vw"
        />
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink)]/50">
          {product.fabric}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl md:text-5xl">
          {product.name}
        </h1>
        <p className="mt-5 max-w-md leading-relaxed text-[var(--ink)]/75">
          {product.description}
        </p>
        <div className="mt-8">
          <AddToCart product={product} image={main} sizes={sizes} />
        </div>
      </div>
    </div>
  );
}
