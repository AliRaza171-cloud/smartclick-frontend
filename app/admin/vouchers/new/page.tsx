"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, extractErrorMessage } from "@/lib/api";

interface ProductOption {
  id: string;
  title: string;
}

export default function NewVoucherPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [grantsFreeShipping, setGrantsFreeShipping] = useState(false);
  const [scope, setScope] = useState<"store" | "products">("store");
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${API_BASE}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data.map((p: any) => ({ id: p.id, title: p.title }))))
      .catch(() => {});
  }, []);

  function toggleProduct(id: string) {
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!grantsFreeShipping && (!discountValue || parseFloat(discountValue) <= 0)) {
      setError("Set a discount value above 0, or enable free shipping.");
      return;
    }
    if (scope === "products" && selectedProductIds.length === 0) {
      setError("Select at least one product, or switch scope to entire store.");
      return;
    }

    setSubmitting(true);
    const res = await apiFetch("/vouchers", {
      method: "POST",
      body: JSON.stringify({
        code,
        discount_type: discountType,
        discount_value: discountValue || "0",
        min_order_value: minOrderValue || null,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        expires_at: expiresAt || null,
        grants_free_shipping: grantsFreeShipping,
        applicable_product_ids: scope === "products" ? selectedProductIds : null,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(extractErrorMessage(body, "Couldn't create this voucher."));
      return;
    }
    router.push("/admin/vouchers");
  }

  if (authLoading) return null;
  if (!user || user.role !== "admin") {
    return <div className="p-10 text-sm text-sc-muted">Admin access required.</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold mb-8">New voucher</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">Code</label>
          <input
            required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SAVE20"
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Discount type</label>
            <select
              value={discountType} onChange={(e) => setDiscountType(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
            >
              <option value="percent">Percent off</option>
              <option value="flat">Flat amount off (Rs.)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Discount value</label>
            <input
              type="number" min="0" step="0.01" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={grantsFreeShipping ? "Optional if free shipping only" : "e.g. 20"}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={grantsFreeShipping} onChange={(e) => setGrantsFreeShipping(e.target.checked)} />
          Grants free shipping
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Minimum order (optional)</label>
            <input
              type="number" min="0" step="0.01" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Usage limit (optional)</label>
            <input
              type="number" min="1" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="Unlimited"
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Expires (optional)</label>
          <input
            type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Applies to</label>
          <div className="flex gap-3 mb-3">
            <button
              type="button" onClick={() => setScope("store")}
              className="flex-1 rounded-lg border py-2.5 text-sm font-semibold"
              style={{
                borderColor: scope === "store" ? "var(--sc-accent)" : "var(--sc-border)",
                background: scope === "store" ? "var(--sc-accent-soft)" : "white",
              }}
            >
              Entire store
            </button>
            <button
              type="button" onClick={() => setScope("products")}
              className="flex-1 rounded-lg border py-2.5 text-sm font-semibold"
              style={{
                borderColor: scope === "products" ? "var(--sc-accent)" : "var(--sc-border)",
                background: scope === "products" ? "var(--sc-accent-soft)" : "white",
              }}
            >
              Specific products
            </button>
          </div>

          {scope === "products" && (
            <div className="border border-sc-border rounded-lg max-h-56 overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-xs text-sc-faint p-3">No products yet.</p>
              ) : (
                products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 px-4 py-2.5 text-sm border-b border-sc-border last:border-0">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                    />
                    {p.title}
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit" disabled={submitting}
          className="w-full rounded-lg py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--sc-accent)" }}
        >
          {submitting ? "Creating..." : "Create Voucher"}
        </button>
      </form>
    </div>
  );
}