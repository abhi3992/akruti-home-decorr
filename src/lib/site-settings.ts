import { prisma } from "@/lib/prisma";
import {
  SITE_IMAGES,
  DEFAULT_SITE_CONTENT,
  CONTENT_KEY,
  type SiteImageKey,
  type SiteContent,
} from "@/lib/site-content";
import { unstable_cache, revalidateTag } from "next/cache";

export {
  SITE_IMAGES,
  DEFAULT_SITE_CONTENT,
  type SiteImageKey,
  type SiteContent,
} from "@/lib/site-content";

export const SITE_CACHE_TAG = "site-settings";

async function readSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    const value = row?.value?.trim();
    return value || null;
  } catch {
    return null;
  }
}

export async function getSetting(key: string, fallback: string): Promise<string> {
  return (await readSetting(key)) || fallback;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  revalidateTag(SITE_CACHE_TAG);
}

const getCachedSiteImages = unstable_cache(
  async (): Promise<Record<SiteImageKey, string>> => {
    const keys = Object.keys(SITE_IMAGES) as SiteImageKey[];
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: keys.map((k) => SITE_IMAGES[k].key) } },
    });
    const map = new Map(rows.map((r) => [r.key, r.value.trim()]));
    const out = {} as Record<SiteImageKey, string>;
    for (const id of keys) {
      const meta = SITE_IMAGES[id];
      out[id] = map.get(meta.key) || meta.default;
    }
    return out;
  },
  ["site-images-v2"],
  { tags: [SITE_CACHE_TAG], revalidate: 3600 }
);

const getCachedSiteContent = unstable_cache(
  async (): Promise<SiteContent> => {
    try {
      const raw = await readSetting(CONTENT_KEY);
      if (!raw) return { ...DEFAULT_SITE_CONTENT };
      const parsed = JSON.parse(raw) as Partial<SiteContent>;
      return { ...DEFAULT_SITE_CONTENT, ...parsed };
    } catch {
      return { ...DEFAULT_SITE_CONTENT };
    }
  },
  ["site-content-v2"],
  { tags: [SITE_CACHE_TAG], revalidate: 3600 }
);

export async function getSiteImages(): Promise<Record<SiteImageKey, string>> {
  return getCachedSiteImages();
}

export async function getFounderImageUrl(): Promise<string> {
  const images = await getSiteImages();
  return images.founderImage;
}

export async function setFounderImageUrl(url: string): Promise<void> {
  await setSetting(SITE_IMAGES.founderImage.key, url);
}

export async function getSiteContent(): Promise<SiteContent> {
  return getCachedSiteContent();
}

export async function setSiteContent(content: SiteContent): Promise<void> {
  await setSetting(CONTENT_KEY, JSON.stringify(content));
}
