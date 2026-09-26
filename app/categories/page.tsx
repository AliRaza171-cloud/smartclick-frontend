// import Link from "next/link";
// import Nav from "@/components/Nav";
// import Footer from "@/components/Footer";
// import { fetchCategories } from "@/lib/categories";
// import { fetchProducts } from "@/lib/server-products";
// import { resolveImageUrl } from "@/lib/api";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export default async function CategoriesOverviewPage() {
//   const [categoryList, allProducts] = await Promise.all([fetchCategories(), fetchProducts()]);

//   return (
//     <main>
//       <Nav />
//       <div className="px-6 md:px-18 py-10">
//         <h1 className="font-display text-3xl font-semibold mb-2">Categories</h1>
//         <p className="text-sm text-sc-muted mb-10">Every listing sorted and AI-verified before it goes live.</p>

//         {categoryList.length === 0 ? (
//           <p className="text-sm text-sc-muted">No categories yet.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {categoryList.map((c) => {
//               const count = allProducts.filter((p) => p.category === c.name).length;
//               return (
//                 <Link
//                   key={c.slug}
//                   href={`/category/${c.slug}`}
//                   className="relative overflow-hidden rounded-2xl p-8 flex flex-col justify-between h-48 border border-sc-border"
//                   style={
//                     c.image_url
//                       ? {
//                           backgroundImage: `linear-gradient(to top, rgba(14,23,18,0.75), rgba(14,23,18,0.15)), url(${resolveImageUrl(c.image_url)})`,
//                           backgroundSize: "cover",
//                           backgroundPosition: "center",
//                         }
//                       : { background: "white" }
//                   }
//                 >
//                   <div>
//                     <h2
//                       className="font-display text-2xl font-semibold mb-2"
//                       style={{ color: c.image_url ? "#F3F2EE" : undefined }}
//                     >
//                       {c.name}
//                     </h2>
//                     {c.tagline && (
//                       <p
//                         className="text-sm max-w-sm"
//                         style={{ color: c.image_url ? "#D8D6CE" : "var(--sc-muted)" }}
//                       >
//                         {c.tagline}
//                       </p>
//                     )}
//                   </div>
//                   <div className="text-xs" style={{ color: c.image_url ? "#22C08C" : "var(--sc-accent)" }}>
//                     {count} product{count === 1 ? "" : "s"} →
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>
//         )}
//       </div>
//       <Footer />
//     </main>
//   );
// }


import type { Metadata } from "next";
import Link from "next/link";
import { Caveat } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CategoryTiles, { CategoryWithCount } from "@/components/categories/CategoryTiles";
import { fetchCategories } from "@/lib/categories";
import { fetchProducts } from "@/lib/server-products";
import { fetchActiveVouchers, fetchBestSellerIds, formatRs } from "@/lib/deals";
import { Product } from "@/lib/products";

const script = Caveat({ subsets: ["latin"], weight: ["600"] });

export const metadata: Metadata = {
  title: "Categories | Smart Click",
  description: "Explore every Smart Click category — from the latest electronics to everyday essentials.",
};

const Arrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function TrustItem({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sc-accent">{icon}</span>
      <div className="text-xs leading-tight text-sc-muted">
        <div>{title}</div>
        <div>{sub}</div>
      </div>
    </div>
  );
}

function PromoImage({ product, className }: { product?: Product; className: string }) {
  if (!product?.imageUrl) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={product.imageUrl}
      alt={product.name}
      className={`${className} object-cover shadow-lg transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2`}
    />
  );
}

