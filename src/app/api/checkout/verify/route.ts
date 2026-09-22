import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const secret = process.env.RAZORPAY_KEY_SECRET;
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
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verify failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
