// "use client";

// import { useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import { AnimatePresence, motion } from "framer-motion";
// import { useAuth } from "@/lib/auth-context";
// import { useCart } from "@/lib/cart-context";
// import { fetchCategories, CategoryMeta } from "@/lib/categories";
// import { resolveImageUrl } from "@/lib/api";
// import NotificationBell from "./NotificationBell";
// import PromoScroller from "./PromoScroller";
// import SearchBar from "./SearchBar";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// interface PreviewProduct {
//   id: string;
//   title: string;
//   price: string;
//   discount_pct: number | null;
//   image_urls: string[];
// }

// const ADMIN_LINKS = [
//   { href: "/admin/products/new", label: "+ Add product", accent: true },
//   { href: "/admin/products", label: "Manage Products" },
//   { href: "/admin/vouchers", label: "Vouchers" },
//   { href: "/admin/analytics", label: "Analytics" },
//   { href: "/admin/hero-images", label: "Hero Images" },
//   { href: "/admin/categories", label: "Manage Categories" },
//   { href: "/admin/campaigns", label: "Sale Campaigns" },
// ];

// const ABOUT_LINKS = [
//   { href: "/about", label: "About Us" },
//   { href: "/contact", label: "Contact" },
//   { href: "/privacy-policy", label: "Privacy Policy" },
//   { href: "/terms-and-conditions", label: "Terms & Conditions" },
//   { href: "/return-refund-policy", label: "Return & Refund Policy" },
//   { href: "/shipping-policy", label: "Shipping Policy" },
// ];

// function AdminMenu() {
//   const [open, setOpen] = useState(false);
//   const rootRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div ref={rootRef} className="relative">
//       <motion.button
//         onClick={() => setOpen((v) => !v)}
//         whileHover={{ y: -1 }}
//         className="flex items-center gap-1.5 text-sm font-semibold"
//         style={{ color: "#22C08C" }}
//       >
//         Admin
//         <motion.svg
//           width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C08C" strokeWidth={2.5}
//           animate={{ rotate: open ? 180 : 0 }}
//           transition={spring}
//         >
//           <path d="M6 9l6 6 6-6" />
//         </motion.svg>
//       </motion.button>

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: -6, scale: 0.97 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: -6, scale: 0.97 }}
//             transition={{ duration: 0.15 }}
//             className="absolute right-0 top-full mt-3 w-48 rounded-xl overflow-hidden shadow-xl z-50"
//             style={{ background: "#0E1712", border: "1px solid #9DB3A633" }}
//           >
//             {ADMIN_LINKS.map((l) => (
//               <Link
//                 key={l.href}
//                 href={l.href}
//                 onClick={() => setOpen(false)}
//                 className="block px-4 py-3 text-sm hover:bg-white/5 transition-colors"
//                 style={{ color: l.accent ? "#22C08C" : "#9DB3A6", fontWeight: l.accent ? 600 : 400 }}
//               >
//                 {l.label}
//               </Link>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// const NAV_BG = "#0E1712";
// const NAV_MUTED = "#9DB3A6";
// const NAV_TEXT = "#F3F2EE";
// const NAV_ACCENT = "#22C08C";

// const spring = { type: "spring" as const, stiffness: 400, damping: 20 };

// function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
//   return (
//     <motion.div className="relative inline-block" initial="rest" whileHover="hover" animate="rest">
//       <Link href={href} onClick={onClick} style={{ color: NAV_MUTED }} className="hover:!text-[#22C08C] transition-colors">
//         {children}
//       </Link>
//       <motion.span
//         className="absolute left-0 -bottom-1 h-[1.5px] w-full origin-left"
//         style={{ background: NAV_ACCENT }}
//         variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
//         transition={{ duration: 0.25 }}
//       />
//     </motion.div>
//   );
// }

