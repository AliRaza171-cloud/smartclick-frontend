"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Product } from "@/lib/products";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const res = await apiFetch("/wishlist");
      if (res.ok) {
        const data = await res.json();
        setItems(
          data.map((p: any) => {
            const original = parseFloat(p.price);
            const discounted = p.discount_pct ? Math.round(original * (1 - p.discount_pct / 100)) : original;
            return {
              id: p.id,
              name: p.title,
              description: p.description,
              category: p.category,
              price: discounted,
              originalPrice: p.discount_pct ? original : undefined,
              discountPct: p.discount_pct ?? undefined,
              freeShipping: p.free_shipping,
              imageUrl: p.image_urls[0] ? `${API_BASE}${p.image_urls[0]}` : undefined,
            };
          })
        );
      }
      setLoading(false);
    })();
  }, [authLoading, user]);

  if (authLoading || loading) return null;

  return (
    <main>
      <Nav />
      <div className="px-6 md:px-18 pt-10 pb-4">
        <h1 className="font-display text-3xl font-semibold mb-2">Your wishlist</h1>
      </div>
      {!user ? (
        <div className="px-6 md:px-18 pb-24 text-sm text-sc-muted">
          <a href="/login" className="text-sc-accent">Sign in</a> to see your saved items.
        </div>
      ) : items.length > 0 ? (
        <ProductGrid items={items} title={`${items.length} saved item${items.length === 1 ? "" : "s"}`} />
      ) : (
        <div className="px-6 md:px-18 pb-24 text-sm text-sc-muted">
          Nothing saved yet — tap the heart icon on any product to add it here.
        </div>
      )}
      <Footer />
    </main>
  );
}