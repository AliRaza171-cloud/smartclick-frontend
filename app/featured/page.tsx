// import Nav from "@/components/Nav";
// import ProductGrid from "@/components/ProductGrid";
// import Footer from "@/components/Footer";
// import { fetchProducts } from "@/lib/server-products";

// export default async function FeaturedPage() {
//   const allProducts = await fetchProducts();
//   const featured = allProducts.filter((p) => p.discountPct);

//   return (
//     <main>
//       <Nav />
//       <div className="px-6 md:px-18 pt-10 pb-4">
//         <h1 className="font-display text-3xl font-semibold mb-2">Featured</h1>
//         <p className="text-sm text-sc-muted">A closer look at listings worth your attention right now.</p>
//       </div>
//       {featured.length > 0 ? (
//         <ProductGrid items={featured} title={`${featured.length} featured product${featured.length === 1 ? "" : "s"}`} />
//       ) : (
//         <div className="px-6 md:px-18 pb-24 text-sm text-sc-muted">Nothing featured right now — check back soon.</div>
//       )}
//       <Footer />
//     </main>
//   );
// }

import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FeaturedView, { Collection } from "@/components/featured/FeaturedView";
import { fetchProducts } from "@/lib/server-products";
import { fetchCategories } from "@/lib/categories";
import { fetchBadges, fetchBestSellerIds } from "@/lib/deals";
import { Product } from "@/lib/products";

export const metadata: Metadata = {
  title: "Featured | Smart Click",
  description: "The Featured Edit — Smart Click's best sellers, top-rated products, collections and new arrivals.",
};

const PER_SECTION = 4;

export default async function FeaturedPage() {
  const [products, categories, badges, bestSellerIds] = await Promise.all([
    fetchProducts(), // newest first (backend orders by created_at desc)
    fetchCategories(),
    fetchBadges(),
    fetchBestSellerIds(12),
  ]);

  const byId = new Map(products.map((p) => [p.id, p]));
  const bestRanked = bestSellerIds.map((id) => byId.get(id)).filter((p): p is Product => !!p);
  const rated = products
    .filter((p) => p.reviewCount && (p.averageRating ?? 0) >= 3.5)
    .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0));

  // Spotlight: #1 best seller, else the top-rated product, else the newest.
  let spotlight: Product | null = null;
  let spotlightReason = "";
  if (bestRanked[0] && badges[bestRanked[0].id] === "Best Seller") {
    spotlight = bestRanked[0];
    spotlightReason = "Our #1 best seller";
  } else if (rated[0]) {
    spotlight = rated[0];
    spotlightReason = "Highest rated by customers";
  } else if (products[0]) {
    spotlight = products[0];
    spotlightReason = "Newest in store";
  }

  // Each product appears in at most one section, so small catalogs don't repeat.
  const used = new Set<string>(spotlight ? [spotlight.id] : []);
  const take = (list: Product[]) => {
    const picked = list.filter((p) => !used.has(p.id)).slice(0, PER_SECTION);
    picked.forEach((p) => used.add(p.id));
    return picked;
  };
  // Only real sellers count as best sellers (the endpoint falls back to newest when there are no orders).
  const bestSellers = take(bestRanked.filter((p) => badges[p.id] === "Best Seller"));
  const topRated = take(rated);
  const newArrivals = take(products);

  const collections: Collection[] = categories
    .map((category) => {
      const inCat = products.filter((p) => p.category === category.name);
      return {
        category,
        count: inCat.length,
        images: inCat.map((p) => p.imageUrl).filter((u): u is string => !!u).slice(0, 3),
      };
    })
    .filter((c) => c.count > 0)
    .slice(0, 6);

  return (
    <main>
      <Nav />
      <FeaturedView
        spotlight={spotlight}
        spotlightReason={spotlightReason}
        bestSellers={bestSellers}
        topRated={topRated}
        newArrivals={newArrivals}
        collections={collections}
        badges={badges}
        productCount={products.length}
      />
      <Footer />
    </main>
  );
}