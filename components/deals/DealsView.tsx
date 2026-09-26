"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/products";
import { CategoryMeta } from "@/lib/categories";
import { resolveImageUrl, apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useGsap } from "@/lib/gsap";
import { PublicVoucher, savingsOf, voucherLabel } from "@/lib/deals";
import DealsHero from "./DealsHero";
import DealCard from "./DealCard";
import DealFilters, { DealFilterState, EMPTY_FILTERS, PRICE_RANGES, countActive } from "./DealFilters";
import {
  ArrowIcon, BotIcon, CloseIcon, FilterIcon, FlameIcon, GridIcon, PiggyIcon, SearchIcon, SparkIcon, TagIcon,
  TicketIcon, TrendIcon,
} from "./icons";

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
const FLASH_LIMIT = 10;

function matches(p: Product, f: DealFilterState, category: string | null) {
  if (category && p.category !== category) return false;
  if (f.price.length && !PRICE_RANGES.some((r) => f.price.includes(r.id) && p.price >= r.min && p.price < r.max)) return false;
  if (f.minDiscount !== null && (p.discountPct ?? 0) < f.minDiscount) return false;
  if (f.minRating !== null && (!p.reviewCount || (p.averageRating ?? 0) < f.minRating)) return false;
  if (f.freeShipping && !p.freeShipping) return false;
  return true;
}

function SectionHeader({
  icon, title, subtitle, action,
}: { icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold md:text-2xl">
          {icon}
          {title}
        </h2>
        <p className="mt-0.5 pl-8 text-xs text-sc-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(code).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="rounded-lg border-2 border-dashed border-sc-accent bg-sc-surface px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-sc-accent transition-colors hover:bg-sc-accent-soft"
    >
      {copied ? "Copied ✓" : code}
    </button>
  );
}

