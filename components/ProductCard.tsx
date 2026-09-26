"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  "Best Seller": { bg: "#0F8A6E", text: "#FFFFFF" },
  Trending: { bg: "#E85D3A", text: "#FFFFFF" },
  "Hot Deal": { bg: "#DC2626", text: "#FFFFFF" },
  New: { bg: "#0E1712", text: "#22C08C" },
};

export default function ProductCard({
  product,
  badge,
  initiallyWishlisted = false,
}: {
  product: Product;
  badge?: string;
  initiallyWishlisted?: boolean;
}) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initiallyWishlisted);
  const [added, setAdded] = useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      productId: product.id,
      title: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  async function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (wishlisted) {
      await apiFetch(`/wishlist/${product.id}`, { method: "DELETE" });
      setWishlisted(false);
    } else {
      await apiFetch(`/wishlist/${product.id}`, { method: "POST" });
      setWishlisted(true);
    }
  }

  const badgeStyle = badge ? BADGE_STYLES[badge] : null;

  return (
    <Link
      href={`/product/${product.id}`}
      className="product-card block bg-white border border-sc-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-52 bg-[#EDEBE4]">
        {badgeStyle && (
          <span
            className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full z-10"
            style={{ background: badgeStyle.bg, color: badgeStyle.text }}
          >
            {badge}
          </span>
        )}
        <button
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24"
            fill={wishlisted ? "var(--sc-accent)" : "none"}
            stroke={wishlisted ? "var(--sc-accent)" : "#5A574E"}
            strokeWidth={2}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-sc-faint">product image</div>
        )}
        {product.discountPct && (
          <span className="absolute bottom-3 right-3 bg-sc-accent text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
            -{product.discountPct}%
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="text-sm font-semibold truncate">{product.name}</div>
        <div className="text-xs text-sc-faint mt-0.5 truncate">{product.category}</div>

        {product.reviewCount ? (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  width="11" height="11" viewBox="0 0 24 24"
                  fill={star <= Math.round(product.averageRating || 0) ? "#F5B400" : "#E1DFD8"}
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-sc-muted">
              {product.averageRating} ({product.reviewCount})
            </span>
          </div>
        ) : (
          <div className="h-[19px] mt-2" />
        )}

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-base font-bold">Rs. {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-sc-faint line-through">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {product.freeShipping && (
          <div className="flex items-center gap-1.5 text-[11px] text-sc-accent mt-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0F8A6E" strokeWidth={2}>
              <rect x="1" y="3" width="15" height="13" />
              <path d="M16 8h4l3 3v5h-7V8z" />
            </svg>
            Free shipping
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-white text-xs font-semibold py-2.5 transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--sc-accent)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {added ? "Added ✓" : "Add to Cart"}
          </button>
          <button
            onClick={handleToggleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="w-9 h-9 flex-shrink-0 rounded-lg border flex items-center justify-center"
            style={{ borderColor: "var(--sc-border)" }}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill={wishlisted ? "var(--sc-accent)" : "none"}
              stroke={wishlisted ? "var(--sc-accent)" : "#5A574E"}
              strokeWidth={2}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}