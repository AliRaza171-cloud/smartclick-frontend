import { getAccessToken } from "./api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type AnalyticsEventType = "page_view" | "product_view" | "add_to_cart" | "add_to_wishlist";

/**
 * Fire-and-forget — never blocks or throws into the calling UI code.
 * Works for anonymous visitors too (that's most of a store's traffic);
 * a long-lived cookie set by the backend identifies unique visitors,
 * and a logged-in user is opportunistically identified via the
 * Authorization header if one is available, never required.
 */
export function trackEvent(eventType: AnalyticsEventType, productId?: string, path?: string) {
  const token = getAccessToken();
  fetch(`${API_BASE}/analytics/track`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ event_type: eventType, product_id: productId, path }),
  }).catch(() => {
    // analytics failures should never surface to the user
  });
}