export default function DealsView({
  deals,
  categories,
  badges,
  recommended,
  vouchers,
  campaignMessage,
  campaignEndsAt,
}: {
  deals: Product[]; // every discounted product
  categories: CategoryMeta[];
  badges: Record<string, string>;
  recommended: Product[]; // best sellers, discounted ones first
  vouchers: PublicVoucher[];
  campaignMessage?: string;
  campaignEndsAt?: string | null;
}) {
  const { user } = useAuth();
  const [filters, setFilters] = useState<DealFilterState>(EMPTY_FILTERS);
  const [category, setCategory] = useState<string | null>(null);
  const [showAllFlash, setShowAllFlash] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);

  // Same wishlist lookup ProductGrid does, so hearts show the right state.
  useEffect(() => {
    if (!user) {
      setWishlistedIds(new Set());
      return;
    }
    apiFetch("/wishlist")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { id: string }[]) => setWishlistedIds(new Set(data.map((p) => p.id))))
      .catch(() => setWishlistedIds(new Set()));
  }, [user]);

  // One-time staggered fade-in on load. Deliberately no ScrollTrigger: if a
  // trigger never fires, cards would be stuck invisible. clearProps removes
  // the inline styles afterwards so nothing can be left at opacity 0.
  useEffect(() => {
    const { gsap } = useGsap();
    const cards = rootRef.current?.querySelectorAll(".deal-card");
    if (!cards?.length) return;
    const tween = gsap.fromTo(
      cards,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: "power2.out", clearProps: "opacity,transform" }
    );
    return () => {
      tween.kill();
      gsap.set(cards, { clearProps: "opacity,transform" });
    };
  }, []);

  // Only show category pills that actually have deals right now.
  const dealCategories = useMemo(() => {
    const counts = new Map<string, number>();
    deals.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return categories.filter((c) => counts.has(c.name)).map((c) => ({ ...c, count: counts.get(c.name)! }));
  }, [deals, categories]);

  const filtered = useMemo(() => deals.filter((p) => matches(p, filters, category)), [deals, filters, category]);

  // Admin-pinned flash picks first, then everything else by biggest discount.
  const flash = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => Number(!!b.isFlashDeal) - Number(!!a.isFlashDeal) || (b.discountPct ?? 0) - (a.discountPct ?? 0)
      ),
    [filtered]
  );

  const trending = useMemo(() => {
    const rank = (p: Product) =>
      (badges[p.id] === "Trending" ? 2000 : badges[p.id] === "Best Seller" ? 1000 : 0) +
      (p.reviewCount ?? 0) * (p.averageRating ?? 1);
    return [...filtered].sort((a, b) => rank(b) - rank(a)).slice(0, 5);
  }, [filtered, badges]);

  const recs = useMemo(
    () => recommended.filter((p) => matches(p, filters, category)).slice(0, 5),
    [recommended, filters, category]
  );

  const biggestSavings = useMemo(
    () => [...filtered].sort((a, b) => savingsOf(b) - savingsOf(a)).slice(0, 5),
    [filtered]
  );

  const maxDiscount = useMemo(() => Math.max(0, ...deals.map((p) => p.discountPct ?? 0)), [deals]);
  const showcase = useMemo(
    () =>
      [...deals].sort(
        (a, b) => Number(!!b.isFlashDeal) - Number(!!a.isFlashDeal) || (b.discountPct ?? 0) - (a.discountPct ?? 0)
      ),
    [deals]
  );

  const activeCount = countActive(filters);
  const anyFilter = activeCount > 0 || category !== null;
  const visibleFlash = showAllFlash ? flash : flash.slice(0, FLASH_LIMIT);

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setCategory(null);
  };

  return (
    <div ref={rootRef} className="space-y-8 px-6 pb-20 pt-8 md:px-18">
      <DealsHero
        maxDiscount={maxDiscount}
        showcase={showcase}
        campaignMessage={campaignMessage}
        campaignEndsAt={campaignEndsAt}
      />

      {/* Category pills */}
      {dealCategories.length > 0 && (
        <nav aria-label="Deal categories" className="-mx-6 overflow-x-auto px-6 pb-1 md:-mx-18 md:px-18">
          <div className="flex min-w-max items-start gap-3">
            <button
              onClick={() => setCategory(null)}
              className="flex items-center gap-2 self-center rounded-full px-6 py-3.5 text-sm font-semibold transition-colors"
              style={
                category === null
                  ? { background: "var(--sc-accent)", color: "#fff" }
                  : { background: "var(--sc-surface)", color: "var(--sc-ink)", border: "1px solid var(--sc-border)" }
              }
            >
              <TagIcon size={18} /> All Deals
              <span className="rounded-full bg-black/10 px-2 text-xs">{deals.length}</span>
            </button>
            {dealCategories.map((c) => {
              const active = category === c.name;
              return (
                <button key={c.id} onClick={() => setCategory(active ? null : c.name)} className="group flex w-24 flex-col items-center gap-1.5">
                  <span
                    className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-full border transition-all"
                    style={{
                      borderColor: active ? "var(--sc-accent)" : "var(--sc-border)",
                      background: active ? "var(--sc-accent-soft)" : "var(--sc-surface)",
                      boxShadow: active ? "0 0 0 2px var(--sc-accent)" : undefined,
                    }}
                  >
                    {c.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveImageUrl(c.image_url)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-display text-lg font-bold text-sc-accent">{c.name.charAt(0)}</span>
                    )}
                  </span>
                  <span className={`line-clamp-2 text-center text-xs ${active ? "font-semibold text-sc-accent" : "text-sc-muted"}`}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <DealFilters value={filters} onChange={setFilters} />
          </div>
        </div>

        <div className="min-w-0 space-y-12">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-sc-border bg-sc-surface px-4 py-2 text-sm font-medium"
            >
              <FilterIcon size={15} /> Filters{activeCount > 0 && ` (${activeCount})`}
            </button>
            {anyFilter && (
              <button onClick={clearAll} className="text-xs font-medium text-sc-accent">Clear all</button>
            )}
          </div>

          {/* Flash Deals */}
          <section id="flash-deals" data-deal-section className="scroll-mt-28">
            <SectionHeader
              icon={<FlameIcon size={24} />}
              title="Flash Deals"
              subtitle="Limited time offers. Grab them before they're gone!"
              action={
                flash.length > FLASH_LIMIT ? (
                  <button onClick={() => setShowAllFlash((v) => !v)} className="flex flex-shrink-0 items-center gap-1 text-sm text-sc-accent">
                    {showAllFlash ? "Show less" : `View all (${flash.length})`} <ArrowIcon />
                  </button>
                ) : null
              }
            />
            {visibleFlash.length ? (
              <div className={GRID}>
                {visibleFlash.map((p) => (
                  <DealCard
                    key={p.id}
                    product={p}
                    badge={p.isFlashDeal ? "Flash Deal" : badges[p.id]}
                    initiallyWishlisted={wishlistedIds.has(p.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-sc-border bg-sc-surface py-10 text-center text-sm text-sc-muted">
                {deals.length === 0 ? "No active deals right now — check back soon." : "No deals match these filters."}
                {anyFilter && (
                  <button onClick={clearAll} className="ml-2 font-medium text-sc-accent">Clear filters</button>
                )}
              </div>
            )}
          </section>

          {/* Trending Deals */}
          {trending.length > 0 && (
            <section data-deal-section>
              <SectionHeader icon={<TrendIcon size={24} />} title="Trending Deals" subtitle="Most popular deals right now" />
              <div className={GRID}>
                {trending.map((p) => <DealCard key={p.id} product={p} variant="compact" />)}
              </div>
            </section>
          )}

          {/* Smart Click Recommends */}
          {recs.length > 0 && (
            <section data-deal-section className="rounded-2xl bg-sc-accent-soft p-4 sm:p-5">
              <SectionHeader
                icon={<BotIcon size={24} color="var(--sc-accent)" />}
                title="Smart Click Recommends"
                subtitle="Our best sellers — loved by customers"
                action={
                  <Link href="/categories" className="flex flex-shrink-0 items-center gap-1 text-sm text-sc-accent">
                    View all <ArrowIcon />
                  </Link>
                }
              />
              <div className={GRID}>
                {recs.map((p) => <DealCard key={p.id} product={p} variant="compact" />)}
              </div>
            </section>
          )}

          {/* Biggest Savings (in place of "Almost Sold Out" — products have no stock field yet) */}
          {biggestSavings.length > 0 && (
            <section data-deal-section>
              <SectionHeader
                icon={<PiggyIcon size={24} color="#E85D3A" />}
                title="Biggest Savings"
                subtitle="The most rupees off, right now"
              />
              <div className={GRID}>
                {biggestSavings.map((p) => <DealCard key={p.id} product={p} variant="row" />)}
              </div>
            </section>
          )}

          {/* Voucher banner (in place of "Bundle & Save") */}
          {vouchers.length > 0 ? (
            <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-sc-border bg-gradient-to-r from-[#FFF4E8] via-[#FDEEF1] to-sc-accent-soft p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-4">
                <TicketIcon size={44} color="#E85D3A" className="flex-shrink-0" />
                <div>
                  <h3 className="font-display text-lg font-semibold">Extra savings with vouchers</h3>
                  <p className="text-sm text-sc-muted">{voucherLabel(vouchers[0])} — apply the code at checkout.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {vouchers.slice(0, 3).map((v) => <CopyCode key={v.code} code={v.code} />)}
              </div>
            </section>
          ) : (
            <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-sc-border bg-gradient-to-r from-[#FFF4E8] via-[#FDEEF1] to-sc-accent-soft p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-4">
                <GridIcon size={40} color="#E85D3A" className="flex-shrink-0" />
                <div>
                  <h3 className="font-display text-lg font-semibold">Explore every category</h3>
                  <p className="text-sm text-sc-muted">New products added by our AI-curated catalog every week.</p>
                </div>
              </div>
              <Link
                href="/categories"
                className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
                style={{ background: "var(--sc-accent)" }}
              >
                Browse Categories <ArrowIcon />
              </Link>
            </section>
          )}
        </div>
      </div>

      {/* Still looking */}
      <section className="flex flex-col gap-4 rounded-2xl bg-[#141413] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-center gap-4">
          <SparkIcon size={36} color="#FDE047" className="flex-shrink-0" />
          <div>
            <h3 className="font-display text-lg font-semibold">Still looking for something?</h3>
            <p className="text-sm text-white/70">Use our smart search or explore more categories</p>
          </div>
        </div>
        <form action="/search" className="flex w-full overflow-hidden rounded-lg bg-white md:max-w-lg">
          <input
            name="q"
            required
            placeholder="Search for products, brands and more..."
            className="min-w-0 flex-1 px-4 py-3 text-sm text-sc-ink outline-none"
          />
          <button type="submit" aria-label="Search" className="px-5 text-white" style={{ background: "var(--sc-accent)" }}>
            <SearchIcon size={18} />
          </button>
        </form>
      </section>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col bg-sc-bg">
            <div className="flex justify-end p-4 pb-2">
              <button aria-label="Close filters" onClick={() => setDrawerOpen(false)}>
                <CloseIcon size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              <DealFilters value={filters} onChange={setFilters} />
            </div>
            <div className="p-4">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-lg py-3 text-sm font-semibold text-white"
                style={{ background: "var(--sc-accent)" }}
              >
                Show {filtered.length} deal{filtered.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
