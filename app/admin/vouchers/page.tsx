"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

interface Voucher {
  code: string;
  discount_type: string;
  discount_value: string;
  min_order_value: string | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  applicable_product_ids: string[] | null;
  grants_free_shipping: boolean;
}

export default function AdminVouchersPage() {
  const { user, loading: authLoading } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await apiFetch("/vouchers");
    if (res.ok) setVouchers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    if (authLoading || user?.role !== "admin") return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  async function handleDeactivate(code: string) {
    await apiFetch(`/vouchers/${code}/deactivate`, { method: "PATCH" });
    load();
  }

  if (authLoading) return null;
  if (!user || user.role !== "admin") {
    return <div className="p-10 text-sm text-sc-muted">Admin access required.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">Vouchers</h1>
        <Link
          href="/admin/vouchers/new"
          className="rounded-lg text-white text-sm font-semibold px-5 py-2.5"
          style={{ background: "var(--sc-accent)" }}
        >
          + New voucher
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-sc-muted">Loading…</p>
      ) : vouchers.length === 0 ? (
        <p className="text-sm text-sc-muted">No vouchers yet.</p>
      ) : (
        <div className="space-y-3">
          {vouchers.map((v) => (
            <div key={v.code} className="bg-white border border-sc-border rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm mb-1">
                  {v.code}{" "}
                  {!v.is_active && <span className="text-xs text-sc-faint">(deactivated)</span>}
                </div>
                <div className="text-xs text-sc-muted">
                  {v.discount_type === "percent" ? `${v.discount_value}% off` : `Rs. ${v.discount_value} off`}
                  {v.grants_free_shipping && " · Free shipping"}
                  {v.applicable_product_ids && v.applicable_product_ids.length > 0
                    ? ` · ${v.applicable_product_ids.length} product(s) only`
                    : " · Entire store"}
                  {" · Used "}{v.used_count}{v.usage_limit ? `/${v.usage_limit}` : ""}
                </div>
              </div>
              {v.is_active && (
                <button
                  onClick={() => handleDeactivate(v.code)}
                  className="text-xs text-red-600 border border-red-200 rounded-lg px-3 py-1.5"
                >
                  Deactivate
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}