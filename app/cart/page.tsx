"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface VoucherInfo {
  valid: boolean;
  discount_type?: "percent" | "flat";
  discount_value?: number;
  min_order_value?: number;
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [voucherInput, setVoucherInput] = useState("");
  const [voucher, setVoucher] = useState<VoucherInfo | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleApplyVoucher() {
    if (!voucherInput.trim()) return;
    setChecking(true);
    setVoucherError(null);
    const res = await fetch(`${API_BASE}/vouchers/${encodeURIComponent(voucherInput.trim())}/check`);
    const data: VoucherInfo = await res.json();
    setChecking(false);

    if (!data.valid) {
      setVoucher(null);
      setVoucherError("That voucher code isn't valid or has expired.");
      return;
    }
    if (data.min_order_value && subtotal < data.min_order_value) {
      setVoucher(null);
      setVoucherError(`This voucher requires a minimum order of Rs. ${data.min_order_value}.`);
      return;
    }
    setVoucher(data);
  }

  const estimatedDiscount = voucher?.valid
    ? voucher.discount_type === "percent"
      ? Math.round((subtotal * (voucher.discount_value || 0)) / 100)
      : Math.min(voucher.discount_value || 0, subtotal)
    : 0;
  const estimatedTotal = Math.max(subtotal - estimatedDiscount, 0);

  function handleCheckout() {
    if (!user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (voucher?.valid) {
      sessionStorage.setItem("smartclick_voucher", voucherInput.trim().toUpperCase());
    } else {
      sessionStorage.removeItem("smartclick_voucher");
    }
    router.push("/checkout");
  }

  return (
    <main style={{ background: "#F3F2EE", minHeight: "100vh" }}>
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-semibold mb-10">Shopping Cart.</h1>

        {items.length === 0 ? (
          <div className="text-sm text-sc-muted">
            Your cart is empty. <Link href="/categories" className="text-sc-accent">Browse categories →</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 w-full bg-white rounded-2xl border border-sc-border overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-4 text-xs uppercase tracking-wide text-sc-faint border-b border-sc-border">
                <span>Product</span>
                <span>Quantity</span>
                <span className="text-right">Total Price</span>
                <span />
              </div>
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center px-6 py-5 border-b border-sc-border last:border-0"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-lg bg-[#EDEBE4] overflow-hidden flex-shrink-0">
                      {item.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{item.title}</div>
                      <div className="text-xs text-sc-muted mt-0.5">Rs. {item.price.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-sc-border w-fit px-1 py-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-sc-bg"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-sc-bg"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-sm font-semibold text-right">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove"
                    className="text-sc-faint hover:text-red-600 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="px-6 py-5">
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 rounded-full border border-sc-border px-5 py-2.5 text-sm font-semibold hover:bg-sc-bg transition-colors"
                >
                  ‹ Continue Shopping
                </Link>
              </div>
            </div>

            <div
              className="w-full lg:w-[360px] rounded-2xl p-7 flex-shrink-0"
              style={{ background: "linear-gradient(160deg, #0E1712 0%, #060A08 100%)" }}
            >
              <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: "#F3F2EE" }}>
                Order Summary.
              </h2>

              <div className="flex gap-2 mb-5">
                <input
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  placeholder="Voucher code"
                  className="flex-1 rounded-full px-4 py-2.5 text-sm outline-none bg-white/10 text-white placeholder:text-white/40 border border-white/15"
                />
                <button
                  onClick={handleApplyVoucher}
                  disabled={checking}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-50 border border-white/25 text-white hover:bg-white/10 transition-colors"
                >
                  {checking ? "..." : "Apply"}
                </button>
              </div>
              {voucherError && <p className="text-xs mb-4" style={{ color: "#F3A6A6" }}>{voucherError}</p>}
              {voucher?.valid && <p className="text-xs mb-4" style={{ color: "#22C08C" }}>Voucher applied.</p>}

              <div className="space-y-3 text-sm pt-2 border-t border-white/10">
                <div className="flex justify-between pt-4" style={{ color: "#9DB3A6" }}>
                  <span>Subtotal:</span>
                  <span style={{ color: "#F3F2EE" }}>Rs. {subtotal.toLocaleString()}</span>
                </div>
                {estimatedDiscount > 0 && (
                  <div className="flex justify-between" style={{ color: "#22C08C" }}>
                    <span>Discount:</span>
                    <span>− Rs. {estimatedDiscount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline pt-5 mt-5 border-t border-white/10">
                <span className="text-sm font-semibold" style={{ color: "#F3F2EE" }}>Total:</span>
                <span className="text-2xl font-display font-semibold" style={{ color: "#F3F2EE" }}>
                  Rs. {estimatedTotal.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-7 rounded-full py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                style={{ background: "#22C08C", color: "#0E1712" }}
              >
                Check Out.
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}