export default async function CategoriesPage() {
  const [categoryList, allProducts, vouchers, bestSellerIds] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
    fetchActiveVouchers(),
    fetchBestSellerIds(1),
  ]);

  const counts = new Map<string, number>();
  allProducts.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
  const categories: CategoryWithCount[] = categoryList.map((c) => ({ ...c, count: counts.get(c.name) ?? 0 }));

  // --- promo card data (all real) ---
  const discounted = allProducts.filter((p) => p.discountPct).sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0));
  const maxDiscount = discounted[0]?.discountPct ?? 0;

  const freeShipVoucher = vouchers.find((v) => v.grants_free_shipping);
  const freeShipCount = allProducts.filter((p) => p.freeShipping).length;
  const freeShipLine = freeShipVoucher
    ? freeShipVoucher.min_order_value
      ? `Code ${freeShipVoucher.code} on orders above ${formatRs(parseFloat(freeShipVoucher.min_order_value))}`
      : `Use code ${freeShipVoucher.code} at checkout`
    : freeShipCount > 0
      ? `On ${freeShipCount} product${freeShipCount === 1 ? "" : "s"} across the store`
      : "Look for the free shipping tag on products";

  const topSeller = allProducts.find((p) => p.id === bestSellerIds[0]);

  return (
    <main>
      <Nav />

      <div className="px-6 pb-20 pt-10 md:px-18">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: "var(--sc-accent)" }}>
              Shop by Category
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              Explore Our <span className="text-sc-accent">Categories</span>
            </h1>
            <p className="mt-2 text-sm text-sc-muted">
              Find exactly what you need, from the latest electronics to everyday essentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-wrap gap-x-7 gap-y-3 rounded-2xl bg-sc-accent-soft px-5 py-3.5">
              <TrustItem
                title="Fast & Reliable" sub="Shipping"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M1 4h14v11H1zM15 8h4l4 4v3h-8z" /><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="18.5" cy="17.5" r="2.5" /></svg>
                }
              />
              <TrustItem
                title="Secure" sub="Payments"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l9 4v6c0 5.5-3.8 10.7-9 12-5.2-1.3-9-6.5-9-12V5z" /><path d="M8 12l3 3 5-6" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                }
              />
              <TrustItem
                title="Cash on" sub="Delivery"
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></svg>
                }
              />
            </div>
            <div className={`${script.className} hidden -rotate-6 text-3xl leading-7 text-sc-accent xl:block`}>
              Shop Smarter
              <br />
              <span className="pl-6">Live Better</span>
            </div>
          </div>
        </div>

        {/* Category grid */}
        <div className="mt-10">
          {categories.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sc-border bg-sc-surface py-12 text-center text-sm text-sc-muted">
              No categories yet — check back soon.
            </p>
          ) : (
            <CategoryTiles items={categories} />
          )}
        </div>

        {/* Promo cards */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {/* Flash sale */}
          <Link href="/deals" className="group relative flex min-h-[170px] overflow-hidden rounded-2xl bg-[#0E1712] p-6 text-white">
            <div className="relative z-10 flex max-w-[60%] flex-col">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wide text-[#FACC15]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h8l-1 8 10-12h-8z" /></svg>
                FLASH SALE
              </div>
              <div className="mt-2 font-display text-2xl font-bold">
                {maxDiscount > 0 ? `Up to ${maxDiscount}% OFF` : "Fresh deals daily"}
              </div>
              <p className="mt-1 text-xs text-white/70">Limited time only. Don&apos;t miss out!</p>
              <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-[#FACC15] px-4 py-1.5 text-xs font-bold text-[#141413]" style={{ marginTop: 18 }}>
                Shop Now <Arrow />
              </span>
            </div>
            <PromoImage product={discounted[0]} className="absolute -right-4 bottom-4 top-4 w-40 rounded-2xl opacity-90" />
            {maxDiscount > 0 && (
              <div className="absolute right-4 top-4 z-10 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#22C08C] text-center font-bold leading-none text-white shadow-lg">
                <span className="text-[8px]">UP TO</span>
                <span className="text-base">{maxDiscount}%</span>
                <span className="text-[8px]">OFF</span>
              </div>
            )}
          </Link>

          {/* Free shipping */}
          <Link href="/deals" className="group relative flex min-h-[170px] overflow-hidden rounded-2xl bg-sc-accent-soft p-6">
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center gap-2 font-display text-lg font-bold text-sc-accent">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M1 4h14v11H1zM15 8h4l4 4v3h-8z" /><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="18.5" cy="17.5" r="2.5" /></svg>
                FREE SHIPPING
              </div>
              <p className="mt-1 max-w-[65%] text-sm text-sc-muted">{freeShipLine}</p>
              <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-sc-border bg-sc-surface px-4 py-1.5 text-xs font-semibold" style={{ marginTop: 18 }}>
                Shop Now <Arrow />
              </span>
            </div>
            <svg className="absolute -right-2 bottom-3 w-40 text-sc-accent opacity-90 transition-transform duration-500 group-hover:translate-x-2" viewBox="0 0 120 80" fill="none" aria-hidden>
              <path d="M8 30h14M2 42h20M10 54h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".35" />
              <path d="M34 22l34-12 34 12v38l-34 12-34-12z" fill="#D9A066" />
              <path d="M34 22l34 12 34-12M68 34v38" stroke="#B07A45" strokeWidth="2" />
              <path d="M51 16l34 12v10" stroke="#F3E3CC" strokeWidth="5" />
              <text x="40" y="52" fontSize="7" fontWeight="700" fill="#7A4E22" fontFamily="sans-serif">SmartClick</text>
            </svg>
          </Link>

          {/* Best sellers */}
          <Link
            href={topSeller ? `/product/${topSeller.id}` : "/featured"}
            className="group relative flex min-h-[170px] overflow-hidden rounded-2xl p-6 text-white"
            style={{ background: "linear-gradient(120deg, #4C3BCF 0%, #6D4BE8 55%, #8B5CF6 100%)" }}
          >
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wide text-white/90">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FACC15"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                BEST SELLER
              </div>
              <div className="mt-2 max-w-[60%] font-display text-2xl font-bold leading-tight">
                {topSeller ? topSeller.name : "Top Rated Products"}
              </div>
              <p className="mt-1 text-xs text-white/75">
                {topSeller?.reviewCount
                  ? `★ ${(topSeller.averageRating ?? 0).toFixed(1)} from ${topSeller.reviewCount} review${topSeller.reviewCount === 1 ? "" : "s"}`
                  : "Loved by our customers"}
              </p>
              <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#4C3BCF]" style={{ marginTop: 18 }}>
                {topSeller ? "View Product" : "View Featured"} <Arrow />
              </span>
            </div>
            <PromoImage product={topSeller} className="absolute bottom-4 right-4 top-4 w-36 rounded-2xl" />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
