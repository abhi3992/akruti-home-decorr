import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteBlobUrls } from "@/lib/blob-cleanup";
import {
  SITE_IMAGES,
  setSetting,
  setSiteContent,
  DEFAULT_SITE_CONTENT,
  SITE_CACHE_TAG,
  type SiteContent,
} from "@/lib/site-settings";

const imageSchema = z.object({
  key: z.string(),
  url: z.string().min(1).refine((v) => !v.startsWith("data:"), {
    message: "Data-URL images are not allowed — upload via Blob storage",
  }),
});

const contentSchema = z.object({
  content: z.record(z.string(), z.string()),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.key && body.url) {
      const parsed = imageSchema.parse(body);
      const allowed = Object.values(SITE_IMAGES).some(
        (m) => m.key === parsed.key
      );
      if (!allowed) {
        return NextResponse.json({ error: "Unknown image key" }, { status: 400 });
      }
      const previous = await prisma.siteSetting.findUnique({
        where: { key: parsed.key },
      });
      await setSetting(parsed.key, parsed.url);
      if (previous?.value && previous.value !== parsed.url) {
        await deleteBlobUrls([previous.value]);
      }
      bustCaches();
      return NextResponse.json({ ok: true, url: parsed.url });
    }

    if (body.content) {
      const parsed = contentSchema.parse(body);
      const next: SiteContent = { ...DEFAULT_SITE_CONTENT };
      for (const [k, v] of Object.entries(parsed.content)) {
        if (k in DEFAULT_SITE_CONTENT) {
          (next as Record<string, string>)[k] = v;
        }
      }
      await setSiteContent(next);
      bustCaches();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function bustCaches() {
  revalidateTag(SITE_CACHE_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/shop");
  revalidatePath("/admin");
}
