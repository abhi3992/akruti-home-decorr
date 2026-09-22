import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { ShopFilters } from "@/components/ShopFilters";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

type SearchParams = Promise<{ fabric?: string; size?: string }>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });

  const filtered = products.filter((p) => {
    if (params.fabric && p.fabric !== params.fabric) return false;
    if (params.size) {
      try {
        const sizes: string[] = JSON.parse(p.sizes);
        if (!sizes.includes(params.size)) return false;
      } catch {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-8">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink)]/50">
          Collection
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl md:text-5xl">
          Shop robes
        </h1>
      </div>

      <ShopFilters
        fabric={params.fabric}
        size={params.size}
        count={filtered.length}
      />

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6">
        {filtered.map((p, i) => (
          <ProductCard key={p.id} {...p} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center text-[var(--ink)]/60">
          No products match these filters.
        </p>
      )}
    </div>
  );
}
