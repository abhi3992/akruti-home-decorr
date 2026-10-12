import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";
import { displayOrderRef } from "@/lib/order-number";
import { CustomerReviewForm } from "@/components/CustomerReviewForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function findOrder(ref: string) {
  const decoded = decodeURIComponent(ref);
  const byNumber = await prisma.order.findUnique({
    where: { orderNumber: decoded },
    include: { items: { include: { product: true } } },
  });
  if (byNumber) return byNumber;
  return prisma.order.findUnique({
    where: { id: decoded },
    include: { items: { include: { product: true } } },
  });
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params;
  const order = await findOrder(id);
  if (!order) notFound();

  const ref = displayOrderRef(order);

  return (
    <div className="container-x max-w-2xl pb-16 pt-8 sm:pb-20 sm:pt-10 md:pt-14">
      <p className="eyebrow">Thank you</p>
      <h1 className="section-title mt-2">Order confirmed</h1>
      <p className="mt-3 break-words text-sm text-[var(--muted)] sm:text-base">
        Order{" "}
        <span className="font-medium text-[var(--ink)]">{ref}</span> · Status:{" "}
        {order.status.replace(/_/g, " ")}
      </p>

      {(order.trackingId || order.trackingUrl) && (
        <div className="mt-6 border border-[var(--line)] bg-[var(--surface)] p-4 text-sm">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">
            Shipment tracking
          </p>
          {order.trackingId ? (
            <p className="mt-2">
              Tracking ID:{" "}
              <span className="font-medium text-[var(--ink)]">
                {order.trackingId}
              </span>
            </p>
          ) : null}
          {order.trackingUrl ? (
            <p className="mt-1">
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Track your shipment
              </a>
            </p>
          ) : null}
        </div>
      )}

      <ul className="mt-8 space-y-3 border-y border-[var(--line)] py-6">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between"
          >
            <span>
              {item.product.name} · {item.size}
              {item.sheetFit === "elastic"
                ? " · Elastic fitted"
                : item.sheetFit === "deep"
                  ? " · Deep Elastic Fitted"
                  : item.sheetFit === "flat"
                    ? " · Flat bedsheet"
                    : ""}
              {item.mattress ? ` · Mattress ${item.mattress}` : ""}
              {item.customName ? ` · Name: “${item.customName}”` : ""} ×{" "}
              {item.quantity}
            </span>
            <span className="shrink-0 font-medium sm:font-normal">
              {formatINR(item.unitPricePaise * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between font-medium">
        <span>Total</span>
        <span>{formatINR(order.totalInPaise)}</span>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">
        We&apos;ll ship to {order.addressLine1}
        {order.addressLine2 ? `, ${order.addressLine2}` : ""}, {order.city},{" "}
        {order.state} {order.pincode}.
      </p>
      <p className="mt-2 break-words text-sm text-[var(--muted)]">
        Contact: {order.customerPhone} · {order.customerEmail}
      </p>
      <p className="mt-4 text-sm text-[var(--muted)]">
        A confirmation email has been sent to{" "}
        <span className="text-[var(--ink)]">{order.customerEmail}</span> (if
        email delivery is enabled for the store).
      </p>

      <div className="mt-10 space-y-8 border-t border-[var(--line)] pt-8">
        <div>
          <p className="eyebrow">Your order</p>
          <h2 className="section-title mt-2 text-[1.6rem]">Leave a review</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Your order number and email are filled in. Share how the piece felt at home.
          </p>
        </div>
        {Array.from(
          new Map(order.items.map((item) => [item.productId, item])).values()
        ).map((item) => (
          <CustomerReviewForm
            key={item.productId}
            productId={item.productId}
            productName={item.product.name}
            defaultOrderNumber={ref}
            defaultEmail={order.customerEmail}
            defaultAuthor={order.customerName}
          />
        ))}
      </div>

      <Link href="/shop" className="btn btn-dark mt-10 inline-flex min-h-12 w-full sm:w-auto">
        Continue shopping
      </Link>
    </div>
  );
}
