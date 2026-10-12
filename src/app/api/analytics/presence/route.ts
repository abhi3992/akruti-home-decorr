import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  visitorId: z.string().min(8).max(80),
  cartIds: z.array(z.string()).max(50),
  wishlistIds: z.array(z.string()).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const { visitorId } = body;
    const cartIds = [...new Set(body.cartIds)];
    const wishlistIds = [...new Set(body.wishlistIds)];
    const allIds = [...new Set([...cartIds, ...wishlistIds])];

    const valid =
      allIds.length === 0
        ? []
        : (
            await prisma.product.findMany({
              where: { id: { in: allIds } },
              select: { id: true },
            })
          ).map((p) => p.id);
    const validSet = new Set(valid);
    const safeCart = cartIds.filter((id) => validSet.has(id));
    const safeWish = wishlistIds.filter((id) => validSet.has(id));
    const now = new Date();

    const [prevCart, prevWish] = await Promise.all([
      prisma.cartPresence.findMany({
        where: { visitorId },
        select: { productId: true },
      }),
      prisma.wishlistPresence.findMany({
        where: { visitorId },
        select: { productId: true },
      }),
    ]);
    const prevCartSet = new Set(prevCart.map((row) => row.productId));
    const prevWishSet = new Set(prevWish.map((row) => row.productId));
    const added = [
      ...safeCart
        .filter((id) => !prevCartSet.has(id))
        .map((productId) => ({ productId, kind: "cart" })),
      ...safeWish
        .filter((id) => !prevWishSet.has(id))
        .map((productId) => ({ productId, kind: "wishlist" })),
    ];

    await prisma.$transaction([
      prisma.cartPresence.deleteMany({ where: { visitorId } }),
      prisma.wishlistPresence.deleteMany({ where: { visitorId } }),
      ...(safeCart.length
        ? [
            prisma.cartPresence.createMany({
              data: safeCart.map((productId) => ({
                visitorId,
                productId,
                updatedAt: now,
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
      ...(safeWish.length
        ? [
            prisma.wishlistPresence.createMany({
              data: safeWish.map((productId) => ({
                visitorId,
                productId,
                updatedAt: now,
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);

    if (added.length) {
      await prisma.productEvent.createMany({ data: added });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