// function NavDropdown({
//   href,
//   label,
//   children,
//   width = "w-56",
// }: {
//   href: string;
//   label: string;
//   children: React.ReactNode;
//   width?: string;
// }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
//       <NavLink href={href}>{label}</NavLink>
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: -6 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -6 }}
//             transition={{ duration: 0.15 }}
//             className={`absolute left-1/2 -translate-x-1/2 top-full mt-4 ${width} rounded-xl overflow-hidden shadow-xl z-50`}
//             style={{ background: "#0E1712", border: "1px solid #9DB3A633" }}
//           >
//             {children}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// function CategoriesDropdown() {
//   const [categories, setCategories] = useState<CategoryMeta[]>([]);

//   useEffect(() => {
//     fetchCategories().then((data) => setCategories(data.slice(0, 8)));
//   }, []);

//   return (
//     <NavDropdown href="/categories" label="Categories">
//       {categories.length === 0 ? (
//         <div className="px-4 py-3 text-xs" style={{ color: NAV_MUTED }}>No categories yet.</div>
//       ) : (
//         categories.map((c) => (
//           <Link
//             key={c.id}
//             href={`/category/${c.slug}`}
//             className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
//             style={{ color: NAV_MUTED }}
//           >
//             {c.name}
//           </Link>
//         ))
//       )}
//       <Link
//         href="/categories"
//         className="block px-4 py-2.5 text-sm font-semibold border-t"
//         style={{ color: NAV_ACCENT, borderColor: "#9DB3A633" }}
//       >
//         View all categories →
//       </Link>
//     </NavDropdown>
//   );
// }

// function AboutDropdown() {
//   return (
//     <NavDropdown href="/about" label="About">
//       {ABOUT_LINKS.map((l) => (
//         <Link
//           key={l.href}
//           href={l.href}
//           className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
//           style={{ color: NAV_MUTED }}
//         >
//           {l.label}
//         </Link>
//       ))}
//     </NavDropdown>
//   );
// }

// function ProductPreviewPanel({ href, label, products }: { href: string; label: string; products: PreviewProduct[] }) {
//   return (
//     <NavDropdown href={href} label={label} width="w-72">
//       {products.length === 0 ? (
//         <div className="px-4 py-3 text-xs" style={{ color: NAV_MUTED }}>Nothing right now — check back soon.</div>
//       ) : (
//         <div className="p-3 flex flex-col gap-1">
//           {products.map((p) => {
//             const original = parseFloat(p.price);
//             const discounted = p.discount_pct ? Math.round(original * (1 - p.discount_pct / 100)) : original;
//             return (
//               <Link
//                 key={p.id}
//                 href={`/product/${p.id}`}
//                 className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
//               >
//                 <div className="w-11 h-11 rounded-md bg-white/10 overflow-hidden flex-shrink-0">
//                   {p.image_urls[0] && (
//                     // eslint-disable-next-line @next/next/no-img-element
//                     <img src={`${resolveImageUrl(p.image_urls[0])}`} alt="" className="w-full h-full object-cover" />
//                   )}
//                 </div>
//                 <div className="min-w-0">
//                   <div className="text-xs truncate" style={{ color: NAV_TEXT }}>{p.title}</div>
//                   <div className="text-xs font-semibold" style={{ color: NAV_ACCENT }}>
//                     Rs. {discounted.toLocaleString()}
//                   </div>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>
//       )}
//       <Link
//         href={href}
//         className="block px-4 py-2.5 text-sm font-semibold border-t"
//         style={{ color: NAV_ACCENT, borderColor: "#9DB3A633" }}
//       >
//         View all {label.toLowerCase()} →
//       </Link>
//     </NavDropdown>
//   );
// }

// const mobileLinks = [
//   { href: "/featured", label: "Featured" },
//   { href: "/categories", label: "Categories" },
//   { href: "/deals", label: "Deals" },
//   { href: "/about", label: "About" },
// ];

// export default function Nav() {
//   const { user, logout } = useAuth();
//   const { count } = useCart();
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [discounted, setDiscounted] = useState<PreviewProduct[]>([]);

