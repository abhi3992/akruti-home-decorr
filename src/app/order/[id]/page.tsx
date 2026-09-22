import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-28 md:px-8">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--ochre)]">
        Thank you
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl">
        Order confirmed
      </h1>
      <p className="mt-3 text-[var(--ink)]/70">
        Order <span className="font-medium text-[var(--ink)]">{order.id}</span>{" "}
        · Status: {order.status.replace("_", " ")}
      </p>

      <ul className="mt-8 space-y-3 border-y border-[var(--ink)]/10 py-6">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span>
              {item.product.name} · {item.size} × {item.quantity}
            </span>
            <span>{formatINR(item.unitPricePaise * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between font-medium">
        <span>Total</span>
        <span>{formatINR(order.totalInPaise)}</span>
      </div>

      <p className="mt-6 text-sm text-[var(--ink)]/60">
        We&apos;ll ship to {order.addressLine1}, {order.city}, {order.state}{" "}
        {order.pincode}.
      </p>

      <Link
        href="/shop"
        className="mt-10 inline-block bg-[var(--ink)] px-6 py-3 text-sm text-white"
      >
        Continue shopping
      </Link>
    </div>
  );
}
