import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ShopCatalog } from "@/components/ShopCatalog";
import { getCatalog } from "@/lib/catalog";

/** Long ISR window — served from CDN; admin edits still bust cache via revalidatePath */
export const revalidate = 3600;
export const metadata = { title: "Shop" };

export default async function ShopPage() {
  const [products, catalog] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        priceInPaise: true,
        images: true,
        fabric: true,
        sizes: true,
        category: true,
        subcategory: true,
      },
    }),
    getCatalog(),
  ]);

  return (
    <div className="container-x pb-16 pt-8 sm:pb-20 sm:pt-10 md:pt-12">
      <div className="mb-6 sm:mb-8">
        <p className="eyebrow">Collection</p>
        <h1 className="section-title mt-2">Shop all</h1>
      </div>

      <Suspense
        fallback={
          <p className="py-8 text-sm text-[var(--muted)]">Loading shop…</p>
        }
      >
        <ShopCatalog products={products} catalog={catalog} />
      </Suspense>
    </div>
  );
}
