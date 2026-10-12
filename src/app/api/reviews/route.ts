import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string().min(1),
  author: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(12).max(800),
  orderNumber: z.string().trim().min(3),
  email: z.string().trim().email(),
});

async function findOrder(orderNumber: string, email: string) {
  const ref = orderNumber.trim();
  const mail = email.trim().toLowerCase();
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
  if (!order) return null;
  if (order.customerEmail.trim().toLowerCase() !== mail) return null;
  return order;
}

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const order = await findOrder(body.orderNumber, body.email);
    if (!order) {
      return NextResponse.json(
        { error: "We couldn't match that order number and email." },
        { status: 403 }
      );
    }

    const line = order.items.find((item) => item.productId === body.productId);
    if (!line) {
      return NextResponse.json(
        { error: "That product is not on this order." },
        { status: 400 }
      );
    }

    const already = await prisma.review.findFirst({
      where: { orderId: order.id, productId: body.productId },
    });
    if (already) {
      return NextResponse.json(
        { error: "You already reviewed this item from this order." },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId: body.productId,
        orderId: order.id,
        author: body.author,
        rating: body.rating,
        body: body.body,
      },
    });

    revalidatePath(`/product/${line.product.slug}`);
    revalidatePath("/reviews");
    return NextResponse.json({
      review: {
        id: review.id,
        author: review.author,
        rating: review.rating,
        body: review.body,
        image: review.image || "",
        createdAt: review.createdAt.toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save review";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
