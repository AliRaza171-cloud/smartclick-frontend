"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

interface OrderItem {
  product_id: string;
  title: string;
  unit_price: string;
  quantity: number;
  image_url: string | null;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: string;
  status: string;
  fulfillment_status: string;
  cancellation_requested: boolean;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Processing",
  ready_to_ship: "Ready to ship",
  shipped: "Shipped",
  delivered: "Delivered",
};

export default function OrdersListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    apiFetch("/orders")
      .then((res) => (res.ok ? res.json() : []))
      .then(setOrders);
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <main style={{ background: "#F3F2EE", minHeight: "100vh" }}>
      <Nav />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl font-semibold mb-8">My Orders</h1>

        {orders === null ? (
          <p className="text-sm text-sc-muted">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="text-sm text-sc-muted">
            No orders yet.{" "}
            <Link href="/categories" className="text-sc-accent">Start shopping →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white border border-sc-border rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                  <div className="flex items-center gap-2">
                    {order.status === "cancelled" ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                        Cancelled
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sc-accent-soft text-sc-accent">
                        {STATUS_LABELS[order.fulfillment_status] || order.fulfillment_status}
                      </span>
                    )}
                    {order.cancellation_requested && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700">
                        Cancellation requested
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-sc-muted truncate mb-2">
                  {order.items.map((i) => i.title).join(", ")}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-sc-faint text-xs">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                  <span className="font-semibold">Rs. {parseFloat(order.total).toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}