import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { setFounderImageUrl, SITE_IMAGES } from "@/lib/site-settings";
import { prisma } from "@/lib/prisma";
import { deleteBlobUrls } from "@/lib/blob-cleanup";

const schema = z.object({
  image: z.string().min(1),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const previous = await prisma.siteSetting.findUnique({
      where: { key: SITE_IMAGES.founderImage.key },
    });
    await setFounderImageUrl(body.image);
    if (previous?.value && previous.value !== body.image) {
      await deleteBlobUrls([previous.value]);
    }
    revalidatePath("/");
    revalidatePath("/about");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
