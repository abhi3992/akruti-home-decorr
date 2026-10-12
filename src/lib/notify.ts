import { formatINR } from "@/lib/utils";
import { displayOrderRef } from "@/lib/order-number";
import { ownerNotifyWhatsAppPhone, sendWhatsAppText } from "@/lib/whatsapp";

export type OrderLike = {
  id: string;
  orderNumber?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  totalInPaise: number;
  trackingId?: string | null;
  trackingUrl?: string | null;
};

const SITE = "https://www.akrutihomedecor.com";

function fromAddress() {
  return (
    process.env.ORDER_NOTIFY_FROM?.trim() ||
    "Akruti Home Decor <onboarding@resend.dev>"
  );
}

async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return { sent: false as const, reason: "no_resend_key" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.warn("[email] Resend failed", res.status, body.slice(0, 300));
    return { sent: false as const, reason: "resend_error" };
  }
  return { sent: true as const };
}

function shipLine(order: OrderLike) {
  return `${order.addressLine1}${order.addressLine2 ? `, ${order.addressLine2}` : ""}, ${order.city}, ${order.state} ${order.pincode}`;
}

function itemsHtml(itemLines: string[]) {
  return `<ul style="padding-left:18px;margin:12px 0">${itemLines
    .map((l) => `<li style="margin:4px 0">${escapeHtml(l)}</li>`)
    .join("")}</ul>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Email the buyer a confirmation after successful order. */
export async function sendBuyerConfirmation(
  order: OrderLike,
  itemLines: string[]
) {
  const statusLabel = order.status.replace(/_/g, " ");
  const ref = displayOrderRef(order);
  const subject = `Order confirmed · ${ref} · Akruti Home Decor`;
  const text = [
    `Hi ${order.customerName},`,
    "",
    `Thank you for your order with Akruti Home Decor.`,
    `Order: ${ref}`,
    `Status: ${statusLabel}`,
    `Total: ${formatINR(order.totalInPaise)}`,
    "",
    "Items:",
    ...itemLines.map((l) => `• ${l}`),
    "",
    `Shipping to: ${shipLine(order)}`,
    `Phone: ${order.customerPhone}`,
    "",
    `View order: ${SITE}/order/${encodeURIComponent(ref)}`,
    "",
    "We'll pack your order soon. For questions, reply to this email or reach us via the website.",
    "",
    "— Akruti Home Decor",
    "Tradition lives on",
  ].join("\n");

  const html = `
  <div style="font-family:Georgia,serif;color:#2c241b;max-width:560px;margin:0 auto;line-height:1.55">
    <p style="letter-spacing:0.14em;text-transform:uppercase;font-size:11px;color:#9a5a3a">Akruti Home Decor</p>
    <h1 style="font-size:24px;font-weight:normal;margin:8px 0 16px">Order confirmed</h1>
    <p>Hi ${escapeHtml(order.customerName)},</p>
    <p>Thank you for your order. We've received it and will start packing soon.</p>
    <p><strong>Order:</strong> ${escapeHtml(ref)}<br/>
    <strong>Status:</strong> ${escapeHtml(statusLabel)}<br/>
    <strong>Total:</strong> ${escapeHtml(formatINR(order.totalInPaise))}</p>
    <p style="margin-bottom:4px"><strong>Items</strong></p>
    ${itemsHtml(itemLines)}
    <p><strong>Ship to:</strong><br/>${escapeHtml(shipLine(order))}<br/>
    Phone: ${escapeHtml(order.customerPhone)}</p>
    <p><a href="${SITE}/order/${encodeURIComponent(ref)}" style="color:#9a5a3a">View your order</a></p>
    <p style="color:#6b6258;font-size:14px">— Akruti Home Decor · Tradition lives on</p>
  </div>`;

  try {
    return await sendEmail({
      to: order.customerEmail,
      subject,
      text,
      html,
    });
  } catch {
    return { sent: false as const, reason: "exception" };
  }
}

/** Alert the shop owner by email. Set ORDER_NOTIFY_EMAIL + RESEND_API_KEY. */
export async function notifyNewOrder(order: OrderLike, itemLines: string[]) {
  const to = process.env.ORDER_NOTIFY_EMAIL?.trim();
  if (!to) return { sent: false as const, reason: "no_owner_email" };

  const ref = displayOrderRef(order);
  const subject = `New order · ${ref} · ${order.customerName}`;
  const text = [
    `New Akruti order (${order.status})`,
    `Order: ${ref}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Email: ${order.customerEmail}`,
    `Ship to: ${shipLine(order)}`,
    `Total: ${formatINR(order.totalInPaise)}`,
    "",
    "Items:",
    ...itemLines.map((l) => `• ${l}`),
    "",
    `Admin: ${SITE}/admin`,
  ].join("\n");

  const html = `<pre style="font-family:ui-monospace,monospace;white-space:pre-wrap">${escapeHtml(text)}</pre>`;

  try {
    return await sendEmail({ to, subject, text, html });
  } catch {
    return { sent: false as const, reason: "exception" };
  }
}

/** Alert the shop owner on WhatsApp. */
export async function notifyNewOrderWhatsApp(
  order: OrderLike,
  itemLines: string[]
) {
  const phone = ownerNotifyWhatsAppPhone();
  if (!phone) return { sent: false as const, reason: "no_owner_whatsapp" };

  const ref = displayOrderRef(order);
  const text = [
    `🛒 New Akruti order`,
    `Order: ${ref}`,
    `Status: ${order.status}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Total: ${formatINR(order.totalInPaise)}`,
    `Ship: ${shipLine(order)}`,
    "",
    "Items:",
    ...itemLines.map((l) => `• ${l}`),
    "",
    `${SITE}/admin`,
  ].join("\n");

  return sendWhatsAppText(phone, text);
}

/** Email the buyer when shipping + tracking is shared. */
export async function sendShippedEmail(
  order: OrderLike,
  itemLines: string[]
) {
  const ref = displayOrderRef(order);
  const trackingId = (order.trackingId || "").trim();
  const trackingUrl = (order.trackingUrl || "").trim();
  if (!trackingId && !trackingUrl) {
    return { sent: false as const, reason: "no_tracking" };
  }

  const subject = `Your order is on the way · ${ref} · Akruti Home Decor`;
  const text = [
    `Hi ${order.customerName},`,
    "",
    `Warm greetings from Akruti Home Decor!`,
    "",
    `Great news — your order ${ref} has been packed with care and is on its way to you.`,
    "",
    trackingId ? `Tracking ID: ${trackingId}` : "",
    trackingUrl ? `Track your shipment: ${trackingUrl}` : "",
    "",
    "Items:",
    ...itemLines.map((l) => `• ${l}`),
    "",
    `Shipping to: ${shipLine(order)}`,
    "",
    `View order: ${SITE}/order/${encodeURIComponent(ref)}`,
    "",
    "Thank you for choosing handmade textiles from our workshop. We hope they bring warmth into your home.",
    "",
    "With love,",
    "— Akruti Home Decor",
    "Tradition lives on",
  ]
    .filter(Boolean)
    .join("\n");

  const trackBlock = [
    trackingId
      ? `<strong>Tracking ID:</strong> ${escapeHtml(trackingId)}`
      : "",
    trackingUrl
      ? `<strong>Track:</strong> <a href="${escapeHtml(trackingUrl)}" style="color:#9a5a3a">${escapeHtml(trackingUrl)}</a>`
      : "",
  ]
    .filter(Boolean)
    .join("<br/>");

  const html = `
  <div style="font-family:Georgia,serif;color:#2c241b;max-width:560px;margin:0 auto;line-height:1.55">
    <p style="letter-spacing:0.14em;text-transform:uppercase;font-size:11px;color:#9a5a3a">Akruti Home Decor</p>
    <h1 style="font-size:24px;font-weight:normal;margin:8px 0 16px">Your order is on the way</h1>
    <p>Hi ${escapeHtml(order.customerName)},</p>
    <p>Warm greetings from all of us at Akruti Home Decor.</p>
    <p>Great news — your order <strong>${escapeHtml(ref)}</strong> has been packed with care and is on its way to you.</p>
    <p style="background:#faf8f5;border:1px solid #e8e2d9;padding:14px 16px;margin:18px 0">${trackBlock}</p>
    <p style="margin-bottom:4px"><strong>Items</strong></p>
    ${itemsHtml(itemLines)}
    <p><strong>Ship to:</strong><br/>${escapeHtml(shipLine(order))}</p>
    <p><a href="${SITE}/order/${encodeURIComponent(ref)}" style="color:#9a5a3a">View your order</a></p>
    <p>Thank you for choosing handmade textiles from our workshop. We hope they bring warmth into your home.</p>
    <p style="color:#6b6258;font-size:14px">With love,<br/>— Akruti Home Decor · Tradition lives on</p>
  </div>`;

  try {
    return await sendEmail({
      to: order.customerEmail,
      subject,
      text,
      html,
    });
  } catch {
    return { sent: false as const, reason: "exception" };
  }
}

/** Buyer confirmation + owner email + owner WhatsApp. Never throws. */
export async function sendOrderEmails(order: OrderLike, itemLines: string[]) {
  const buyer = await sendBuyerConfirmation(order, itemLines);
  const owner = await notifyNewOrder(order, itemLines);
  const whatsapp = await notifyNewOrderWhatsApp(order, itemLines);
  return { buyer, owner, whatsapp };
}
