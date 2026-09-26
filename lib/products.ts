// Product shape used across the storefront. Real data comes from the
// backend (see lib/server-products.ts for the fetch + mapping layer) —
// this file just holds the shared type.
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPct?: number;
  freeShipping?: boolean;
  category: string;
  description: string;
  voucherCode?: string;
  imageUrl?: string; // full URL to the first uploaded photo — used by grid cards
  imageUrls?: string[]; // full URLs to ALL uploaded photos — used by the product page's viewer
  videoUrl?: string; // full URL to the uploaded product video, if any
  averageRating?: number | null;
  reviewCount?: number;
}


