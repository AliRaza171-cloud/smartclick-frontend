"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGsap } from "@/lib/gsap";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Product } from "@/lib/products";
import ProductCard from "./ProductCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ProductGrid({
  items,
  title = "Trending now",
  icon,
  subtitle,
}: {
  items: Product[];
  title?: string;
  icon?: string;
  subtitle?: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [badges, setBadges] = useState<Record<string, string>>({});
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`${API_BASE}/products/badges`)
      .then((r) => (r.ok ? r.json() : {}))
      .then(setBadges)
      .catch(() => setBadges({}));
  }, []);

  useEffect(() => {
    if (!user) {
      setWishlistedIds(new Set());
      return;
    }
    apiFetch("/wishlist")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { id: string }[]) => setWishlistedIds(new Set(data.map((p) => p.id))))
      .catch(() => setWishlistedIds(new Set()));
  }, [user]);

  useEffect(() => {
    const { gsap, ScrollTrigger } = useGsap();
    const ctx = gsap.context(() => {
      gsap.from(".product-card", {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
      });
    }, gridRef);
    return () => ctx.revert();
  }, [items]);

  return (
    <div className="px-6 md:px-18 pb-24">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        <Link href="/categories" className="text-sm text-sc-accent">View all →</Link>
      </div>
      {subtitle && <p className="text-sm text-sc-muted mb-7">{subtitle}</p>}
      {!subtitle && <div className="mb-7" />}
      <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            badge={badges[p.id]}
            initiallyWishlisted={wishlistedIds.has(p.id)}
          />
        ))}
      </div>
    </div>
  );
}