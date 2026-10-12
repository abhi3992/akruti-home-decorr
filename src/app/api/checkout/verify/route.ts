import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendOrderEmails } from "@/lib/notify";
import { formatINR } from "@/lib/utils";
import { formatLineLabel } from "@/lib/name-print";

const schema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

async function findOrder(ref: string) {
  const byNumber = await prisma.order.findUnique({
    where: { orderNumber: ref },
    include: { items: true },
  });
  if (byNumber) return byNumber;
  return prisma.order.findUnique({
    where: { id: ref },
    include: { items: true },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 400 }
      );
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
      .digest("hex");

    if (expected !== body.razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid signature — payment not marked as paid" },
        { status: 400 }
      );
    }

    const order = await findOrder(body.orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.razorpayOrderId && order.razorpayOrderId !== body.razorpay_order_id) {
      return NextResponse.json(
        { error: "Order ID mismatch" },
        { status: 400 }
      );
    }

    // Already verified — idempotent success (do not decrement stock again)
    if (order.status === "paid" && order.razorpayPaymentId) {
      return NextResponse.json({
        ok: true,
        alreadyPaid: true,
        orderId: order.orderNumber || order.id,
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        razorpayOrderId: body.razorpay_order_id,
        razorpayPaymentId: body.razorpay_payment_id,
      },
    });

    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const paid = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: { include: { product: true } } },
    });
    if (paid) {
      await sendOrderEmails(
        paid,
        paid.items.map(
          (item) =>
            `${formatLineLabel({
              name: item.product.name,
              size: item.size,
              quantity: item.quantity,
              customName: item.customName,
              sheetFit: item.sheetFit,
              mattress: item.mattress,
            })} · ${formatINR(item.unitPricePaise * item.quantity)}`
        )
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: order.orderNumber || order.id,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Verify failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
