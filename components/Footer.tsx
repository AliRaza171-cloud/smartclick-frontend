"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface StoreInfo {
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
}

const FOOTER_BG = "#0E1712";
const FOOTER_MUTED = "#9DB3A6";
const FOOTER_TEXT = "#F3F2EE";
const FOOTER_ACCENT = "#22C08C";

const SOCIALS = [
  { label: "Facebook", href: "#", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
  { label: "Twitter", href: "#", path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
  { label: "Instagram", href: "#", path: "M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM17.5 6.5h.01" },
  { label: "YouTube", href: "#", path: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27z" },
];

const SHOP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/cart", label: "Cart" },
];

const SUPPORT_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/return-refund-policy", label: "Return & Refund Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" },
];

function PaymentBadge({ type }: { type: string }) {
  const common = "h-7 px-3 rounded flex items-center justify-center text-[10px] font-bold tracking-wide";

  switch (type) {
    case "Visa":
      return (
        <div className={common} style={{ background: "#1A1F71", color: "#FFFFFF" }}>
          VISA
        </div>
      );
    case "Mastercard":
      return (
        <div className={`${common} gap-1`} style={{ background: "#111111" }}>
          <span className="w-3.5 h-3.5 rounded-full" style={{ background: "#EB001B" }} />
          <span className="w-3.5 h-3.5 rounded-full -ml-2" style={{ background: "#F79E1B", opacity: 0.9 }} />
        </div>
      );
    case "JazzCash":
      return (
        <div className={common} style={{ background: "#E4032D", color: "#FFFFFF" }}>
          JazzCash
        </div>
      );
    case "EasyPaisa":
      return (
        <div className={common} style={{ background: "#00A651", color: "#FFFFFF" }}>
          easypaisa
        </div>
      );
    case "COD":
      return (
        <div className={`${common} gap-1.5`} style={{ background: "#2A2A2A", color: FOOTER_TEXT }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={FOOTER_TEXT} strokeWidth={2}>
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          COD
        </div>
      );
    default:
      return null;
  }
}

const PAYMENT_BADGES = ["Visa", "Mastercard", "JazzCash", "EasyPaisa", "COD"];

export default function Footer() {
  const [store, setStore] = useState<StoreInfo | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/store-info`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setStore)
      .catch(() => setStore(null));
  }, []);

  return (
    <div style={{ background: FOOTER_BG, color: FOOTER_MUTED }}>
      <div className="px-8 md:px-18 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.2fr] gap-12 mb-12">
          <div>
            <div className="text-xs font-semibold tracking-wide uppercase mb-4" style={{ color: FOOTER_TEXT }}>
              Follow
            </div>
            <div className="flex gap-3 mb-8">
              {SOCIALS.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ background: FOOTER_ACCENT }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0E1712" strokeWidth={2}>
                    <path d={s.path} />
                  </svg>
                </Link>
              ))}
            </div>

            <div className="font-display font-bold mb-2" style={{ color: FOOTER_TEXT }}>
              Smart<span style={{ color: FOOTER_ACCENT }}>Click</span>
            </div>
            {store && (
              <div className="text-xs leading-relaxed">
                {store.address}, {store.city}<br />
                {store.phone}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold tracking-wide uppercase mb-1" style={{ color: FOOTER_TEXT }}>
                Shop
              </span>
              {SHOP_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="hover:!text-[#22C08C] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold tracking-wide uppercase mb-1" style={{ color: FOOTER_TEXT }}>
                Support
              </span>
              {SUPPORT_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="hover:!text-[#22C08C] transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm mb-4" style={{ color: FOOTER_TEXT }}>
              Subscribe to get the latest on sales, new arrivals and more.
            </p>
            <NewsletterForm />

            <div className="mt-8">
              <div className="text-xs font-semibold tracking-wide uppercase mb-3" style={{ color: FOOTER_TEXT }}>
                Supported payment methods
              </div>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_BADGES.map((label) => (
                  <PaymentBadge key={label} type={label} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row justify-between gap-3 text-xs pt-6"
          style={{ borderTop: `1px solid ${FOOTER_MUTED}22` }}
        >
          <span>© 2026 Smart Click. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}