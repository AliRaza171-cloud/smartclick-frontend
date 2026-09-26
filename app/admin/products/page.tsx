"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, resolveImageUrl } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Product {
  id: string;
  title: string;
  price: string;
  category: string;
  is_active: boolean;
  image_urls: string[];
}

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function load() {
    const res = await apiFetch("/products/admin/all");
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    if (authLoading || user?.role !== "admin") return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  async function handleToggleActive(product: Product) {
    setTogglingId(product.id);
    await apiFetch(`/products/${product.id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: !product.is_active }),
    });
    setTogglingId(null);
    load();
  }

  if (authLoading) return null;
  if (!user || user.role !== "admin") {
    return <div className="p-10 text-sm text-sc-muted">Admin access required.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg text-white text-sm font-semibold px-5 py-2.5"
          style={{ background: "var(--sc-accent)" }}
        >
          + Add product
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-sc-muted">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-sc-muted">No products yet.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-sc-border rounded-xl p-4 flex items-center gap-4"
              style={{ opacity: p.is_active ? 1 : 0.55 }}
            >
              <div
                className="w-16 h-16 rounded-lg bg-[#F3F2EE] bg-cover bg-center flex-shrink-0"
                style={p.image_urls[0] ? { backgroundImage: `url(${resolveImageUrl(p.image_urls[0])})` } : undefined}
              />
              <div className="flex-1">
                <div className="text-sm font-semibold flex items-center gap-2">
                  {p.title}
                  {!p.is_active && (
                    <span className="text-xs font-normal text-sc-faint border border-sc-border rounded-full px-2 py-0.5">
                      Deactivated
                    </span>
                  )}
                </div>
                <div className="text-xs text-sc-muted">{p.category} · Rs. {parseFloat(p.price).toLocaleString()}</div>
              </div>
              <button
                onClick={() => handleToggleActive(p)}
                disabled={togglingId === p.id}
                className="text-xs font-semibold border rounded-lg px-4 py-2 disabled:opacity-50"
                style={
                  p.is_active
                    ? { borderColor: "#DC2626", color: "#DC2626" }
                    : { borderColor: "var(--sc-accent)", color: "var(--sc-accent)" }
                }
              >
                {togglingId === p.id ? "..." : p.is_active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}