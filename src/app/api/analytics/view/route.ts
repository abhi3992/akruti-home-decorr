import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string().min(1),
  visitorId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const updated = await prisma.product.updateMany({
      where: { id: body.productId, active: true },
      data: { viewCount: { increment: 1 } },
    });
    if (updated.count > 0) {
      await prisma.productEvent.create({
        data: { productId: body.productId, kind: "view" },
      });
    }
  } catch {
    /* ignore analytics errors */
  }
  // Tiny response — analytics must not inflate Origin Transfer
  return new NextResponse(null, { status: 204 });
}
