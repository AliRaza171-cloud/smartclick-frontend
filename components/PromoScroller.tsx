"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ADVANCE_MS = 3500;

interface ActiveVoucher {
  code: string;
  discount_type: string;
  discount_value: string;
  grants_free_shipping: boolean;
}

interface Campaign {
  message: string;
}

function voucherMessage(v: ActiveVoucher): string {
  if (v.grants_free_shipping && parseFloat(v.discount_value) === 0) {
    return `Use ${v.code} for free shipping`;
  }
  const amount =
    v.discount_type === "percent" ? `${parseFloat(v.discount_value)}% off` : `Rs. ${parseFloat(v.discount_value)} off`;
  const suffix = v.grants_free_shipping ? " + free shipping" : "";
  return `Use ${v.code} for ${amount}${suffix}`;
}

export default function PromoScroller() {
  const [messages, setMessages] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/campaigns/active`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API_BASE}/vouchers/active`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([campaigns, vouchers]: [Campaign[], ActiveVoucher[]]) => {
        setMessages([...campaigns.map((c) => c.message), ...vouchers.map(voucherMessage)]);
      })
      .catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    if (!messages || messages.length < 2) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 200);
    }, ADVANCE_MS);
    return () => clearInterval(interval);
  }, [messages]);

  if (!messages || messages.length === 0) return null;

  return (
    <div className="py-2 text-center" style={{ background: "#060A08" }}>
      <span
        className="inline-flex items-center gap-2 text-xs font-medium transition-opacity duration-200"
        style={{ color: "#F3F2EE", opacity: visible ? 1 : 0 }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22C08C" strokeWidth={2}>
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
        {messages[index % messages.length]}
      </span>
    </div>
  );
}