import Nav from "@/components/Nav";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { fetchProducts } from "@/lib/server-products";

export default async function DealsPage() {
  const allProducts = await fetchProducts();
  const deals = allProducts.filter((p) => p.discountPct);

  return (
    <main>
      <Nav />
      <div className="px-6 md:px-18 pt-10 pb-4">
        <h1 className="font-display text-3xl font-semibold mb-2">Deals</h1>
        <p className="text-sm text-sc-muted">Every listing here has a discount applied.</p>
      </div>
      {deals.length > 0 ? (
        <ProductGrid items={deals} title={`${deals.length} deal${deals.length === 1 ? "" : "s"}`} />
      ) : (
        <div className="px-6 md:px-18 pb-24 text-sm text-sc-muted">No active deals right now — check back soon.</div>
      )}
      <Footer />
    </main>
  );
}