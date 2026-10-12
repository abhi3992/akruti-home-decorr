import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const WINDOWS = [7, 30, 90] as const;

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requested = Number(req.nextUrl.searchParams.get("days") || 30);
  const days = WINDOWS.includes(requested as (typeof WINDOWS)[number])
    ? requested
    : 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [products, events, cartsNow, wishesNow, orderItems] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        active: true,
        viewCount: true,
        category: true,
      },
    }),
    prisma.productEvent.groupBy({
      by: ["productId", "kind"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.cartPresence.groupBy({
      by: ["productId"],
      _count: { _all: true },
    }),
    prisma.wishlistPresence.groupBy({
      by: ["productId"],
      _count: { _all: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: since } } },
      select: { productId: true, quantity: true },
    }),
  ]);

  const views = new Map<string, number>();
  const carts = new Map<string, number>();
  const wishes = new Map<string, number>();
  for (const event of events) {
    const bucket =
      event.kind === "view" ? views : event.kind === "cart" ? carts : wishes;
    bucket.set(event.productId, event._count._all);
  }
  const inCart = new Map(cartsNow.map((row) => [row.productId, row._count._all]));
  const inWish = new Map(wishesNow.map((row) => [row.productId, row._count._all]));
  const ordered = new Map<string, number>();
  for (const item of orderItems) {
    ordered.set(item.productId, (ordered.get(item.productId) || 0) + item.quantity);
  }

  const rows = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    active: product.active,
    category: product.category,
    views: views.get(product.id) || 0,
    allTimeViews: product.viewCount,
    cartAdds: carts.get(product.id) || 0,
    inCart: inCart.get(product.id) || 0,
    wishlistAdds: wishes.get(product.id) || 0,
    inWishlist: inWish.get(product.id) || 0,
    ordered: ordered.get(product.id) || 0,
  }));

  const sum = (key: "views" | "cartAdds" | "wishlistAdds" | "ordered" | "inCart" | "inWishlist" | "allTimeViews") =>
    rows.reduce((total, row) => total + row[key], 0);

  return NextResponse.json({
    days,
    totals: {
      views: sum("views"),
      allTimeViews: sum("allTimeViews"),
      cartAdds: sum("cartAdds"),
      inCart: sum("inCart"),
      wishlistAdds: sum("wishlistAdds"),
      inWishlist: sum("inWishlist"),
      ordered: sum("ordered"),
    },
    rows,
  });
}
