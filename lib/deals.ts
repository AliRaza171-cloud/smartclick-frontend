// Server-side data for the /deals page. Everything here comes from existing
// backend endpoints — no backend changes needed.
// Server-side data for the /deals page. Everything here comes from existing
// backend endpoints — no backend changes needed.
import { Product } from "./products";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

/** productId -> "Best Seller" | "Trending" | "Hot Deal" | "New" */
export const fetchBadges = () => getJson<Record<string, string>>("/products/badges", {});

/** Ids of best-selling products, in rank order. */
export async function fetchBestSellerIds(limit = 10): Promise<string[]> {
  const rows = await getJson<{ id: string }[]>(`/products/best-sellers?limit=${limit}`, []);
  return rows.map((r) => r.id);
}

export interface ActiveCampaign {
  message: string;
  // Naive UTC from the backend — parse with parseApiUtc().
  end_at?: string | null;
}
export const fetchActiveCampaigns = () => getJson<ActiveCampaign[]>("/campaigns/active", []);

export interface PublicVoucher {
  code: string;
  discount_type: "percent" | "flat";
  discount_value: string;
  min_order_value: string | null;
  grants_free_shipping: boolean;
}
export const fetchActiveVouchers = () => getJson<PublicVoucher[]>("/vouchers/active", []);

// ---------- shared helpers (safe on server and client) ----------

/**
 * The backend stores campaign times as naive UTC ("2026-11-11T19:00:00", no
 * offset). JavaScript would read that as *local* time, so mark it as UTC.
 */
export function parseApiUtc(value: string | null | undefined): Date | null {
  if (!value) return null;
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  const d = new Date(hasZone ? value : `${value}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const formatRs = (n: number) => `Rs. ${Math.round(n).toLocaleString()}`;

export const savingsOf = (p: Product) => (p.originalPrice ? p.originalPrice - p.price : 0);

export function voucherLabel(v: PublicVoucher): string {
  const value = parseFloat(v.discount_value);
  const parts: string[] = [];
  if (value > 0) parts.push(v.discount_type === "percent" ? `${value}% OFF` : `${formatRs(value)} OFF`);
  if (v.grants_free_shipping) parts.push("Free Shipping");
  let label = parts.join(" + ");
  if (v.min_order_value) label += ` on orders over ${formatRs(parseFloat(v.min_order_value))}`;
  return label;
}