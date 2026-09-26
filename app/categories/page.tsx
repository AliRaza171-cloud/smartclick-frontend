import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { fetchCategories } from "@/lib/categories";
import { fetchProducts } from "@/lib/server-products";
import { resolveImageUrl } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default async function CategoriesOverviewPage() {
  const [categoryList, allProducts] = await Promise.all([fetchCategories(), fetchProducts()]);

  return (
    <main>
      <Nav />
      <div className="px-6 md:px-18 py-10">
        <h1 className="font-display text-3xl font-semibold mb-2">Categories</h1>
        <p className="text-sm text-sc-muted mb-10">Every listing sorted and AI-verified before it goes live.</p>

        {categoryList.length === 0 ? (
          <p className="text-sm text-sc-muted">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryList.map((c) => {
              const count = allProducts.filter((p) => p.category === c.name).length;
              return (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="relative overflow-hidden rounded-2xl p-8 flex flex-col justify-between h-48 border border-sc-border"
                  style={
                    c.image_url
                      ? {
                          backgroundImage: `linear-gradient(to top, rgba(14,23,18,0.75), rgba(14,23,18,0.15)), url(${resolveImageUrl(c.image_url)})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : { background: "white" }
                  }
                >
                  <div>
                    <h2
                      className="font-display text-2xl font-semibold mb-2"
                      style={{ color: c.image_url ? "#F3F2EE" : undefined }}
                    >
                      {c.name}
                    </h2>
                    {c.tagline && (
                      <p
                        className="text-sm max-w-sm"
                        style={{ color: c.image_url ? "#D8D6CE" : "var(--sc-muted)" }}
                      >
                        {c.tagline}
                      </p>
                    )}
                  </div>
                  <div className="text-xs" style={{ color: c.image_url ? "#22C08C" : "var(--sc-accent)" }}>
                    {count} product{count === 1 ? "" : "s"} →
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}