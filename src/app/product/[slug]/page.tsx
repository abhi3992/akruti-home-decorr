import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productImages, productSizes } from "@/lib/utils";
import { AddToCart } from "@/components/AddToCart";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDescription } from "@/components/ProductDescription";
import { ProductActions } from "@/components/ProductActions";
import { ProductReviews } from "@/components/ProductReviews";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true },
      take: 100,
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product?.name || "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
  });
  if (!product) notFound();

  const images = productImages(product.images);
  const sizes = productSizes(product.sizes);
  const main = images[0] || "/products/sky-voyage.jpg";
  const reviews = await prisma.review.findMany({
    where: { productId: product.id },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return (
    <>
    <div className="container-x grid gap-8 pb-10 pt-8 sm:gap-10 sm:pt-10 md:grid-cols-2 md:gap-12 md:pt-12 lg:gap-14">
      <ProductGallery name={product.name} images={images} />

      <div className="flex flex-col justify-center">
        <p className="eyebrow">{product.fabric}</p>
        <h1 className="section-title mt-2">{product.name}</h1>
        <ProductDescription text={product.description} />
        <div className="mt-6 sm:mt-8">
          <AddToCart product={product} image={main} sizes={sizes} />
          <ProductActions
            productId={product.id}
            slug={product.slug}
            name={product.name}
            image={main}
            priceInPaise={product.priceInPaise}
          />
        </div>
      </div>
    </div>
    <ProductReviews
      productId={product.id}
      initial={reviews.map((review) => ({
        id: review.id,
        author: review.author,
        rating: review.rating,
        body: review.body,
        image: review.image || "",
        createdAt: review.createdAt.toISOString(),
      }))}
    />
    </>
  );
}
