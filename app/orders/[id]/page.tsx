"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import OrderStatusTracker from "@/components/OrderStatusTracker";
import { apiFetch, extractErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface OrderItem {
  product_id: string;
  title: string;
  unit_price: string;
  quantity: number;
  image_url: string | null;
}

interface Order {
  id: string;
  user_id?: string;
  items: OrderItem[];
  subtotal: string;
  voucher_code: string | null;
  discount_amount: string;
  free_shipping: boolean;
  total: string;
  payment_method: string;
  cod_fee: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  status: string;
  fulfillment_status: string;
  cancellation_requested: boolean;
  created_at: string;
}

interface OrderMessage {
  id: string;
  sender_role: "buyer" | "admin" | "system";
  sender_name: string;
  message: string;
  created_at: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  safepay: "JazzCash / EasyPaisa / Bank Card",
  card: "International Card (Stripe)",
  easypaisa: "EasyPaisa",
  jazzcash: "JazzCash",
};

const NEXT_STATUS: Record<string, { key: string; label: string } | null> = {
  pending: { key: "ready_to_ship", label: "Mark as Ready to Ship" },
  ready_to_ship: { key: "shipped", label: "Mark as Shipped" },
  shipped: { key: "delivered", label: "Mark as Delivered" },
  delivered: null,
};

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const paymentRedirect = searchParams.get("payment");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [payingNow, setPayingNow] = useState(false);

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function loadOrder() {
    const res = await apiFetch(`/orders/${params.id}`);
    if (res.ok) setOrder(await res.json());
    setLoading(false);
  }

  async function loadMessages() {
    const res = await apiFetch(`/orders/${params.id}/messages`);
    if (res.ok) setMessages(await res.json());
  }

  useEffect(() => {
    loadOrder();
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (paymentRedirect === "success") {
      const t = setTimeout(loadOrder, 2000);
      return () => clearTimeout(t);
    }
  }, [paymentRedirect]);

  async function handleAdvanceStatus() {
    if (!order) return;
    const next = NEXT_STATUS[order.fulfillment_status];
    if (!next) return;

    setUpdating(true);
    const res = await apiFetch(`/orders/${order.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ fulfillment_status: next.key }),
    });
    setUpdating(false);
    if (res.ok) setOrder(await res.json());
  }

  async function handlePayNow() {
    if (!order) return;
    setPayError(null);
    setPayingNow(true);

    const endpoint =
      order.payment_method === "safepay"
        ? `/orders/${order.id}/safepay-checkout-session`
        : `/orders/${order.id}/checkout-session`;

    const res = await apiFetch(endpoint, { method: "POST" });
    setPayingNow(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setPayError(extractErrorMessage(body, "Couldn't start payment."));
      return;
    }
    const { checkout_url } = await res.json();
    window.location.href = checkout_url;
  }

  async function handleCancel() {
    if (!order) return;
    if (!confirm("Cancel this order? This can't be undone.")) return;
    setCancelling(true);
    setCancelError(null);
    const res = await apiFetch(`/orders/${order.id}/cancel`, { method: "POST" });
    setCancelling(false);
    if (res.ok) setOrder(await res.json());
    else {
      const body = await res.json().catch(() => ({}));
      setCancelError(extractErrorMessage(body, "Couldn't cancel this order."));
    }
  }

  async function handleRequestCancellation() {
    if (!order) return;
    if (!confirm("Request cancellation? Your order is already being prepared — support will review your request.")) return;
    setCancelling(true);
    setCancelError(null);
    const res = await apiFetch(`/orders/${order.id}/request-cancellation`, { method: "POST" });
    setCancelling(false);
    if (res.ok) setOrder(await res.json());
    else {
      const body = await res.json().catch(() => ({}));
      setCancelError(extractErrorMessage(body, "Couldn't request cancellation."));
    }
  }

  async function handleCancellationDecision(approve: boolean) {
    if (!order) return;
    setCancelling(true);
    setCancelError(null);
    const res = await apiFetch(`/orders/${order.id}/cancellation-decision`, {
      method: "PATCH",
      body: JSON.stringify({ approve }),
    });
    setCancelling(false);
    if (res.ok) {
      setOrder(await res.json());
      loadMessages();
    } else {
      const body = await res.json().catch(() => ({}));
      setCancelError(extractErrorMessage(body, "Couldn't record that decision."));
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = messageText.trim();
    if (!trimmed || !order) return;
    setSendingMessage(true);
    setMessageText("");
    const res = await apiFetch(`/orders/${order.id}/messages`, {
      method: "POST",
      body: JSON.stringify({ message: trimmed }),
    });
    setSendingMessage(false);
    if (res.ok) loadMessages();
  }

  if (loading) return null;

  if (!order) {
    return (
      <main>
        <Nav />
        <div className="max-w-xl mx-auto px-6 py-16 text-sm text-sc-muted">
          Order not found, or you don't have access to it.
        </div>
        <Footer />
      </main>
    );
  }

  const isAdmin = user?.role === "admin";
  const nextStatus = NEXT_STATUS[order.fulfillment_status];
  const isCancelled = order.status === "cancelled";
  const canCancelDirectly = !isAdmin && !isCancelled && order.fulfillment_status === "pending";
  const canRequestCancellation =
    !isAdmin &&
    !isCancelled &&
    !order.cancellation_requested &&
    order.fulfillment_status !== "pending" &&
    order.fulfillment_status !== "delivered";
  const canPayNow =
    (order.payment_method === "card" || order.payment_method === "safepay") &&
    order.status === "pending_payment";
  const payButtonLabel = order.payment_method === "safepay" ? "Pay with JazzCash / EasyPaisa / Card" : "Pay with Card";
  const payingLabel = order.payment_method === "safepay" ? "Redirecting to Safepay..." : "Redirecting to Stripe...";

  return (
    <main>
      <Nav />
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="w-14 h-14 rounded-full bg-sc-accent-soft flex items-center justify-center mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sc-accent)" strokeWidth={2}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-semibold mb-2">Order placed</h1>
        <p className="text-sm text-sc-muted mb-8">
          Order #{order.id.slice(0, 8)} — payment status <strong>{order.status.replace("_", " ")}</strong>.
        </p>

        {paymentRedirect === "cancelled" && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-4 mb-6">
            Payment was cancelled. You can try again below.
          </div>
        )}
        {paymentRedirect === "success" && order.status === "pending_payment" && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-4 mb-6">
            Confirming your payment — this updates automatically in a moment.
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mb-6">
            This order was cancelled.
          </div>
        )}

        {order.cancellation_requested && !isCancelled && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg p-4 mb-6 flex items-center justify-between gap-4">
            <span>
              {isAdmin ? "The buyer has requested cancellation." : "Cancellation requested — awaiting a decision from support."}
            </span>
            {isAdmin && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleCancellationDecision(true)}
                  disabled={cancelling}
                  className="text-xs font-semibold px-3 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleCancellationDecision(false)}
                  disabled={cancelling}
                  className="text-xs font-semibold px-3 py-2 rounded-lg border border-sc-border disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        )}

        {canPayNow && (
          <div className="bg-white border border-sc-border rounded-xl p-5 mb-6">
            <p className="text-sm text-sc-muted mb-3">
              This order is set to pay by {PAYMENT_LABELS[order.payment_method]}. Click below to complete payment securely.
            </p>
            {payError && <p className="text-sm text-red-600 mb-3">{payError}</p>}
            <button
              onClick={handlePayNow}
              disabled={payingNow}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--sc-accent)" }}
            >
              {payingNow ? payingLabel : payButtonLabel}
            </button>
          </div>
        )}

        <div className="bg-white border border-sc-border rounded-xl p-5 mb-6">
          <div className="text-xs text-sc-faint mb-3">Shipping status</div>
          <OrderStatusTracker status={order.fulfillment_status} />
          {isAdmin && nextStatus && (
            <button
              onClick={handleAdvanceStatus}
              disabled={updating}
              className="w-full rounded-lg border border-sc-border py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {updating ? "Updating..." : nextStatus.label}
            </button>
          )}
        </div>

        <div className="bg-white border border-sc-border rounded-xl p-5 mb-6 text-sm">
          {order.items.map((item) => (
            <div key={item.product_id} className="flex justify-between py-1.5">
              <span>{item.title} × {item.quantity}</span>
              <span>Rs. {(parseFloat(item.unit_price) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t border-sc-border mt-2 pt-2 space-y-1">
            <div className="flex justify-between text-sc-muted">
              <span>Subtotal</span>
              <span>Rs. {parseFloat(order.subtotal).toLocaleString()}</span>
            </div>
            {parseFloat(order.discount_amount) > 0 && (
              <div className="flex justify-between text-sc-accent">
                <span>Discount {order.voucher_code && `(${order.voucher_code})`}</span>
                <span>− Rs. {parseFloat(order.discount_amount).toLocaleString()}</span>
              </div>
            )}
            {parseFloat(order.cod_fee) > 0 && (
              <div className="flex justify-between text-sc-muted">
                <span>COD handling fee</span>
                <span>+ Rs. {parseFloat(order.cod_fee).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-1">
              <span>Total</span>
              <span>Rs. {parseFloat(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-sc-muted mb-2">
          <div className="text-sc-faint text-xs mb-1">Payment method</div>
          {PAYMENT_LABELS[order.payment_method] || order.payment_method}
        </div>

        <div className="text-sm text-sc-muted mb-6">
          <div className="text-sc-faint text-xs mb-1">Shipping to</div>
          {order.shipping_name}, {order.shipping_address}, {order.shipping_city}
        </div>

        {(canCancelDirectly || canRequestCancellation) && (
          <div className="mb-8">
            {cancelError && <p className="text-sm text-red-600 mb-2">{cancelError}</p>}
            <button
              onClick={canCancelDirectly ? handleCancel : handleRequestCancellation}
              disabled={cancelling}
              className="w-full rounded-lg border border-red-600 text-red-600 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {cancelling ? "Please wait..." : canCancelDirectly ? "Cancel Order" : "Request Cancellation"}
            </button>
          </div>
        )}

        <div className="bg-white border border-sc-border rounded-xl overflow-hidden mb-8">
          <div className="px-5 py-3 border-b border-sc-border text-sm font-semibold">Order Support</div>
          <div className="max-h-80 overflow-y-auto px-5 py-4 space-y-3">
            {messages.length === 0 ? (
              <p className="text-xs text-sc-muted">
                No messages yet — ask a question about this order and support will reply here.
              </p>
            ) : (
              messages.map((m) =>
                m.sender_role === "system" ? (
                  <p key={m.id} className="text-xs text-sc-faint italic text-center">{m.message}</p>
                ) : (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_role === (isAdmin ? "admin" : "buyer") ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                        m.sender_role === (isAdmin ? "admin" : "buyer")
                          ? "text-white"
                          : "bg-sc-bg border border-sc-border"
                      }`}
                      style={m.sender_role === (isAdmin ? "admin" : "buyer") ? { background: "var(--sc-accent)" } : {}}
                    >
                      {m.message}
                    </div>
                  </div>
                )
              )
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-sc-border p-3">
            <input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-sc-border px-4 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={sendingMessage || !messageText.trim()}
              className="rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--sc-accent)" }}
            >
              Send
            </button>
          </form>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/" className="text-sm text-sc-accent">← Back to shopping</Link>
          {isAdmin && (
            <Link href={`/admin/orders/${order.id}/label`} className="text-sm text-sc-muted">
              Print shipping label →
            </Link>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}