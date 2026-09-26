import { Product } from "./products";
import { resolveImageUrl } from "./api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface BackendProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  discount_pct: number | null;
  free_shipping: boolean;
  voucher_code: string | null;
  image_urls: string[];
  video_url: string | null;
  tags: string[];
  average_rating: number | null;
  review_count: number;
  is_flash_deal?: boolean;
}

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
    imageUrl: p.image_urls[0] ? resolveImageUrl(p.image_urls[0]) : undefined,
    imageUrls: p.image_urls.map((url) => resolveImageUrl(url)),
    videoUrl: p.video_url ? resolveImageUrl(p.video_url) : undefined,
    averageRating: p.average_rating,
    reviewCount: p.review_count,
    isFlashDeal: !!(p.is_flash_deal && p.discount_pct),
  };
}

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