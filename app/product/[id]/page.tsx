"use client";

import { useEffect, useRef, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductViewer from "@/components/ProductViewer";
import { useGsap } from "@/lib/gsap";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, resolveImageUrl } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { Product } from "@/lib/products";
import ProductReviews, { ReviewSummaryBadge } from "@/components/ProductReviews";
import ProductQA from "@/components/ProductQA";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TABS = ["Description", "Reviews", "Questions"] as const;
type Tab = (typeof TABS)[number];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const rootRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.name,
      price: product.price,
      imageUrl: product.imageUrls?.[0],
    });
    trackEvent("add_to_cart", product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    if (!product) return;
    addItem({
      productId: product.id,
      title: product.name,
      price: product.price,
      imageUrl: product.imageUrls?.[0],
    });
    trackEvent("add_to_cart", product.id);
    router.push("/cart");
  }

  async function handleToggleWishlist() {
    if (!product) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (wishlisted) {
      await apiFetch(`/wishlist/${product.id}`, { method: "DELETE" });
      setWishlisted(false);
    } else {
      await apiFetch(`/wishlist/${product.id}`, { method: "POST" });
      trackEvent("add_to_wishlist", product.id);
      setWishlisted(true);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/products/${params.id}`, { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setProduct(null);
          return;
        }
        const p = await res.json();
        const original = parseFloat(p.price);
        const discounted = p.discount_pct ? Math.round(original * (1 - p.discount_pct / 100)) : original;
        if (!cancelled) {
          setProduct({
            id: p.id,
            name: p.title,
            description: p.description,
            category: p.category,
            price: discounted,
            originalPrice: p.discount_pct ? original : undefined,
            discountPct: p.discount_pct ?? undefined,
            freeShipping: p.free_shipping,
            voucherCode: p.voucher_code ?? undefined,
            imageUrls: p.image_urls.map((url: string) => resolveImageUrl(url)),
            videoUrl: p.video_url ? resolveImageUrl(p.video_url) : undefined,
          });
          trackEvent("product_view", p.id);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  useEffect(() => {
    if (!product || !user) return;
    apiFetch(`/wishlist/check/${product.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setWishlisted(data.wishlisted); });
  }, [product, user]);

  useEffect(() => {
    if (!product) return;
    const { gsap } = useGsap();
    const ctx = gsap.context(() => {
      gsap.from(".pd-viewer", { opacity: 0, scale: 0.97, duration: 0.5 });
      gsap.from(".pd-info > *", { opacity: 0, y: 16, duration: 0.4, stagger: 0.06, delay: 0.1 });
    }, rootRef);
    return () => ctx.revert();
  }, [product]);

  if (loading) return null;
  if (!product) notFound();

  return (
    <main ref={rootRef} style={{ background: "#F3F2EE" }}>
      <Nav />
      <div className="text-xs text-sc-faint px-6 md:px-18 pt-6">
        <Link href="/">Home</Link> / <Link href="/categories">{product.category}</Link> / {product.name}
      </div>

      <div className="flex flex-col lg:flex-row gap-14 px-6 md:px-18 py-10">
        <div className="flex-1 pd-viewer">
          <ProductViewer images={product.imageUrls || []} videoUrl={product.videoUrl} />
        </div>

        <div className="pd-info flex-1 max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-block bg-sc-accent-soft text-sc-accent text-[11px] font-semibold tracking-wide px-3 py-1.5 rounded-full">
              AI-VERIFIED LISTING
            </div>
            <button
              onClick={handleToggleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "var(--sc-accent)" : "none"} stroke={wishlisted ? "var(--sc-accent)" : "#5A574E"} strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <h1 className="font-display text-4xl font-semibold mb-2">{product.name}</h1>
          <div className="mb-5">
            <ReviewSummaryBadge productId={product.id} />
          </div>

          <div className="flex flex-wrap gap-3 mb-7">
            {product.freeShipping && (
              <div className="flex items-center gap-2 bg-white border border-sc-border rounded-full px-4 py-2.5 text-xs text-sc-accent">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F8A6E" strokeWidth={2}>
                  <rect x="1" y="3" width="15" height="13" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                </svg>
                Free shipping
              </div>
            )}
            {product.voucherCode && (
              <div className="flex items-center gap-2 bg-white border border-sc-border rounded-full px-4 py-2.5 text-xs text-sc-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A574E" strokeWidth={2}>
                  <path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.5 3H4a1 1 0 0 0-1 1v5.5a2 2 0 0 0 .83 1.5l9.58 9.59a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.83z" />
                </svg>
                Voucher: {product.voucherCode}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 rounded-full pl-5 pr-6 py-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--sc-accent)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {added ? "Added ✓" : "Add to Cart"}
            </button>
            <span className="text-3xl font-display font-semibold">Rs. {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-base text-sc-faint line-through">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
            {product.discountPct && (
              <span className="bg-sc-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{product.discountPct}%
              </span>
            )}
          </div>

          <button
            onClick={handleBuyNow}
            className="w-full rounded-full border border-sc-border py-3.5 text-sm font-semibold mb-8 hover:bg-white transition-colors"
          >
            Buy Now
          </button>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-sc-border pt-6">
            {[
              { label: "Description", tab: "Description" as Tab },
              { label: `Reviews`, tab: "Reviews" as Tab },
              { label: "Questions & Answers", tab: "Questions" as Tab },
              { label: "Category: " + product.category, tab: null },
            ].map((row) => (
              <button
                key={row.label}
                onClick={() => {
                  if (row.tab) {
                    setActiveTab(row.tab);
                    document.getElementById("pd-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="flex items-center justify-between text-sm text-left group"
                disabled={!row.tab}
              >
                <span className={row.tab ? "group-hover:text-sc-accent transition-colors" : "text-sc-muted"}>
                  {row.label}
                </span>
                {row.tab && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="group-hover:text-sc-accent group-hover:translate-x-0.5 transition-all">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div id="pd-tabs" className="border-t border-sc-border">
        <div className="px-6 md:px-18">
          <div className="flex gap-8 border-b border-sc-border overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="py-5 text-sm font-semibold whitespace-nowrap relative"
                style={{ color: activeTab === tab ? "var(--sc-accent)" : "var(--sc-muted)" }}
              >
                {tab}
                {activeTab === tab && (
                  <span
                    className="absolute left-0 right-0 -bottom-px h-0.5"
                    style={{ background: "var(--sc-accent)" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 md:px-18 py-10 max-w-3xl">
          {activeTab === "Description" && (
            <p className="text-sm leading-relaxed text-sc-muted">{product.description}</p>
          )}
          {activeTab === "Reviews" && <ProductReviews productId={product.id} />}
          {activeTab === "Questions" && <ProductQA productId={product.id} />}
        </div>
      </div>

      <Footer />
    </main>
  );
}