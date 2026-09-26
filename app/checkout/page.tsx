"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, extractErrorMessage } from "@/lib/api";

const COD_FEE = 30;

const PAYMENT_METHODS = [
  { key: "cod", label: "Cash on Delivery", note: `+Rs. ${COD_FEE} handling fee` },
  { key: "safepay", label: "JazzCash / EasyPaisa", note: null },
  { key: "card", label: "Card (Stripe)", note: null },
];

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.full_name) setName(user.full_name);
  }, [user]);

  if (authLoading || !user) return null;

  if (items.length === 0) {
    return (
      <main>
        <Nav />
        <div className="max-w-xl mx-auto px-6 py-16 text-sm text-sc-muted">Your cart is empty.</div>
        <Footer />
      </main>
    );
  }

  const codFee = paymentMethod === "cod" ? COD_FEE : 0;
  const estimatedTotal = subtotal + codFee;

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPlacing(true);

    const voucherCode = sessionStorage.getItem("smartclick_voucher") || undefined;

    const res = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        voucher_code: voucherCode,
        shipping_name: name,
        shipping_phone: phone,
        shipping_address: address,
        shipping_city: city,
        payment_method: paymentMethod,
      }),
    });

    setPlacing(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(extractErrorMessage(body, "Something went wrong placing your order."));
      return;
    }

    const order = await res.json();
    sessionStorage.removeItem("smartclick_voucher");
    clear();
    router.push(`/orders/${order.id}`);
  }

  return (
    <main style={{ background: "#F3F2EE", minHeight: "100vh" }}>
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-semibold mb-10">Checkout.</h1>

        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full min-w-0 space-y-6">
            <div className="bg-white rounded-2xl border border-sc-border p-6">
              <h2 className="text-sm font-semibold mb-4 text-sc-faint uppercase tracking-wide">Your order</h2>
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between py-2 text-sm">
                  <span>{item.title} × {item.quantity}</span>
                  <span className="font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-sc-border p-6 space-y-4">
              <h2 className="text-sm font-semibold mb-1 text-sc-faint uppercase tracking-wide">Shipping details</h2>
              <div>
                <label className="block text-sm mb-1">Full name</label>
                <input
                  required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-full border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <input
                  required value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-full border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Address</label>
                <input
                  required value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-full border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">City</label>
                <input
                  required value={city} onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-full border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
                />
              </div>
            </div>
          </div>

          <div
            className="w-full lg:w-[380px] rounded-2xl p-7 flex-shrink-0"
            style={{ background: "linear-gradient(160deg, #0E1712 0%, #060A08 100%)" }}
          >
            <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: "#F3F2EE" }}>
              Payment Info.
            </h2>

            <p className="text-xs mb-3" style={{ color: "#9DB3A6" }}>Payment Method:</p>
            <div className="flex flex-col gap-2 mb-6">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.key}
                  className="flex items-center justify-between rounded-full px-5 py-3 text-sm cursor-pointer border transition-colors"
                  style={{
                    borderColor: paymentMethod === m.key ? "#22C08C" : "rgba(255,255,255,0.15)",
                    background: paymentMethod === m.key ? "rgba(34,192,140,0.12)" : "transparent",
                    color: paymentMethod === m.key ? "#22C08C" : "#F3F2EE",
                  }}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value={m.key}
                      checked={paymentMethod === m.key}
                      onChange={() => setPaymentMethod(m.key)}
                      className="accent-[#22C08C]"
                    />
                    {m.label}
                  </span>
                  {m.note && <span className="text-xs opacity-70">{m.note}</span>}
                </label>
              ))}
            </div>

            {(paymentMethod === "card" || paymentMethod === "safepay") && (
              <p className="text-xs mb-6" style={{ color: "#9DB3A6" }}>
                You'll complete payment securely on the next screen before this order is marked paid.
              </p>
            )}

            <div className="space-y-2 text-sm pt-4 border-t border-white/10">
              <div className="flex justify-between" style={{ color: "#9DB3A6" }}>
                <span>Subtotal:</span>
                <span style={{ color: "#F3F2EE" }}>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {codFee > 0 && (
                <div className="flex justify-between" style={{ color: "#9DB3A6" }}>
                  <span>COD fee:</span>
                  <span style={{ color: "#F3F2EE" }}>+ Rs. {codFee.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-baseline pt-5 mt-5 border-t border-white/10">
              <span className="text-sm font-semibold" style={{ color: "#F3F2EE" }}>Total:</span>
              <span className="text-2xl font-display font-semibold" style={{ color: "#F3F2EE" }}>
                Rs. {estimatedTotal.toLocaleString()}
              </span>
            </div>

            {error && <p className="text-xs mt-4" style={{ color: "#F3A6A6" }}>{error}</p>}

            <button
              type="submit" disabled={placing}
              className="w-full mt-7 rounded-full py-3.5 text-sm font-semibold disabled:opacity-60 transition-transform hover:-translate-y-0.5"
              style={{ background: "#22C08C", color: "#0E1712" }}
            >
              {placing ? "Placing order..." : "Check Out."}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  );
}