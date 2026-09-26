import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { fetchCategories, getCategoryBySlug } from "@/lib/categories";
import { fetchProducts } from "@/lib/server-products";
export const dynamic = "force-dynamic";

// Categories are dynamic now (an admin can add one at any time), so this
// fetches the current list at build/request time instead of a fixed array.
export async function generateStaticParams() {
  const categoryList = await fetchCategories();
  return categoryList.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  return { title: category ? `${category.name} — Smart Click` : "Smart Click" };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const items = await fetchProducts(category.name);

  return (
    <main>
      <Nav />
      <div className="text-xs text-sc-faint px-6 md:px-18 pt-6">
        <Link href="/">Home</Link> / <Link href="/categories">Categories</Link> / {category.name}
      </div>

      <div className="px-6 md:px-18 pt-6 pb-4">
        <h1 className="font-display text-4xl font-semibold mb-3">{category.name}</h1>
        {category.tagline && <p className="text-sm text-sc-muted max-w-md">{category.tagline}</p>}
      </div>

      {items.length > 0 ? (
        <ProductGrid items={items} title={`${items.length} product${items.length === 1 ? "" : "s"}`} />
      ) : (
        <div className="px-6 md:px-18 pb-24 text-sm text-sc-muted">
          No listings in this category yet.
        </div>
      )}
      <Footer />
    </main>
  );
}