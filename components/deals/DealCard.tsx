"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { formatRs, savingsOf } from "@/lib/deals";
import { CartIcon, HeartIcon, Star, TruckIcon } from "./icons";

const BADGE_STYLES: Record<string, { bg: string; text: string }> = {
  "Best Seller": { bg: "#0F8A6E", text: "#FFFFFF" },
  Trending: { bg: "#E85D3A", text: "#FFFFFF" },
  "Hot Deal": { bg: "#141413", text: "#FFFFFF" },
  New: { bg: "#0E1712", text: "#22C08C" },
  "Flash Deal": { bg: "#FACC15", text: "#141413" },
};

function Rating({ product, small }: { product: Product; small?: boolean }) {
  if (!product.reviewCount) return <div className={small ? "h-[15px] mt-1" : "h-[17px] mt-1.5"} />;
  const rating = product.averageRating || 0;
  return (
    <div className={`flex items-center gap-1 ${small ? "mt-1 text-[11px]" : "mt-1.5 text-xs"}`}>
      <Star size={small ? 11 : 12} />
      <span className="font-semibold text-[#B7791F]">{rating.toFixed(1)}</span>
      <span className="text-sc-faint">({product.reviewCount})</span>
    </div>
  );
}

function DiscountTag({ pct, small }: { pct?: number; small?: boolean }) {
  if (!pct) return null;
  return (
    <span
      className={`absolute top-2.5 left-2.5 z-10 rounded-md bg-[#DC2626] font-bold text-white ${
        small ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      }`}
    >
      -{pct}%
    </span>
  );
}

function Thumb({ product, className }: { product: Product; className: string }) {
  return product.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.imageUrl}
      alt={product.name}
      loading="lazy"
      className={`${className} object-cover transition-transform duration-300 group-hover:scale-105`}
    />
  ) : (
    <div className={`${className} flex items-center justify-center text-[11px] text-sc-faint`}>product image</div>
  );
}

function useWishlistToggle(product: Product, initial: boolean) {
  const { user } = useAuth();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initial);
  useEffect(() => setWishlisted(initial), [initial]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    const next = !wishlisted;
    setWishlisted(next); // optimistic
    const res = await apiFetch(`/wishlist/${product.id}`, { method: next ? "POST" : "DELETE" });
    if (!res.ok) setWishlisted(!next);
  }
  return { wishlisted, toggle };
}

/**
 * Deal card with three layouts:
 *  - "full":    Flash Deals — wishlist, "You save", Add to Cart
 *  - "compact": Trending / Recommends — smaller, no button
 *  - "row":     Biggest Savings — image left, details right
 */
export default function DealCard({
  product: p,
  variant = "full",
  badge,
  initiallyWishlisted = false,
}: {
  product: Product;
  variant?: "full" | "compact" | "row";
  badge?: string;
  initiallyWishlisted?: boolean;
}) {
  const { addItem } = useCart();
  const { wishlisted, toggle } = useWishlistToggle(p, initiallyWishlisted);
  const [added, setAdded] = useState(false);
  const saved = savingsOf(p);
  const badgeStyle = badge ? BADGE_STYLES[badge] : null;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({ productId: p.id, title: p.name, price: p.price, imageUrl: p.imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  if (variant === "row") {
    return (
      <Link
        href={`/product/${p.id}`}
        className="deal-card group flex flex-col rounded-xl border border-sc-border bg-sc-surface p-2.5 transition-shadow hover:shadow-md"
      >
        <div className="flex gap-2.5">
          <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#EDEBE4]">
            <Thumb product={p} className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold">{p.name}</div>
            <div className="truncate text-[10px] text-sc-faint">{p.category}</div>
            <Rating product={p} small />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-[#DC2626]">{formatRs(p.price)}</span>
          {p.originalPrice && <span className="text-[11px] text-sc-faint line-through">{formatRs(p.originalPrice)}</span>}
          {p.discountPct ? <span className="ml-auto text-xs font-bold text-[#DC2626]">-{p.discountPct}%</span> : null}
        </div>
        {saved > 0 && <div className="mt-0.5 text-[11px] font-medium text-sc-accent">Save {formatRs(saved)}</div>}
      </Link>
    );
  }

  const compact = variant === "compact";

  return (
    <Link
      href={`/product/${p.id}`}
      className="deal-card group flex flex-col rounded-2xl border border-sc-border bg-sc-surface p-2 transition-shadow hover:shadow-lg"
    >
      <div className={`relative overflow-hidden rounded-xl bg-[#EDEBE4] ${compact ? "h-32" : "h-40"}`}>
        <DiscountTag pct={p.discountPct} small={compact} />
        {!compact && (
          <button
            onClick={toggle}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform hover:scale-110"
          >
            <HeartIcon filled={wishlisted} />
          </button>
        )}
        <Thumb product={p} className="h-full w-full" />
        {badgeStyle && (
          <span
            className="absolute bottom-2 left-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: badgeStyle.bg, color: badgeStyle.text }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <div className={`truncate font-semibold ${compact ? "text-xs" : "text-sm"}`}>{p.name}</div>
        <div className={`truncate text-sc-faint ${compact ? "text-[11px]" : "text-xs"}`}>{p.category}</div>
        <Rating product={p} small={compact} />

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
          <span className={`font-bold text-[#DC2626] ${compact ? "text-sm" : "text-base"}`}>{formatRs(p.price)}</span>
          {p.originalPrice && <span className="text-xs text-sc-faint line-through">{formatRs(p.originalPrice)}</span>}
        </div>
        {!compact && saved > 0 && (
          <div className="text-xs text-sc-muted">
            You save <span className="font-semibold text-[#DC2626]">{formatRs(saved)}</span>
          </div>
        )}

        {p.freeShipping ? (
          <div className={`mt-1.5 flex items-center gap-1 text-sc-accent ${compact ? "text-[11px]" : "text-xs"}`}>
            <TruckIcon size={12} /> Free shipping
          </div>
        ) : (
          <div className={compact ? "h-[16.5px] mt-1.5" : "h-[18px] mt-1.5"} />
        )}

        {!compact && (
          <button
            onClick={handleAdd}
            className="mt-auto flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: "var(--sc-accent)", marginTop: 12 }}
          >
            <CartIcon /> {added ? "Added ✓" : "Add to Cart"}
          </button>
        )}
      </div>
    </Link>
  );
}
