"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { fetchCategories, CategoryMeta } from "@/lib/categories";
import NotificationBell from "./NotificationBell";
import PromoScroller from "./PromoScroller";
import SearchBar from "./SearchBar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PreviewProduct {
  id: string;
  title: string;
  price: string;
  discount_pct: number | null;
  image_urls: string[];
}

const ADMIN_LINKS = [
  { href: "/admin/products/new", label: "+ Add product", accent: true },
  { href: "/admin/products", label: "Manage Products" },
  { href: "/admin/vouchers", label: "Vouchers" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/hero-images", label: "Hero Images" },
  { href: "/admin/categories", label: "Manage Categories" },
  { href: "/admin/campaigns", label: "Sale Campaigns" },
];

const ABOUT_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/return-refund-policy", label: "Return & Refund Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" },
];

function AdminMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ y: -1 }}
        className="flex items-center gap-1.5 text-sm font-semibold"
        style={{ color: "#22C08C" }}
      >
        Admin
        <motion.svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C08C" strokeWidth={2.5}
          animate={{ rotate: open ? 180 : 0 }}
          transition={spring}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 w-48 rounded-xl overflow-hidden shadow-xl z-50"
            style={{ background: "#0E1712", border: "1px solid #9DB3A633" }}
          >
            {ADMIN_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                style={{ color: l.accent ? "#22C08C" : "#9DB3A6", fontWeight: l.accent ? 600 : 400 }}
              >
                {l.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NAV_BG = "#0E1712";
const NAV_MUTED = "#9DB3A6";
const NAV_TEXT = "#F3F2EE";
const NAV_ACCENT = "#22C08C";

const spring = { type: "spring" as const, stiffness: 400, damping: 20 };

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <motion.div className="relative inline-block" initial="rest" whileHover="hover" animate="rest">
      <Link href={href} onClick={onClick} style={{ color: NAV_MUTED }} className="hover:!text-[#22C08C] transition-colors">
        {children}
      </Link>
      <motion.span
        className="absolute left-0 -bottom-1 h-[1.5px] w-full origin-left"
        style={{ background: NAV_ACCENT }}
        variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
        transition={{ duration: 0.25 }}
      />
    </motion.div>
  );
}

function NavDropdown({
  href,
  label,
  children,
  width = "w-56",
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  width?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <NavLink href={href}>{label}</NavLink>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-1/2 -translate-x-1/2 top-full mt-4 ${width} rounded-xl overflow-hidden shadow-xl z-50`}
            style={{ background: "#0E1712", border: "1px solid #9DB3A633" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoriesDropdown() {
  const [categories, setCategories] = useState<CategoryMeta[]>([]);

  useEffect(() => {
    fetchCategories().then((data) => setCategories(data.slice(0, 8)));
  }, []);

  return (
    <NavDropdown href="/categories" label="Categories">
      {categories.length === 0 ? (
        <div className="px-4 py-3 text-xs" style={{ color: NAV_MUTED }}>No categories yet.</div>
      ) : (
        categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
            style={{ color: NAV_MUTED }}
          >
            {c.name}
          </Link>
        ))
      )}
      <Link
        href="/categories"
        className="block px-4 py-2.5 text-sm font-semibold border-t"
        style={{ color: NAV_ACCENT, borderColor: "#9DB3A633" }}
      >
        View all categories →
      </Link>
    </NavDropdown>
  );
}

function AboutDropdown() {
  return (
    <NavDropdown href="/about" label="About">
      {ABOUT_LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
          style={{ color: NAV_MUTED }}
        >
          {l.label}
        </Link>
      ))}
    </NavDropdown>
  );
}

function ProductPreviewPanel({ href, label, products }: { href: string; label: string; products: PreviewProduct[] }) {
  return (
    <NavDropdown href={href} label={label} width="w-72">
      {products.length === 0 ? (
        <div className="px-4 py-3 text-xs" style={{ color: NAV_MUTED }}>Nothing right now — check back soon.</div>
      ) : (
        <div className="p-3 flex flex-col gap-1">
          {products.map((p) => {
            const original = parseFloat(p.price);
            const discounted = p.discount_pct ? Math.round(original * (1 - p.discount_pct / 100)) : original;
            return (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-11 h-11 rounded-md bg-white/10 overflow-hidden flex-shrink-0">
                  {p.image_urls[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${API_BASE}${p.image_urls[0]}`} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs truncate" style={{ color: NAV_TEXT }}>{p.title}</div>
                  <div className="text-xs font-semibold" style={{ color: NAV_ACCENT }}>
                    Rs. {discounted.toLocaleString()}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <Link
        href={href}
        className="block px-4 py-2.5 text-sm font-semibold border-t"
        style={{ color: NAV_ACCENT, borderColor: "#9DB3A633" }}
      >
        View all {label.toLowerCase()} →
      </Link>
    </NavDropdown>
  );
}

