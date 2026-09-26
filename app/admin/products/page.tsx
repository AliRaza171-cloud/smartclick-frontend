// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useAuth } from "@/lib/auth-context";
// import { apiFetch, resolveImageUrl } from "@/lib/api";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// interface Product {
//   id: string;
//   title: string;
//   price: string;
//   category: string;
//   is_active: boolean;
//   image_urls: string[];
// }

// export default function AdminProductsPage() {
//   const { user, loading: authLoading } = useAuth();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [togglingId, setTogglingId] = useState<string | null>(null);

//   async function load() {
//     const res = await apiFetch("/products/admin/all");
//     if (res.ok) setProducts(await res.json());
//     setLoading(false);
//   }

//   useEffect(() => {
//     if (authLoading || user?.role !== "admin") return;
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [authLoading, user]);

//   async function handleToggleActive(product: Product) {
//     setTogglingId(product.id);
//     await apiFetch(`/products/${product.id}`, {
//       method: "PATCH",
//       body: JSON.stringify({ is_active: !product.is_active }),
//     });
//     setTogglingId(null);
//     load();
//   }

//   if (authLoading) return null;
//   if (!user || user.role !== "admin") {
//     return <div className="p-10 text-sm text-sc-muted">Admin access required.</div>;
//   }

//   return (
//     <div className="max-w-4xl mx-auto px-6 py-12">
//       <div className="flex items-center justify-between mb-8">
//         <h1 className="font-display text-3xl font-semibold">Products</h1>
//         <Link
//           href="/admin/products/new"
//           className="rounded-lg text-white text-sm font-semibold px-5 py-2.5"
//           style={{ background: "var(--sc-accent)" }}
//         >
//           + Add product
//         </Link>
//       </div>

//       {loading ? (
//         <p className="text-sm text-sc-muted">Loading…</p>
//       ) : products.length === 0 ? (
//         <p className="text-sm text-sc-muted">No products yet.</p>
//       ) : (
//         <div className="space-y-3">
//           {products.map((p) => (
//             <div
//               key={p.id}
//               className="bg-white border border-sc-border rounded-xl p-4 flex items-center gap-4"
//               style={{ opacity: p.is_active ? 1 : 0.55 }}
//             >
//               <div
//                 className="w-16 h-16 rounded-lg bg-[#F3F2EE] bg-cover bg-center flex-shrink-0"
//                 style={p.image_urls[0] ? { backgroundImage: `url(${resolveImageUrl(p.image_urls[0])})` } : undefined}
//               />
//               <div className="flex-1">
//                 <div className="text-sm font-semibold flex items-center gap-2">
//                   {p.title}
//                   {!p.is_active && (
//                     <span className="text-xs font-normal text-sc-faint border border-sc-border rounded-full px-2 py-0.5">
//                       Deactivated
//                     </span>
//                   )}
//                 </div>
//                 <div className="text-xs text-sc-muted">{p.category} · Rs. {parseFloat(p.price).toLocaleString()}</div>
//               </div>
//               <button
//                 onClick={() => handleToggleActive(p)}
//                 disabled={togglingId === p.id}
//                 className="text-xs font-semibold border rounded-lg px-4 py-2 disabled:opacity-50"
//                 style={
//                   p.is_active
//                     ? { borderColor: "#DC2626", color: "#DC2626" }
//                     : { borderColor: "var(--sc-accent)", color: "var(--sc-accent)" }
//                 }
//               >
//                 {togglingId === p.id ? "..." : p.is_active ? "Deactivate" : "Reactivate"}
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, extractErrorMessage, resolveImageUrl } from "@/lib/api";

interface Product {
  id: string;
  title: string;
  price: string;
  category: string;
  is_active: boolean;
  image_urls: string[];
  discount_pct: number | null;
  free_shipping: boolean;
  is_flash_deal?: boolean;
}

type View = "all" | "deals" | "flash";

const salePrice = (p: Pick<Product, "price" | "discount_pct">) => {
  const original = parseFloat(p.price);
  return p.discount_pct ? Math.round(original * (1 - p.discount_pct / 100)) : original;
};

function Pill({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: bg, color }}>
      {children}
    </span>
  );
}

