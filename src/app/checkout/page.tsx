"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/components/CartProvider";
import { formatINR } from "@/lib/utils";

type RazorpayInstance = {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

type PayConfig = {
  mode: "razorpay" | "demo";
  emailEnabled: boolean;
};

export default function CheckoutPage() {
  const { items, subtotalPaise, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [payConfig, setPayConfig] = useState<PayConfig | null>(null);

  useEffect(() => {
    fetch("/api/checkout/config")
      .then((r) => r.json())
      .then((d) =>
        setPayConfig({
          mode: d.mode === "razorpay" ? "razorpay" : "demo",
          emailEnabled: Boolean(d.emailEnabled),
        })
      )
      .catch(() => setPayConfig({ mode: "demo", emailEnabled: false }));
  }, []);

  if (redirecting) {
    return (
      <div className="mx-auto max-w-xl px-5 pb-20 pt-10 text-center md:pt-14">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Confirming order…
        </h1>
        <p className="mt-4 text-[var(--muted)]">Taking you to your receipt.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 pb-20 pt-10 text-center md:pt-14">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Checkout
        </h1>
        <p className="mt-4 text-[var(--muted)]">Your cart is empty.</p>
      </div>
    );
  }

  async function finishOrder(orderId: string) {
    setRedirecting(true);
    clearCart();
    router.replace(`/order/${orderId}`);
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
        customName: i.customName || "",
        sheetFit: i.sheetFit || "",
        mattress: i.mattress || "",
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
        await finishOrder(data.orderId);
        return;
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay failed to load — refresh and try again");
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Akruti Home Decor",
        description: "Order payment",
        order_id: data.razorpayOrderId || data.order_id,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verify = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verified = await verify.json();
            if (!verify.ok) {
              setError(verified.error || "Payment verification failed");
              setLoading(false);
              return;
            }
            await finishOrder(data.orderId);
          } catch {
            setError("Could not verify payment. Contact us with your payment ID.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled. You can try again when ready.");
            setLoading(false);
          },
        },
        prefill: {
          name: payload.customerName,
          email: payload.customerEmail,
          contact: payload.customerPhone,
        },
        theme: { color: "#9a5a3a" },
      });

      rzp.on("payment.failed", (response: unknown) => {
        const detail = response as {
          error?: { description?: string; reason?: string };
        };
        setError(
          detail?.error?.description ||
            detail?.error?.reason ||
            "Payment failed. Please try another method."
        );
        setLoading(false);
      });

      rzp.open();
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const razorpayReady = payConfig?.mode === "razorpay";

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="container-x pb-16 pt-8 sm:pb-20 sm:pt-10 md:pt-14">
        <h1 className="section-title">Checkout</h1>
        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[1fr_300px] lg:gap-12">
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
                <span className="mb-1.5 block text-[var(--muted)]">{label}</span>
                <input
                  name={name}
                  type={type}
                  required={name !== "addressLine2"}
                  className="min-h-11 w-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 outline-none focus:border-[var(--accent)]"
                />
              </label>
            ))}

            {error && <p className="text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark mt-4 min-h-12 w-full disabled:opacity-50"
            >
              {loading
                ? "Processing…"
                : razorpayReady
                  ? `Pay ${formatINR(subtotalPaise)}`
                  : `Place order · ${formatINR(subtotalPaise)}`}
            </button>
            <p className="text-xs text-[var(--muted)]">
              {!payConfig
                ? "Checking payment setup…"
                : razorpayReady
                  ? `Secure payment via Razorpay (UPI, cards, netbanking).${
                      payConfig.emailEnabled
                        ? " Confirmation email after payment."
                        : ""
                    }`
                  : "Demo mode — Razorpay keys missing. Orders still save in Admin."}
            </p>
          </form>

          <aside className="h-fit border border-[var(--line)] bg-[var(--surface)] p-6 text-sm">
            <p className="font-[family-name:var(--font-display)] text-lg">
              Order summary
            </p>
            <ul className="mt-4 space-y-3">
              {items.map((i) => (
                <li
                  key={`${i.productId}-${i.size}-${i.customName || ""}-${i.sheetFit || ""}-${i.mattress || ""}`}
                  className="flex justify-between gap-2"
                >
                  <span>
                    {i.name}
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">
                      Size {i.size}
                      {i.sheetFit === "elastic"
                        ? " · Elastic fitted"
                        : i.sheetFit === "deep"
                          ? " · Deep Elastic Fitted"
                          : i.sheetFit === "flat"
                            ? " · Flat"
                            : ""}{" "}
                      · Qty {i.quantity}
                      {i.mattress ? ` · Mattress ${i.mattress}` : ""}
                      {i.customName
                        ? ` · Name: “${i.customName}”`
                        : ""}
                    </span>
                  </span>
                  <span className="shrink-0">
                    {formatINR(i.priceInPaise * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-[var(--line)] pt-4 font-medium">
              <span>Total</span>
              <span>{formatINR(subtotalPaise)}</span>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