//   useEffect(() => {
//     fetch(`${API_BASE}/products`)
//       .then((r) => (r.ok ? r.json() : []))
//       .then((all: PreviewProduct[]) => setDiscounted(all.filter((p) => p.discount_pct).slice(0, 3)))
//       .catch(() => setDiscounted([]));
//   }, []);

//   return (
//     <div className="relative" style={{ background: NAV_BG }}>
//       <div className="flex items-center justify-between px-6 md:px-18 py-7">
//         <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={spring} className="flex-shrink-0">
//           <Link href="/" className="font-display font-bold text-xl" style={{ color: NAV_TEXT }}>
//             Smart<span style={{ color: NAV_ACCENT }}>Click</span>
//           </Link>
//         </motion.div>

//         <SearchBar className="hidden md:flex flex-1 max-w-sm mx-8" />

//         <div className="hidden md:flex items-center gap-8 text-sm mr-8">
//           <ProductPreviewPanel href="/featured" label="Featured" products={discounted} />
//           <CategoriesDropdown />
//           <ProductPreviewPanel href="/deals" label="Deals" products={discounted} />
//           <AboutDropdown />
//         </div>

//         <div className="flex items-center gap-4">
//           <div className="hidden md:flex items-center gap-5">
//             {user?.role === "admin" && <AdminMenu />}
//             {user ? (
//               <>
//                 <NavLink href="/orders">My Orders</NavLink>
//                 <motion.button
//                   onClick={logout}
//                   whileHover={{ color: NAV_ACCENT }}
//                   className="text-sm"
//                   style={{ color: NAV_MUTED }}
//                 >
//                   Sign out
//                 </motion.button>
//               </>
//             ) : (
//               <NavLink href="/login">Sign in</NavLink>
//             )}
//           </div>

//           <NotificationBell />

//           <motion.div whileHover={{ scale: 1.08, rotate: -4 }} whileTap={{ scale: 0.92 }} transition={spring}>
//             <Link
//               href="/wishlist"
//               aria-label="Wishlist"
//               className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:border-[#22C08C]"
//               style={{ border: `1px solid ${NAV_MUTED}` }}
//             >
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAV_TEXT} strokeWidth={2}>
//                 <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
//               </svg>
//             </Link>
//           </motion.div>

//           <motion.div whileHover={{ scale: 1.08, rotate: 4 }} whileTap={{ scale: 0.92 }} transition={spring} className="relative">
//             <Link
//               href="/cart"
//               aria-label="Cart"
//               className="relative w-10 h-10 rounded-full flex items-center justify-center"
//               style={{ background: NAV_ACCENT }}
//             >
//               <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0E1712" strokeWidth={2}>
//                 <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
//                 <path d="M3 6h18" />
//                 <path d="M16 10a4 4 0 0 1-8 0" />
//               </svg>
//               <AnimatePresence>
//                 {count > 0 && (
//                   <motion.span
//                     key={count}
//                     initial={{ scale: 0, opacity: 0 }}
//                     animate={{ scale: 1, opacity: 1 }}
//                     exit={{ scale: 0, opacity: 0 }}
//                     transition={spring}
//                     className="absolute -top-1 -right-1 bg-white text-[#0E1712] text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] flex items-center justify-center px-1"
//                   >
//                     {count}
//                   </motion.span>
//                 )}
//               </AnimatePresence>
//             </Link>
//           </motion.div>

//           <motion.button
//             aria-label={menuOpen ? "Close menu" : "Open menu"}
//             aria-expanded={menuOpen}
//             onClick={() => setMenuOpen((v) => !v)}
//             whileTap={{ scale: 0.9 }}
//             className="md:hidden w-10 h-10 flex items-center justify-center"
//           >
//             <motion.svg
//               width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAV_TEXT} strokeWidth={2}
//               animate={{ rotate: menuOpen ? 90 : 0 }}
//               transition={spring}
//             >
//               {menuOpen ? (
//                 <path d="M18 6L6 18M6 6l12 12" />
//               ) : (
//                 <path d="M3 6h18M3 12h18M3 18h18" />
//               )}
//             </motion.svg>
//           </motion.button>
//         </div>
//       </div>

