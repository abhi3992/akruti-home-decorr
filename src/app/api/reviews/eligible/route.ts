import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderNumber: z.string().trim().min(3),
  email: z.string().trim().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const ref = body.orderNumber.trim();
    const mail = body.email.trim().toLowerCase();
    const byNumber = await prisma.order.findUnique({
      where: { orderNumber: ref },
      include: { items: { include: { product: true } } },
    });
    const order =
      byNumber ||
      (await prisma.order.findUnique({
        where: { id: ref },
        include: { items: { include: { product: true } } },
      }));
    if (!order || order.customerEmail.trim().toLowerCase() !== mail) {
      return NextResponse.json(
        { error: "We couldn't match that order number and email." },
        { status: 403 }
      );
    }

    const reviewed = await prisma.review.findMany({
      where: { orderId: order.id },
      select: { productId: true },
    });
    const done = new Set(reviewed.map((r) => r.productId));
    const products = order.items
      .filter((item) => item.product && !done.has(item.productId))
      .map((item) => ({
        id: item.productId,
        name: item.product.name,
        slug: item.product.slug,
      }));

    const unique = Array.from(new Map(products.map((p) => [p.id, p])).values());
    return NextResponse.json({
      orderNumber: order.orderNumber || order.id,
      products: unique,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
