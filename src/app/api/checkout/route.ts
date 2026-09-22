import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(8),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional().default(""),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  items: z
    .array(
      z.object({
        productId: z.string(),
        size: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    const products = await prisma.product.findMany({
      where: { id: { in: body.items.map((i) => i.productId) } },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let totalInPaise = 0;
    const lineItems = body.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      totalInPaise += product.priceInPaise * item.quantity;
      return {
        productId: product.id,
        size: item.size,
        quantity: item.quantity,
        unitPricePaise: product.priceInPaise,
      };
    });

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const demoMode = !keyId || !keySecret;

    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2 || "",
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        status: demoMode ? "demo_paid" : "pending",
        totalInPaise,
        items: { create: lineItems },
      },
    });

    if (demoMode) {
      for (const item of lineItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      return NextResponse.json({
        mode: "demo",
        orderId: order.id,
      });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const rzOrder = await razorpay.orders.create({
      amount: totalInPaise,
      currency: "INR",
      receipt: order.id.slice(0, 40),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzOrder.id },
    });

    return NextResponse.json({
      mode: "razorpay",
      orderId: order.id,
      razorpayOrderId: rzOrder.id,
      amount: totalInPaise,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