//       <PromoScroller />

//       <AnimatePresence>
//         {menuOpen && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.25, ease: "easeInOut" }}
//             className="md:hidden overflow-hidden"
//             style={{ background: NAV_BG, borderTop: `1px solid ${NAV_MUTED}22` }}
//           >
//             <div className="px-6 pt-5">
//               <SearchBar className="flex w-full" />
//             </div>
//             <div className="flex flex-col px-6 py-6 gap-5 text-sm">
//               {mobileLinks.map((l) => (
//                 <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
//                   {l.label}
//                 </Link>
//               ))}
//               {user?.role === "admin" && (
//                 <>
//                   <Link href="/admin/products/new" onClick={() => setMenuOpen(false)} className="font-semibold" style={{ color: NAV_ACCENT }}>
//                     + Add product
//                   </Link>
//                   <Link href="/admin/products" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
//                     Manage Products
//                   </Link>
//                   <Link href="/admin/vouchers" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
//                     Vouchers
//                   </Link>
//                   <Link href="/admin/analytics" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
//                     Analytics
//                   </Link>
//                   <Link href="/admin/hero-images" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
//                     Hero Images
//                   </Link>
//                   <Link href="/admin/categories" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
//                     Manage Categories
//                   </Link>
//                   <Link href="/admin/campaigns" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
//                     Sale Campaigns
//                   </Link>
//                 </>
//               )}
//               <div className="pt-4 flex flex-col gap-5" style={{ borderTop: `1px solid ${NAV_MUTED}22` }}>
//                 {user ? (
//                   <>
//                     <Link href="/orders" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
//                       My Orders
//                     </Link>
//                     <button onClick={() => { logout(); setMenuOpen(false); }} style={{ color: NAV_MUTED, textAlign: "left" }}>
//                       Sign out
//                     </button>
//                   </>
//                 ) : (
//                   <Link href="/login" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
//                     Sign in
//                   </Link>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { fetchCategories, CategoryMeta } from "@/lib/categories";
import { resolveImageUrl } from "@/lib/api";
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
  average_rating?: number | null;
  review_count?: number;
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

const NAV_BG = "#0E1712";
const NAV_MUTED = "#9DB3A6";
const NAV_TEXT = "#F3F2EE";
const NAV_ACCENT = "#22C08C";
const PANEL_STYLE = { background: "#0E1712", border: "1px solid #9DB3A633" };

const spring = { type: "spring" as const, stiffness: 400, damping: 20 };

/** True when `pathname` is this section (e.g. /category/x counts as Categories). */
function isActive(pathname: string, href: string) {
  if (href === "/categories") return pathname === "/categories" || pathname.startsWith("/category/");
  if (href === "/about") return ABOUT_LINKS.some((l) => pathname === l.href);
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Closes a popover when clicking outside it. */
function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onOutside]);
  return ref;
}

function Chevron({ open, color = NAV_MUTED }: { open: boolean; color?: string }) {
  return (
    <motion.svg
      width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}
      animate={{ rotate: open ? 180 : 0 }}
      transition={spring}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
  );
}

function AdminMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useClickOutside(() => setOpen(false));

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ y: -1 }}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
        style={{ color: NAV_ACCENT, background: "#22C08C1A", border: "1px solid #22C08C55" }}
      >
        Admin
        <Chevron open={open} color={NAV_ACCENT} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 w-52 rounded-xl overflow-hidden shadow-2xl z-50"
            style={PANEL_STYLE}
          >
            {ADMIN_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                style={{ color: l.accent ? NAV_ACCENT : NAV_MUTED, fontWeight: l.accent ? 600 : 400 }}
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

function NavLink({
  href, children, onClick, badge,
}: { href: string; children: React.ReactNode; onClick?: () => void; badge?: React.ReactNode }) {
  const pathname = usePathname() || "";
  const active = isActive(pathname, href);
  return (
    <motion.div className="relative inline-flex items-center gap-1.5" initial="rest" whileHover="hover" animate={active ? "hover" : "rest"}>
      <Link
        href={href}
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        style={{ color: active ? NAV_TEXT : NAV_MUTED, fontWeight: active ? 600 : 500 }}
        className="hover:!text-[#22C08C] transition-colors"
      >
        {children}
      </Link>
      {badge}
      <motion.span
        className="absolute left-0 -bottom-1.5 h-[2px] w-full origin-left rounded-full"
        style={{ background: NAV_ACCENT }}
        variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
        transition={{ duration: 0.25 }}
      />
    </motion.div>
  );
}

function NavDropdown({
  href, label, children, width = "w-56", badge,
}: { href: string; label: string; children: React.ReactNode; width?: string; badge?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative flex items-center gap-1"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      // Keyboard users: open while focus is inside, close when it leaves.
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <NavLink href={href} badge={badge}>{label}</NavLink>
      <Chevron open={open} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 ${width} z-50`}
          >
            {/* pt-4 above is an invisible hover bridge so the panel doesn't close on the way down */}
            <div className="rounded-xl overflow-hidden shadow-2xl" style={PANEL_STYLE}>
              {children}
            </div>
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
    <NavDropdown href="/categories" label="Categories" width="w-64">
      {categories.length === 0 ? (
        <div className="px-4 py-3 text-xs" style={{ color: NAV_MUTED }}>No categories yet.</div>
      ) : (
        <div className="p-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-white/5 transition-colors"
              style={{ color: NAV_MUTED }}
            >
              <span className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md bg-white/10 flex items-center justify-center text-xs font-bold" style={{ color: NAV_ACCENT }}>
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveImageUrl(c.image_url)} alt="" className="h-full w-full object-cover" />
                ) : (
                  c.name.charAt(0)
                )}
              </span>
              <span className="truncate">{c.name}</span>
            </Link>
          ))}
        </div>
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

function ProductPreviewPanel({
  href, label, products, blurb, badge,
}: { href: string; label: string; products: PreviewProduct[]; blurb: string; badge?: React.ReactNode }) {
  return (
    <NavDropdown href={href} label={label} width="w-80" badge={badge}>
      <div className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: NAV_MUTED }}>
        {blurb}
      </div>
      {products.length === 0 ? (
        <div className="px-4 py-3 text-xs" style={{ color: NAV_MUTED }}>Nothing right now — check back soon.</div>
      ) : (
        <div className="p-2 flex flex-col gap-1">
          {products.map((p) => {
            const original = parseFloat(p.price);
            const discounted = p.discount_pct ? Math.round(original * (1 - p.discount_pct / 100)) : original;
            return (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="relative w-12 h-12 rounded-md bg-white/10 overflow-hidden flex-shrink-0">
                  {p.image_urls[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${resolveImageUrl(p.image_urls[0])}`} alt="" className="w-full h-full object-cover" />
                  )}
                  {p.discount_pct ? (
                    <span className="absolute bottom-0 left-0 right-0 bg-[#DC2626] text-center text-[9px] font-bold text-white">
                      -{p.discount_pct}%
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="text-xs truncate" style={{ color: NAV_TEXT }}>{p.title}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-semibold" style={{ color: NAV_ACCENT }}>
                      Rs. {discounted.toLocaleString()}
                    </span>
                    {p.discount_pct ? (
                      <span className="text-[10px] line-through" style={{ color: NAV_MUTED }}>
                        Rs. {Math.round(original).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  {p.review_count ? (
                    <div className="text-[10px]" style={{ color: NAV_MUTED }}>
                      ★ {(p.average_rating ?? 0).toFixed(1)} ({p.review_count})
                    </div>
                  ) : null}
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

function AccountMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useClickOutside(() => setOpen(false));
  if (!user) return null;

  const display = user.full_name?.trim() || user.email;
  const initial = display.charAt(0).toUpperCase();

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={spring}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm font-bold"
        style={{ background: "#22C08C22", color: NAV_ACCENT, border: `1px solid ${NAV_ACCENT}66` }}
      >
        {initial}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 w-60 rounded-xl overflow-hidden shadow-2xl z-50"
            style={PANEL_STYLE}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: "#9DB3A633" }}>
              <div className="text-sm font-semibold truncate" style={{ color: NAV_TEXT }}>{display}</div>
              {user.full_name && <div className="text-xs truncate" style={{ color: NAV_MUTED }}>{user.email}</div>}
            </div>
            {[
              { href: "/orders", label: "My Orders" },
              { href: "/wishlist", label: "My Wishlist" },
              { href: "/cart", label: "My Cart" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                style={{ color: NAV_MUTED }}
              >
                {l.label}
              </Link>
            ))}
            <button
              role="menuitem"
              onClick={() => { setOpen(false); logout(); }}
              className="block w-full px-4 py-2.5 text-left text-sm border-t hover:bg-white/5 transition-colors"
              style={{ color: "#F87171", borderColor: "#9DB3A633" }}
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const mobileLinks = [
  { href: "/featured", label: "Featured", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { href: "/categories", label: "Categories", icon: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" },
  { href: "/deals", label: "Deals", icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01" },
  { href: "/about", label: "About", icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01" },
];

export default function Nav() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const pathname = usePathname() || "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [discounted, setDiscounted] = useState<PreviewProduct[]>([]);
  const [featured, setFeatured] = useState<PreviewProduct[]>([]);
  const [dealCount, setDealCount] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then((r) => (r.ok ? r.json() : []))
      .then((all: PreviewProduct[]) => {
        const deals = all.filter((p) => p.discount_pct).sort((a, b) => (b.discount_pct ?? 0) - (a.discount_pct ?? 0));
        setDealCount(deals.length);
        setDiscounted(deals.slice(0, 3));
        // Featured preview: best-rated first, then newest (the API returns newest first).
        const rated = all
          .filter((p) => p.review_count)
          .sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
        const rest = all.filter((p) => !p.review_count);
        setFeatured([...rated, ...rest].slice(0, 3));
      })
      .catch(() => {
        setDiscounted([]);
        setFeatured([]);
      });
  }, []);

  // Compact, shadowed header once the page is scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const dealsBadge =
    dealCount > 0 ? (
      <span className="relative flex">
        <span className="absolute inline-flex h-full w-full animate-ping motion-reduce:animate-none rounded-full bg-[#F97316] opacity-60" />
        <span className="relative rounded-full bg-[#F97316] px-1.5 text-[9px] font-bold leading-4 text-white">
          {dealCount}
        </span>
      </span>
    ) : undefined;

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-shadow duration-300"
        style={{
          background: scrolled ? "rgba(14,23,18,0.92)" : NAV_BG,
          backdropFilter: scrolled ? "saturate(160%) blur(10px)" : undefined,
          WebkitBackdropFilter: scrolled ? "saturate(160%) blur(10px)" : undefined,
          boxShadow: scrolled ? "0 8px 24px rgba(0,0,0,0.25)" : "none",
          borderBottom: `1px solid ${scrolled ? "#9DB3A61F" : "transparent"}`,
        }}
      >
        <div
          className="flex items-center justify-between px-6 md:px-18 transition-[padding] duration-300"
          style={{ paddingTop: scrolled ? 12 : 22, paddingBottom: scrolled ? 12 : 22 }}
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={spring} className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl" style={{ color: NAV_TEXT }} aria-label="Smart Click home">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: NAV_ACCENT }} aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAV_BG} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 9l5 12 1.8-5.2L21 14z" />
                  <path d="M7.2 2.2L8 5.1M5.1 8L2.2 7.2M14 4.1L12 6.2M6.2 12l-2.1 2" />
                </svg>
              </span>
              <span>
                Smart<span style={{ color: NAV_ACCENT }}>Click</span>
              </span>
            </Link>
          </motion.div>

          <SearchBar className="hidden md:flex flex-1 max-w-sm mx-8" />

          <nav aria-label="Main" className="hidden md:flex items-center gap-7 text-sm mr-8">
            <ProductPreviewPanel href="/featured" label="Featured" products={featured} blurb="Top rated & new" />
            <CategoriesDropdown />
            <ProductPreviewPanel href="/deals" label="Deals" products={discounted} blurb="Biggest discounts now" badge={dealsBadge} />
            <AboutDropdown />
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {user?.role === "admin" && <AdminMenu />}
              {!user && (
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
                  style={{ color: NAV_TEXT, border: `1px solid ${NAV_MUTED}66` }}
                >
                  Sign in
                </Link>
              )}
            </div>

            <NotificationBell />

            <motion.div whileHover={{ scale: 1.08, rotate: -4 }} whileTap={{ scale: 0.92 }} transition={spring} className="hidden sm:block">
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                title="Wishlist"
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
                aria-label={count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"}
                title="Cart"
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
                      className="absolute -top-1 -right-1 bg-white text-[#0E1712] text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            <div className="hidden md:block">
              <AccountMenu />
            </div>

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
                {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
              </motion.svg>
            </motion.button>
          </div>
        </div>

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
              <div className="max-h-[calc(100vh-72px)] overflow-y-auto">
                <div className="px-6 pt-5">
                  <SearchBar className="flex w-full" />
                </div>

                {user && (
                  <div className="mx-6 mt-5 flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "#FFFFFF0D" }}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full font-bold" style={{ background: "#22C08C22", color: NAV_ACCENT }}>
                      {(user.full_name?.trim() || user.email).charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold" style={{ color: NAV_TEXT }}>{user.full_name?.trim() || user.email}</div>
                      {user.full_name && <div className="truncate text-xs" style={{ color: NAV_MUTED }}>{user.email}</div>}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 px-6 pt-5">
                  {mobileLinks.map((l) => {
                    const active = isActive(pathname, l.href);
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium"
                        style={{
                          color: active ? NAV_BG : NAV_TEXT,
                          background: active ? NAV_ACCENT : "#FFFFFF0D",
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d={l.icon} />
                        </svg>
                        {l.label}
                        {l.href === "/deals" && dealCount > 0 && (
                          <span className="ml-auto rounded-full bg-[#F97316] px-1.5 text-[10px] font-bold leading-4 text-white">{dealCount}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {user?.role === "admin" && (
                  <div className="px-6 pt-6">
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: NAV_ACCENT }}>Admin</div>
                    <div className="flex flex-col gap-4 text-sm">
                      {ADMIN_LINKS.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setMenuOpen(false)}
                          className={l.accent ? "font-semibold" : undefined}
                          style={{ color: l.accent ? NAV_ACCENT : NAV_MUTED }}
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mx-6 mt-6 flex flex-col gap-4 border-t py-6 text-sm" style={{ borderColor: `${NAV_MUTED}22` }}>
                  <Link href="/wishlist" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
                    My Wishlist
                  </Link>
                  {user ? (
                    <>
                      <Link href="/orders" onClick={() => setMenuOpen(false)} style={{ color: NAV_MUTED }}>
                        My Orders
                      </Link>
                      <button onClick={() => { logout(); setMenuOpen(false); }} style={{ color: "#F87171", textAlign: "left" }}>
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl py-3 text-center font-semibold"
                      style={{ background: NAV_ACCENT, color: NAV_BG }}
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <PromoScroller />
    </>
  );
}
