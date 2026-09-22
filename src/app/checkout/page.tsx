"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function CheckoutPage() {
  const { items, subtotalPaise, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 pb-24 pt-28 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Checkout
        </h1>
        <p className="mt-4 text-[var(--ink)]/60">Your cart is empty.</p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: String(form.get("customerName") || ""),
      customerEmail: String(form.get("customerEmail") || ""),
      customerPhone: String(form.get("customerPhone") || ""),
      addressLine1: String(form.get("addressLine1") || ""),
      addressLine2: String(form.get("addressLine2") || ""),
      city: String(form.get("city") || ""),
      state: String(form.get("state") || ""),
      pincode: String(form.get("pincode") || ""),
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      if (data.mode === "demo") {
        clearCart();
        router.push(`/order/${data.orderId}`);
        return;
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay failed to load");
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "Akruti Home Decor",
        description: "Order payment",
        order_id: data.razorpayOrderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verify = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              ...response,
            }),
          });
          const verified = await verify.json();
          if (!verify.ok) {
            setError(verified.error || "Payment verification failed");
            setLoading(false);
            return;
          }
          clearCart();
          router.push(`/order/${data.orderId}`);
        },
        prefill: {
          name: payload.customerName,
          email: payload.customerEmail,
          contact: payload.customerPhone,
        },
        theme: { color: "#b8860b" },
      });
      rzp.open();
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-4xl">
          Checkout
        </h1>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_300px]">
          <form onSubmit={onSubmit} className="space-y-4">
            {(
              [
                ["customerName", "Full name", "text"],
                ["customerEmail", "Email", "email"],
                ["customerPhone", "Phone", "tel"],
                ["addressLine1", "Address line 1", "text"],
                ["addressLine2", "Address line 2 (optional)", "text"],
                ["city", "City", "text"],
                ["state", "State", "text"],
                ["pincode", "PIN code", "text"],
              ] as const
            ).map(([name, label, type]) => (
              <label key={name} className="block text-sm">
                <span className="mb-1.5 block text-[var(--ink)]/70">{label}</span>
                <input
                  name={name}
                  type={type}
                  required={name !== "addressLine2"}
                  className="w-full border border-[var(--ink)]/20 bg-transparent px-3 py-2.5 outline-none focus:border-[var(--ochre)]"
                />
              </label>
            ))}

            {error && <p className="text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-[var(--ink)] py-3.5 text-sm text-white transition hover:bg-[var(--ochre)] disabled:opacity-50"
            >
              {loading ? "Processing…" : `Pay ${formatINR(subtotalPaise)}`}
            </button>
            <p className="text-xs text-[var(--ink)]/50">
              Without Razorpay keys, orders complete in demo mode.
            </p>
          </form>

          <aside className="h-fit border border-[var(--ink)]/10 bg-[var(--sand)]/40 p-6 text-sm">
            <p className="font-[family-name:var(--font-display)] text-lg">
              Order summary
            </p>
            <ul className="mt-4 space-y-2">
              {items.map((i) => (
                <li
                  key={`${i.productId}-${i.size}`}
                  className="flex justify-between gap-2"
                >
                  <span>
                    {i.name} × {i.quantity}
                  </span>
                  <span>{formatINR(i.priceInPaise * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-[var(--ink)]/10 pt-4 font-medium">
              <span>Total</span>
              <span>{formatINR(subtotalPaise)}</span>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
