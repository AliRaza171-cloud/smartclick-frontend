// // import Nav from "@/components/Nav";
// // import ProductGrid from "@/components/ProductGrid";
// // import Footer from "@/components/Footer";
// // import { fetchProducts } from "@/lib/server-products";

// // export default async function DealsPage() {
// //   const allProducts = await fetchProducts();
// //   const deals = allProducts.filter((p) => p.discountPct);

// //   return (
// //     <main>
// //       <Nav />
// //       <div className="px-6 md:px-18 pt-10 pb-4">
// //         <h1 className="font-display text-3xl font-semibold mb-2">Deals</h1>
// //         <p className="text-sm text-sc-muted">Every listing here has a discount applied.</p>
// //       </div>
// //       {deals.length > 0 ? (
// //         <ProductGrid items={deals} title={`${deals.length} deal${deals.length === 1 ? "" : "s"}`} />
// //       ) : (
// //         <div className="px-6 md:px-18 pb-24 text-sm text-sc-muted">No active deals right now — check back soon.</div>
// //       )}
// //       <Footer />
// //     </main>
// //   );
// // }

// import type { Metadata } from "next";
// import Nav from "@/components/Nav";
// import Footer from "@/components/Footer";
// import DealsView from "@/components/deals/DealsView";
// import { fetchProducts } from "@/lib/server-products";
// import { fetchCategories } from "@/lib/categories";
// import { fetchActiveCampaigns, fetchActiveVouchers, fetchBadges, fetchBestSellerIds } from "@/lib/deals";

// export const metadata: Metadata = {
//   title: "Deals | Smart Click",
//   description: "Today's best deals, flash sales and biggest savings on Smart Click.",
// };

// export default async function DealsPage() {
//   const [allProducts, categories, badges, bestSellerIds, campaigns, vouchers] = await Promise.all([
//     fetchProducts(),
//     fetchCategories(),
//     fetchBadges(),
//     fetchBestSellerIds(10),
//     fetchActiveCampaigns(),
//     fetchActiveVouchers(),
//   ]);

//   const deals = allProducts.filter((p) => p.discountPct);

//   // Best sellers, discounted ones first (it's the Deals page after all).
//   const byId = new Map(allProducts.map((p) => [p.id, p]));
//   const bestSellers = bestSellerIds.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => !!p);
//   const recommended = [...bestSellers.filter((p) => p.discountPct), ...bestSellers.filter((p) => !p.discountPct)];

//   const campaign = campaigns[0];

//   return (
//     <main>
//       <Nav />
//       <DealsView
//         deals={deals}
//         categories={categories}
//         badges={badges}
//         recommended={recommended}
//         vouchers={vouchers}
//         campaignMessage={campaign?.message}
//         campaignEndsAt={campaign?.end_at}
//       />
//       <Footer />
//     </main>
//   );
// }
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DealsView from "@/components/deals/DealsView";
import { fetchProducts } from "@/lib/server-products";
import { fetchCategories } from "@/lib/categories";
import { fetchActiveCampaigns, fetchActiveVouchers, fetchBadges, fetchBestSellerIds } from "@/lib/deals";

export const metadata: Metadata = {
  title: "Deals | Smart Click",
  description: "Today's best deals, flash sales and biggest savings on Smart Click.",
};

export default async function DealsPage() {
  const [allProducts, categories, badges, bestSellerIds, campaigns, vouchers] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchBadges(),
    fetchBestSellerIds(10),
    fetchActiveCampaigns(),
    fetchActiveVouchers(),
  ]);

  const deals = allProducts.filter((p) => p.discountPct);

  // Best sellers, discounted ones first (it's the Deals page after all).
  const byId = new Map(allProducts.map((p) => [p.id, p]));
  const bestSellers = bestSellerIds.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => !!p);
  const recommended = [...bestSellers.filter((p) => p.discountPct), ...bestSellers.filter((p) => !p.discountPct)];

  const campaign = campaigns[0];

  return (
    <main>
      <Nav />
      <DealsView
        deals={deals}
        categories={categories}
        badges={badges}
        recommended={recommended}
        vouchers={vouchers}
        campaignMessage={campaign?.message}
        campaignEndsAt={campaign?.end_at}
      />
      <Footer />
    </main>
  );
}
