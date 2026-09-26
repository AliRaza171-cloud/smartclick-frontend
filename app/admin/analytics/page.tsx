"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

interface ProductStat {
  product_id: string;
  title: string;
  count: number;
}

interface Summary {
  total_unique_visitors: number;
  total_page_views: number;
  most_viewed_products: ProductStat[];
  most_added_to_cart: ProductStat[];
  most_wishlisted: ProductStat[];
}

function StatList({ title, items }: { title: string; items: ProductStat[] }) {
  return (
    <div className="bg-white border border-sc-border rounded-xl p-5">
      <h2 className="font-display text-lg font-semibold mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-sc-faint">No data yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={item.product_id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="text-sc-faint w-4">{i + 1}.</span>
                {item.title}
              </span>
              <span className="font-semibold">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || user?.role !== "admin") return;
    apiFetch("/analytics/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setSummary(data);
        setLoading(false);
      });
  }, [authLoading, user]);

  if (authLoading) return null;
  if (!user || user.role !== "admin") {
    return <div className="p-10 text-sm text-sc-muted">Admin access required.</div>;
  }
  if (loading || !summary) return <div className="p-10 text-sm text-sc-muted">Loading analytics…</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold mb-8">Analytics</h1>

      <div className="grid grid-cols-2 gap-5 mb-8">
        <div className="bg-white border border-sc-border rounded-xl p-5">
          <div className="text-xs text-sc-faint mb-1">Unique visitors</div>
          <div className="font-display text-3xl font-bold">{summary.total_unique_visitors}</div>
        </div>
        <div className="bg-white border border-sc-border rounded-xl p-5">
          <div className="text-xs text-sc-faint mb-1">Total page views</div>
          <div className="font-display text-3xl font-bold">{summary.total_page_views}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatList title="Most viewed products" items={summary.most_viewed_products} />
        <StatList title="Most added to cart" items={summary.most_added_to_cart} />
        <StatList title="Most wishlisted" items={summary.most_wishlisted} />
      </div>
    </div>
  );
}