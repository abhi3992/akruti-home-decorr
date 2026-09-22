import Link from "next/link";
import Image from "next/image";
import { formatINR, productImages } from "@/lib/utils";

type ProductCardProps = {
  name: string;
  slug: string;
  priceInPaise: number;
  images: string;
  fabric: string;
  index?: number;
};

export function ProductCard({
  name,
  slug,
  priceInPaise,
  images,
  fabric,
  index = 0,
}: ProductCardProps) {
  const image = productImages(images)[0] || "/products/sky-voyage.png";

  return (
    <Link
      href={`/product/${slug}`}
      className="group product-card block"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--sand)]">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink)]/50">
          {fabric}
        </p>
        <h3 className="font-[family-name:var(--font-display)] text-lg leading-snug text-[var(--ink)]">
          {name}
        </h3>
        <p className="text-sm text-[var(--ink)]/80">{formatINR(priceInPaise)}</p>
      </div>
    </Link>
  );
}
