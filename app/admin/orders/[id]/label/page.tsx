"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Order {
  id: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  total: string;
  created_at: string;
}

interface StoreInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
}

export default function ShippingLabelPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    (async () => {
      const [orderRes, storeRes] = await Promise.all([
        apiFetch(`/orders/${params.id}`),
        fetch(`${API_BASE}/store-info`),
      ]);
      if (orderRes.ok) setOrder(await orderRes.json());
      if (storeRes.ok) setStore(await storeRes.json());
    })();
  }, [params.id]);

  useEffect(() => {
    if (order && barcodeRef.current) {
      // The order's own id is what's encoded — scanning it at any fulfillment
      // step (packing, dispatch, delivery) resolves straight back to this
      // exact order, the same way a real courier's own barcode would.
      JsBarcode(barcodeRef.current, order.id.slice(0, 8).toUpperCase(), {
        format: "CODE128",
        width: 1.5,
        height: 50,
        displayValue: true,
        fontSize: 12,
        margin: 0,
      });
    }
  }, [order]);

  if (authLoading) return null;
  if (!user || user.role !== "admin") {
    return <div className="p-10 text-sm text-sc-muted">Admin access required.</div>;
  }
  if (!order || !store) return <div className="p-10 text-sm text-sc-muted">Loading label…</div>;

  return (
    <div className="min-h-screen bg-sc-bg">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      <div className="no-print px-6 py-4 flex justify-between items-center border-b border-sc-border">
        <span className="font-display font-bold text-lg">Shipping Label</span>
        <button
          onClick={() => window.print()}
          className="rounded-lg text-white text-sm font-semibold px-5 py-2.5"
          style={{ background: "var(--sc-accent)" }}
        >
          Print
        </button>
      </div>

      <div className="max-w-md mx-auto my-10 bg-white border-2 border-black p-6" style={{ fontFamily: "monospace" }}>
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
          <div className="font-bold text-lg">SMART CLICK</div>
          <div className="text-xs">Order #{order.id.slice(0, 8).toUpperCase()}</div>
        </div>

        <div className="mb-4">
          <div className="text-[10px] tracking-wider text-gray-500 mb-1">FROM</div>
          <div className="text-sm font-bold">{store.name}</div>
          <div className="text-sm">{store.address}</div>
          <div className="text-sm">{store.city}</div>
          <div className="text-sm">Tel: {store.phone}</div>
        </div>

        <div className="border-t-2 border-b-2 border-black py-4 mb-4">
          <div className="text-[10px] tracking-wider text-gray-500 mb-1">TO</div>
          <div className="text-base font-bold">{order.shipping_name}</div>
          <div className="text-base">{order.shipping_address}</div>
          <div className="text-base">{order.shipping_city}</div>
          <div className="text-base font-bold">Tel: {order.shipping_phone}</div>
        </div>

        <div className="flex flex-col items-center py-2">
          <svg ref={barcodeRef} />
        </div>

        <div className="flex justify-between text-xs mt-4 pt-3 border-t border-gray-300">
          <span>Placed: {new Date(order.created_at).toLocaleDateString()}</span>
          <span>Total: Rs. {parseFloat(order.total).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}