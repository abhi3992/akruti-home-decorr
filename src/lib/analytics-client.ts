/** Stable anonymous visitor id for analytics (cart / wishlist presence). */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "akruti-visitor-v1";
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `v-${Date.now()}`;
  }
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function syncPresence(cartIds: string[], wishlistIds: string[]) {
  if (typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const visitorId = getVisitorId();
    if (!visitorId) return;
    fetch("/api/analytics/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, cartIds, wishlistIds }),
      keepalive: true,
    }).catch(() => {});
  }, 400);
}

export function trackProductView(productId: string) {
  if (typeof window === "undefined" || !productId) return;
  const visitorId = getVisitorId();
  fetch("/api/analytics/view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, visitorId }),
    keepalive: true,
  }).catch(() => {});
}
