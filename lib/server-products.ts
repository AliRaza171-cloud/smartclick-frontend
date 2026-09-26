import { Product } from "./products";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Shape returned by the backend's ProductOut schema (snake_case, and
// `price` is the admin-entered ORIGINAL price — see the note below).
interface BackendProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string; // Decimal serializes as a string over JSON
  discount_pct: number | null;
  free_shipping: boolean;
  voucher_code: string | null;
  image_urls: string[];
  video_url: string | null;
  tags: string[];
  average_rating: number | null;
  review_count: number;
}


// `price` from the backend is the admin's entered ORIGINAL price;
// `discount_pct` (if set) is the percentage off. The buyer-facing price is
// computed here rather than stored twice, so there's one source of truth.
function mapProduct(p: BackendProduct): Product {
  const original = parseFloat(p.price);
  const discounted = p.discount_pct ? Math.round(original * (1 - p.discount_pct / 100)) : original;

  return {
    id: p.id,
    name: p.title,
    description: p.description,
    category: p.category,
    price: discounted,
    originalPrice: p.discount_pct ? original : undefined,
    discountPct: p.discount_pct ?? undefined,
    freeShipping: p.free_shipping,
    voucherCode: p.voucher_code ?? undefined,
    imageUrl: p.image_urls[0] ? `${API_BASE}${p.image_urls[0]}` : undefined,
    imageUrls: p.image_urls.map((url) => `${API_BASE}${url}`),
    videoUrl: p.video_url ? `${API_BASE}${p.video_url}` : undefined,
    averageRating: p.average_rating,
    reviewCount: p.review_count,
  };
}

// cache: "no-store" — product data (price, stock, discounts) changes often
// enough that stale server-cached pages would be actively misleading.
export async function fetchProducts(category?: string, search?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const qs = params.toString();
    const url = qs ? `${API_BASE}/products?${qs}` : `${API_BASE}/products`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data: BackendProduct[] = await res.json();
    return data.map(mapProduct);
  } catch {
    // Backend unreachable — storefront pages fall back to an empty catalog
    // rather than crashing the whole page.
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return mapProduct(await res.json());
  } catch {
    return null;
  }
}