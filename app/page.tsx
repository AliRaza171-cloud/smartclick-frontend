import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HeroCarouselWeb from "@/components/HeroCarouselWeb";
import PromoBanner from "@/components/PromoBanner";
import CategoryStrip from "@/components/CategoryStrip";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { fetchProducts } from "@/lib/server-products";

export default async function HomePage() {
  const products = await fetchProducts();

  return (
    <main>
      <Nav />
      <Hero />
      <HeroCarouselWeb />
      <PromoBanner />
      <CategoryStrip />
      {products.length > 0 ? (
        <ProductGrid
          items={products.slice(0, 8)}
          title="Trending Now"
          icon="🔥"
          subtitle="Popular products customers are buying right now"
        />
      ) : (
        <div className="px-6 md:px-18 pb-24 text-sm text-sc-muted">
          No listings yet — check back soon, or head to Admin to add the first one.
        </div>
      )}
      <Footer />
    </main>
  );
}