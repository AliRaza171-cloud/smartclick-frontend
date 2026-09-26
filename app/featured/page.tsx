import Nav from "@/components/Nav";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { fetchProducts } from "@/lib/server-products";

export default async function FeaturedPage() {
  const allProducts = await fetchProducts();
  const featured = allProducts.filter((p) => p.discountPct);

  return (
    <main>
      <Nav />
      <div className="px-6 md:px-18 pt-10 pb-4">
        <h1 className="font-display text-3xl font-semibold mb-2">Featured</h1>
        <p className="text-sm text-sc-muted">A closer look at listings worth your attention right now.</p>
      </div>
      {featured.length > 0 ? (
        <ProductGrid items={featured} title={`${featured.length} featured product${featured.length === 1 ? "" : "s"}`} />
      ) : (
        <div className="px-6 md:px-18 pb-24 text-sm text-sc-muted">Nothing featured right now — check back soon.</div>
      )}
      <Footer />
    </main>
  );
}