const mobileLinks = [
  { href: "/featured", label: "Featured" },
  { href: "/categories", label: "Categories" },
  { href: "/deals", label: "Deals" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [discounted, setDiscounted] = useState<PreviewProduct[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then((r) => (r.ok ? r.json() : []))
      .then((all: PreviewProduct[]) => setDiscounted(all.filter((p) => p.discount_pct).slice(0, 3)))
      .catch(() => setDiscounted([]));
  }, []);

  return (
    <div className="relative" style={{ background: NAV_BG }}>
      <div className="flex items-center justify-between px-6 md:px-18 py-7">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={spring} className="flex-shrink-0">
          <Link href="/" className="font-display font-bold text-xl" style={{ color: NAV_TEXT }}>
            Smart<span style={{ color: NAV_ACCENT }}>Click</span>
          </Link>
        </motion.div>

        <SearchBar className="hidden md:flex flex-1 max-w-sm mx-8" />

        <div className="hidden md:flex items-center gap-8 text-sm mr-8">
          <ProductPreviewPanel href="/featured" label="Featured" products={discounted} />
          <CategoriesDropdown />
          <ProductPreviewPanel href="/deals" label="Deals" products={discounted} />
          <AboutDropdown />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-5">
            {user?.role === "admin" && <AdminMenu />}
            {user ? (
              <>
                <NavLink href="/orders">My Orders</NavLink>
                <motion.button
                  onClick={logout}
                  whileHover={{ color: NAV_ACCENT }}
                  className="text-sm"
                  style={{ color: NAV_MUTED }}
                >
                  Sign out
                </motion.button>
              </>
            ) : (
              <NavLink href="/login">Sign in</NavLink>
            )}
          </div>

          <NotificationBell />

          <motion.div whileHover={{ scale: 1.08, rotate: -4 }} whileTap={{ scale: 0.92 }} transition={spring}>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:border-[#22C08C]"
              style={{ border: `1px solid ${NAV_MUTED}` }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAV_TEXT} strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.08, rotate: 4 }} whileTap={{ scale: 0.92 }} transition={spring} className="relative">
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: NAV_ACCENT }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0E1712" strokeWidth={2}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={spring}
                    className="absolute -top-1 -right-1 bg-white text-[#0E1712] text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] flex items-center justify-center px-1"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>

          <motion.button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            whileTap={{ scale: 0.9 }}
            className="md:hidden w-10 h-10 flex items-center justify-center"
          >
            <motion.svg
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV_TEXT} strokeWidth={2}
              animate={{ rotate: menuOpen ? 90 : 0 }}
              transition={spring}
            >
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </motion.svg>
          </motion.button>
        </div>
      </div>

      <PromoScroller />

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
            style={{ background: NAV_BG, borderTop: `1px solid ${NAV_MUTED}22` }}
          >
            <div className="px-6 pt-5">
              <SearchBar className="flex w-full" />
            </div>
            <div className="flex flex-col px-6 py-6 gap-5 text-sm">
              {mobileLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
                  {l.label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <>
                  <Link href="/admin/products/new" onClick={() => setMenuOpen(false)} className="font-semibold" style={{ color: NAV_ACCENT }}>
                    + Add product
                  </Link>
                  <Link href="/admin/products" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
                    Manage Products
                  </Link>
                  <Link href="/admin/vouchers" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
                    Vouchers
                  </Link>
                  <Link href="/admin/analytics" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
                    Analytics
                  </Link>
                  <Link href="/admin/hero-images" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
                    Hero Images
                  </Link>
                  <Link href="/admin/categories" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
                    Manage Categories
                  </Link>
                  <Link href="/admin/campaigns" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
                    Sale Campaigns
                  </Link>
                </>
              )}
              <div className="pt-4 flex flex-col gap-5" style={{ borderTop: `1px solid ${NAV_MUTED}22` }}>
                {user ? (
                  <>
                    <Link href="/orders" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
                      My Orders
                    </Link>
                    <button onClick={() => { logout(); setMenuOpen(false); }} style={{ color: NAV_MUTED, textAlign: "left" }}>
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}