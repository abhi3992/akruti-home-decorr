export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function productImages(imagesJson: string): string[] {
  return parseJsonArray(imagesJson).map((src) =>
    src.startsWith("/products/") ? src.replace(/\.png$/i, ".jpg") : src
  );
}

export function productSizes(sizesJson: string): string[] {
  return parseJsonArray(sizesJson);
}

/** Remote Blob URLs and data-URLs skip the Next image optimizer */
export function isExternalImage(src: string): boolean {
  return src.startsWith("http") || src.startsWith("data:");
}
