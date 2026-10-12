import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = z.object({ id: z.string().min(1) }).parse(await req.json());
    const product = await prisma.product.update({
      where: { id },
      data: { active: true },
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin");
    revalidatePath(`/product/${product.slug}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Restore failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
