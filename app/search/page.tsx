import Nav from "@/components/Nav";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { fetchProducts } from "@/lib/server-products";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() || "";
  const results = query ? await fetchProducts(undefined, query) : [];

  return (
    <main>
      <Nav />
      <div className="px-6 md:px-18 pt-10 pb-4">
        <h1 className="font-display text-3xl font-semibold mb-2">
          {query ? `Results for "${query}"` : "Search"}
        </h1>
        {query && (
          <p className="text-sm text-sc-muted">
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>
        )}
      </div>
      {query && results.length === 0 ? (
        <div className="px-6 md:px-18 pb-24 text-sm text-sc-muted">
          Nothing matched "{query}" — try a different search.
        </div>
      ) : query ? (
        <ProductGrid items={results} title="Search results" />
      ) : null}
      <Footer />
    </main>
  );
}