function EditProductDialog({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(String(parseFloat(product.price)));
  const [discount, setDiscount] = useState(product.discount_pct ? String(product.discount_pct) : "");
  const [freeShipping, setFreeShipping] = useState(product.free_shipping);
  const [flash, setFlash] = useState(!!product.is_flash_deal);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceNum = parseFloat(price);
  const discountNum = discount.trim() === "" ? null : parseInt(discount, 10);
  const hasDiscount = discountNum !== null && discountNum > 0;
  const priceValid = Number.isFinite(priceNum) && priceNum > 0;
  const discountValid = discountNum === null || (Number.isInteger(discountNum) && discountNum >= 1 && discountNum <= 95);
  const preview = priceValid ? Math.round(priceNum * (1 - (hasDiscount ? discountNum! : 0) / 100)) : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Title can't be empty.");
    if (!priceValid) return setError("Enter a price greater than 0.");
    if (!discountValid) return setError("Discount must be a whole number from 1 to 95, or empty for none.");

    setSaving(true);
    setError(null);
    const res = await apiFetch(`/products/${product.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: title.trim(),
        price: priceNum,
        discount_pct: hasDiscount ? discountNum : null,
        free_shipping: freeShipping,
        // A flash pick only makes sense with a discount.
        is_flash_deal: hasDiscount ? flash : false,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(extractErrorMessage(body, "Couldn't save changes."));
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Edit ${product.title}`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={save} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <div
            className="h-12 w-12 flex-shrink-0 rounded-lg bg-[#F3F2EE] bg-cover bg-center"
            style={product.image_urls[0] ? { backgroundImage: `url(${resolveImageUrl(product.image_urls[0])})` } : undefined}
          />
          <div>
            <h2 className="font-display text-lg font-semibold">Edit product</h2>
            <p className="text-xs text-sc-muted">{product.category}</p>
          </div>
        </div>

        <label className="block text-xs font-semibold text-sc-muted">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-lg border border-sc-border px-3 py-2 text-sm outline-none focus:border-sc-accent"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-sc-muted">Price (Rs.)</label>
            <input
              type="number" min="1" step="1" inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sc-border px-3 py-2 text-sm outline-none focus:border-sc-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-sc-muted">Discount %</label>
            <input
              type="number" min="1" max="95" step="1" inputMode="numeric" placeholder="None"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sc-border px-3 py-2 text-sm outline-none focus:border-sc-accent"
            />
          </div>
        </div>

        {preview !== null && (
          <p className="mt-2 text-xs text-sc-muted">
            Customers pay{" "}
            <span className="font-semibold text-sc-ink">Rs. {preview.toLocaleString()}</span>
            {hasDiscount && (
              <>
                {" "}instead of <span className="line-through">Rs. {Math.round(priceNum).toLocaleString()}</span> — shows on the Deals page
              </>
            )}
            {!hasDiscount && " — no discount, so it won't appear on the Deals page"}
          </p>
        )}

        <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={freeShipping} onChange={(e) => setFreeShipping(e.target.checked)} style={{ accentColor: "var(--sc-accent)" }} className="h-4 w-4" />
          Free shipping
        </label>

        <label className={`mt-3 flex items-start gap-2.5 text-sm ${hasDiscount ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
          <input
            type="checkbox"
            disabled={!hasDiscount}
            checked={hasDiscount && flash}
            onChange={(e) => setFlash(e.target.checked)}
            style={{ accentColor: "var(--sc-accent)" }}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            Pin to Flash Deals
            <span className="block text-xs text-sc-muted">
              {hasDiscount ? "Shown first in the Deals page's Flash Deals section." : "Add a discount to pin this product."}
            </span>
          </span>
        </label>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-[#DC2626]">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-sc-border px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--sc-accent)" }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [view, setView] = useState<View>("all");

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

  const counts = useMemo(
    () => ({
      all: products.length,
      deals: products.filter((p) => p.discount_pct).length,
      flash: products.filter((p) => p.discount_pct && p.is_flash_deal).length,
    }),
    [products]
  );

  const shown = useMemo(
    () =>
      view === "deals"
        ? products.filter((p) => p.discount_pct)
        : view === "flash"
          ? products.filter((p) => p.discount_pct && p.is_flash_deal)
          : products,
    [products, view]
  );

  if (authLoading) return null;
  if (!user || user.role !== "admin") {
    return <div className="p-10 text-sm text-sc-muted">Admin access required.</div>;
  }

  const tabs: { id: View; label: string }[] = [
    { id: "all", label: "All" },
    { id: "deals", label: "On deal" },
    { id: "flash", label: "Flash picks" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg text-white text-sm font-semibold px-5 py-2.5"
          style={{ background: "var(--sc-accent)" }}
        >
          + Add product
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className="rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors"
            style={
              view === t.id
                ? { background: "var(--sc-accent)", borderColor: "var(--sc-accent)", color: "#fff" }
                : { borderColor: "var(--sc-border)", color: "var(--sc-muted)", background: "#fff" }
            }
          >
            {t.label} ({counts[t.id]})
          </button>
        ))}
        <span className="text-xs text-sc-faint">
          Products with a discount appear on the Deals page. Pin up to a handful as Flash picks.
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-sc-muted">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-sc-muted">
          {products.length === 0 ? "No products yet." : "Nothing here yet — use Edit on a product to add a discount or pin it."}
        </p>
      ) : (
        <div className="space-y-3">
          {shown.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-sc-border rounded-xl p-4 flex flex-wrap items-center gap-4"
              style={{ opacity: p.is_active ? 1 : 0.55 }}
            >
              <div
                className="w-16 h-16 rounded-lg bg-[#F3F2EE] bg-cover bg-center flex-shrink-0"
                style={p.image_urls[0] ? { backgroundImage: `url(${resolveImageUrl(p.image_urls[0])})` } : undefined}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold flex flex-wrap items-center gap-2">
                  {p.title}
                  {!p.is_active && (
                    <span className="text-xs font-normal text-sc-faint border border-sc-border rounded-full px-2 py-0.5">
                      Deactivated
                    </span>
                  )}
                </div>
                <div className="text-xs text-sc-muted">
                  {p.category} ·{" "}
                  {p.discount_pct ? (
                    <>
                      <span className="font-semibold text-sc-ink">Rs. {salePrice(p).toLocaleString()}</span>{" "}
                      <span className="line-through">Rs. {parseFloat(p.price).toLocaleString()}</span>
                    </>
                  ) : (
                    <>Rs. {parseFloat(p.price).toLocaleString()}</>
                  )}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.discount_pct ? <Pill bg="#FDECEC" color="#DC2626">-{p.discount_pct}%</Pill> : null}
                  {p.discount_pct && p.is_flash_deal ? <Pill bg="#FEF3C7" color="#B45309">⚡ Flash pick</Pill> : null}
                  {p.free_shipping && <Pill bg="var(--sc-accent-soft)" color="var(--sc-accent)">Free shipping</Pill>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(p)}
                  className="text-xs font-semibold border border-sc-border rounded-lg px-4 py-2 hover:bg-[#F3F2EE]"
                >
                  Edit
                </button>
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
            </div>
          ))}
        </div>
      )}

      {editing && (
        <EditProductDialog
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
