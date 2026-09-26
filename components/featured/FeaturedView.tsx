"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/products";
import { CategoryMeta } from "@/lib/categories";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, resolveImageUrl } from "@/lib/api";
import { useGsap } from "@/lib/gsap";
import ProductCard from "@/components/ProductCard";

export interface Collection {
  category: CategoryMeta;
  count: number;
  images: string[]; // up to 3 product images from this category
}

const Arrow = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const Stars = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <span className="inline-flex gap-0.5" aria-label={`${rating.toFixed(1)} out of 5`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s <= Math.round(rating) ? "#F5B400" : "#3A3A36"}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </span>
);

function Section({
  eyebrow, title, subtitle, children,
}: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="feat-section">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-sc-accent">{eyebrow}</div>
          <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-sc-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

/** Big dark hero card for the single most loved product. */
function Spotlight({ product: p, reason }: { product: Product; reason: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const images = (p.imageUrls?.length ? p.imageUrls : p.imageUrl ? [p.imageUrl] : []).slice(0, 4);
  const [active, setActive] = useState(0);

  return (
    <section className="feat-section overflow-hidden rounded-3xl bg-[#141413] text-white shadow-xl">
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-[300px] bg-[#1E1E1C] md:min-h-[440px]">
          {images.length ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[active]} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/40">product image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[#141413]/40" />
          <span className="absolute left-5 top-5 rounded-full bg-[#FACC15] px-3 py-1 text-xs font-bold text-[#141413]">
            ★ Product of the Week
          </span>
          {images.length > 1 && (
            <div className="absolute bottom-5 left-5 flex gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className="h-12 w-12 overflow-hidden rounded-lg border-2 transition-transform hover:scale-105"
                  style={{ borderColor: i === active ? "#FACC15" : "rgba(255,255,255,0.35)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center p-7 md:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#22C08C]">{reason}</div>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">{p.name}</h2>
          <div className="mt-1 text-sm text-white/60">{p.category}</div>

          {p.reviewCount ? (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Stars rating={p.averageRating ?? 0} />
              <span className="font-semibold">{(p.averageRating ?? 0).toFixed(1)}</span>
              <span className="text-white/60">· {p.reviewCount} review{p.reviewCount === 1 ? "" : "s"}</span>
            </div>
          ) : null}

          {p.description && <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/75">{p.description}</p>}

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-bold">Rs. {p.price.toLocaleString()}</span>
            {p.originalPrice && (
              <span className="text-base text-white/50 line-through">Rs. {p.originalPrice.toLocaleString()}</span>
            )}
            {p.discountPct ? (
              <span className="rounded-full bg-[#DC2626] px-2.5 py-0.5 text-xs font-bold">-{p.discountPct}%</span>
            ) : null}
          </div>
          {p.freeShipping && <div className="mt-2 text-xs font-medium text-[#22C08C]">✓ Free shipping</div>}

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={() => {
                addItem({ productId: p.id, title: p.name, price: p.price, imageUrl: p.imageUrl });
                setAdded(true);
                setTimeout(() => setAdded(false), 1400);
              }}
              className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--sc-accent)" }}
            >
              {added ? "Added to cart ✓" : "Add to Cart"}
            </button>
            <Link
              href={`/product/${p.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              View details <Arrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CollectionCard({ c }: { c: Collection }) {
  const [main, ...rest] = c.images;
  const tile = (src: string | undefined, cls: string) =>
    src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" loading="lazy" className={`${cls} object-cover transition-transform duration-500 group-hover:scale-105`} />
    ) : (
      <div className={`${cls} bg-[#EDEBE4]`} />
    );
  const cover = c.category.image_url ? resolveImageUrl(c.category.image_url) : main;

  return (
    <Link
      href={`/category/${c.category.slug}`}
      className="feat-card group block overflow-hidden rounded-2xl border border-sc-border bg-sc-surface transition-shadow hover:shadow-lg"
    >
      <div className="grid h-44 grid-cols-3 grid-rows-2 gap-1 overflow-hidden">
        <div className="col-span-2 row-span-2 overflow-hidden">{tile(cover, "h-full w-full")}</div>
        <div className="overflow-hidden">{tile(rest[0] ?? main, "h-full w-full")}</div>
        <div className="overflow-hidden">{tile(rest[1] ?? rest[0] ?? main, "h-full w-full")}</div>
      </div>
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="font-display text-base font-semibold">{c.category.name}</div>
          <div className="text-xs text-sc-faint">
            {c.category.tagline || `${c.count} product${c.count === 1 ? "" : "s"}`}
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-sc-accent transition-transform group-hover:translate-x-0.5">
          Shop <Arrow size={12} />
        </span>
      </div>
    </Link>
  );
}

export default function FeaturedView({
  spotlight,
  spotlightReason,
  bestSellers,
  topRated,
  newArrivals,
  collections,
  badges,
  productCount,
}: {
  spotlight: Product | null;
  spotlightReason: string;
  bestSellers: Product[];
  topRated: Product[];
  newArrivals: Product[];
  collections: Collection[];
  badges: Record<string, string>;
  productCount: number;
}) {
  const { user } = useAuth();
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return setWishlisted(new Set());
    apiFetch("/wishlist")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: { id: string }[]) => setWishlisted(new Set(rows.map((r) => r.id))))
      .catch(() => setWishlisted(new Set()));
  }, [user]);

  // One-time fade-in on load (no ScrollTrigger, and styles are cleared after).
  useEffect(() => {
    const { gsap } = useGsap();
    const els = document.querySelectorAll(".feat-section");
    if (!els.length) return;
    const tween = gsap.fromTo(
      els,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power2.out", clearProps: "opacity,transform" }
    );
    return () => {
      tween.kill();
      gsap.set(els, { clearProps: "opacity,transform" });
    };
  }, []);

  const grid = (items: Product[]) => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} badge={badges[p.id]} initiallyWishlisted={wishlisted.has(p.id)} />
      ))}
    </div>
  );

  const empty = !spotlight && !bestSellers.length && !topRated.length && !newArrivals.length;

  return (
    <div className="space-y-16 px-6 pb-24 pt-10 md:px-18">
      {/* Header */}
      <header className="feat-section flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-block rounded-full bg-sc-accent-soft px-3 py-1 text-xs font-semibold text-sc-accent">
            Hand-picked for you
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            The <span className="text-sc-accent">Featured</span> Edit
          </h1>
          <p className="mt-2 max-w-xl text-sm text-sc-muted">
            Our most-loved products — chosen by what customers buy, rate and come back for.
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <div className="font-display text-2xl font-bold">{productCount}</div>
            <div className="text-xs text-sc-muted">Products</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold">{collections.length}</div>
            <div className="text-xs text-sc-muted">Collections</div>
          </div>
        </div>
      </header>

      {empty ? (
        <p className="rounded-2xl border border-dashed border-sc-border bg-sc-surface py-14 text-center text-sm text-sc-muted">
          Nothing featured yet — check back soon.
        </p>
      ) : (
        <>
          {spotlight && <Spotlight product={spotlight} reason={spotlightReason} />}

          {bestSellers.length > 0 && (
            <Section eyebrow="Customer favourites" title="Best Sellers" subtitle="What shoppers are buying the most right now">
              {grid(bestSellers)}
            </Section>
          )}

          {topRated.length > 0 && (
            <Section eyebrow="Loved & reviewed" title="Top Rated" subtitle="The highest-rated products, straight from buyer reviews">
              {grid(topRated)}
            </Section>
          )}

          {collections.length > 0 && (
            <Section eyebrow="Curated collections" title="Shop the Collections" subtitle="Browse our best by category">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {collections.map((c) => <CollectionCard key={c.category.id} c={c} />)}
              </div>
            </Section>
          )}

          {newArrivals.length > 0 && (
            <Section eyebrow="Just landed" title="New Arrivals" subtitle="Fresh additions to the store">
              {grid(newArrivals)}
            </Section>
          )}
        </>
      )}

      {/* Trust strip */}
      <section className="feat-section grid gap-4 rounded-2xl bg-sc-accent-soft p-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["AI-verified listings", "Every product is checked before it goes live"],
          ["Cash on Delivery", "Pay when your order arrives"],
          ["Secure payments", "Cards, JazzCash & EasyPaisa"],
          ["Honest reviews", "Ratings and reviews from real customers"],
        ].map(([title, sub]) => (
          <div key={title} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sc-accent text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <div className="text-xs text-sc-muted">{sub}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
