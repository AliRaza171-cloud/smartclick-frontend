# Smart Click — Frontend (Phase 1 auth pages + Phase 2 storefront)

Next.js (App Router) + Tailwind + GSAP.

## Run it

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Needs the backend running at the URL in `NEXT_PUBLIC_API_URL` (defaults to
`http://localhost:8000`).

## What's here

**Phase 1 — Auth**
- `lib/api.ts` — fetch wrapper: keeps the access token in memory only,
  auto-refreshes on a 401, dedupes concurrent refresh calls.
- `lib/auth-context.tsx` — `useAuth()` hook: `user`, `login`, `register`,
  `logout`, and silent session restore on load via the httpOnly cookie.
- `app/(auth)/login`, `register`, `forgot-password`, `reset-password` — pages
  wired to the backend from Phase 1.

**Phase 2 — Storefront UI + motion (complete)**
- `app/page.tsx` — landing page: `Hero`, `CategoryStrip`, `ProductGrid`, built
  from the Design canvas mockup ("Smart Click" artifact).
- `app/categories/page.tsx` — categories **overview**: tiles for each category
  with a live product count, linking to their own dedicated pages.
- `app/category/[slug]/page.tsx` — dedicated landing page **per category**
  (`/category/electronics`, `/category/fashion`, etc.), each with its own
  banner/tagline and a product grid filtered to just that category.
- `app/product/[id]/page.tsx` — product detail page skeleton: price,
  discount, voucher/free-shipping badges, add-to-cart/buy-now buttons (not
  yet wired to a cart — that's Phase 6). The 360°-viewer area is a labeled
  placeholder until Phase 5 adds real product photography.
- `components/Nav.tsx` — includes a working mobile menu (Framer Motion
  slide-down), not just a hidden desktop nav.
- `lib/products.ts` — shared placeholder catalog used by the grid, browse
  page, and product page. Swap for a real `/products` fetch once Phase 5
  (product management + the AI listing agent) exists.
- Motion: GSAP entrance animation on the hero and product page, GSAP
  ScrollTrigger stagger on the product grid, Framer Motion for the mobile
  nav — the "GSAP/Framer Motion foundation" Phase 2 called for.

**Note on the Next.js version**: pinned to `14.2.16` rather than 15.x. Next.js
15 uses React 19 internals for its own bundling regardless of the React
version pinned in this file, and `@react-three/fiber` v8 (the stable release)
was built against React 18's internal API, which no longer exists under
Next 15 — a confirmed, widely-reported incompatibility (see
github.com/vercel/next.js/issues/71836), not a mistake in this setup.
Upgrading to R3F's v9 alpha/rc line is the alternative once it stabilizes,
but 14.2.16 is the safer choice for now.

**Phase 3 — 3D homepage hero (complete)**
- `components/Hero3D.tsx` — React Three Fiber scene: three floating,
  brand-colored primitives (rounded cube, torus, sphere) with soft shadows
  and gentle auto-rotation. Deliberately abstract rather than a literal
  product render — a specific product needs real scanned/modeled 3D assets,
  which don't exist yet; those come per-product in Phase 5 (360° viewer)
  once real photography exists.
- Loaded via `next/dynamic` with `ssr: false` in `Hero.tsx` — WebGL can't
  render during server-side rendering, so the scene mounts client-side only,
  after the rest of the page is already visible.
- New dependencies: `three`, `@react-three/fiber`, `@react-three/drei`.

**Phase 5 — Product management (complete)**
- `app/admin/products/new/page.tsx` — admin-only upload page: select photos,
  "Analyze with AI" (calls the backend's `/products/analyze` proxy), review
  and edit the draft, fill in price/discount/voucher/free-shipping, publish.
  Falls back gracefully to a fully manual listing if the AI service is
  unavailable.
- `components/ProductViewer.tsx` — the 360°-style viewer: drag left/right to
  cycle through the seller's uploaded photos (the same trick real turntable
  product photography uses), with thumbnail selection. This is **not** a
  true 3D model — that needs an actual scanned/modeled asset — but it's a
  real, working "spin" experience built from real uploaded photos.
- `lib/server-products.ts` — fetches real products from the backend
  (`cache: "no-store"`, since prices/stock change often) and maps its
  snake_case shape to the frontend's `Product` type. **Price convention**:
  the backend's `price` is the admin-entered ORIGINAL price; the
  buyer-facing discounted price is computed here as
  `price × (1 - discount_pct / 100)`, not stored twice.
- Home, `/categories`, `/category/[slug]`, and the product detail page all
  now fetch real data instead of the static placeholder catalog. An empty
  catalog shows an honest "no listings yet" message rather than fake demo
  products.
- `lib/api.ts` gained `apiFetchMultipart` for file-upload requests, since
  multipart bodies need the browser to set their own Content-Type boundary
  (the existing `apiFetch` always sets `application/json`).
- Nav shows a "+ Add product" link only when `user.role === "admin"`.

**Phase 6 — Cart & checkout (complete)**
- `lib/cart-context.tsx` — cart state backed by `localStorage` (per
  browser/device, not synced to the account — the Phase 6 decision). Guards
  against a corrupted/blocked storage read on load, and against overwriting
  storage with an empty cart before the initial load finishes.
- Product page's Add to Cart / Buy Now buttons are now wired to it; Nav's
  cart icon shows a live item-count badge.
- `/cart` — item list with quantity controls, a voucher-code field that
  calls the backend's public `/vouchers/{code}/check` for a live preview
  (the real, authoritative discount is always recalculated server-side at
  order time — this is just a UI preview).
- `/checkout` — **requires login** (the Phase 6 decision); redirects to
  `/login?redirect=/checkout` and back if not signed in. Shipping form,
  places the order via `POST /orders`, then clears the cart.
- `/orders/[id]` — confirmation page showing the order summary and status
  (`pending_payment` until Phase 7 wires up real payment processing).
- **Nothing here trusts client-side prices** — the cart only ever sends
  `{product_id, quantity}` to the backend; every displayed total before
  that point is an estimate for the buyer's benefit, not what's charged.

**Categories are now dynamic, not a fixed list**
- `lib/categories.ts` replaces the old static `categoryList` in
  `lib/products.ts` — `fetchCategories()` and `getCategoryBySlug()` now hit
  the real backend (`GET /categories`), `cache: "no-store"` since an admin
  can add one at any time.
- Home's `CategoryStrip`, `/categories`, and `/category/[slug]` all fetch
  live categories instead of importing a static array.
- The admin upload page's category `<select>` is populated from the same
  live list, with a **"+ Add new category"** option that reveals a small
  inline form (name + optional tagline) calling `POST /categories` — lets
  an admin add a category on the fly when uploading a product that doesn't
  fit anything existing, without touching any code.

**Landing page motion additions**
- `components/Hero.tsx` — "SHOP" and "SMARTER" now drift apart (right and
  left respectively) as the page scrolls past the hero, using GSAP
  ScrollTrigger's `scrub` — the animation's progress is tied directly to
  scroll position rather than firing once, so it feels physically connected
  to the scroll, with `scrub: 1` adding a soft second of lag rather than a
  raw 1:1 follow.
- `components/CategorySlider.tsx` (new) — the category strip is now an
  infinitely-looping GSAP-animated slider instead of a static grid. The
  category list is duplicated and animated from 0% to -50% on a loop, which
  lands exactly back where it started so the reset is invisible. Pauses on
  hover. `CategoryStrip` stays a server component (fetches categories),
  handing the data to this client component to animate.

**Printable shipping labels**
- `app/admin/orders/[id]/label/page.tsx` (new, admin-only) — a print-ready
  label: sender block (your store, from `GET /store-info`), receiver block
  (the order's shipping details), and a real scannable CODE128 barcode
  (`jsbarcode`) encoding the order's own ID. A "Print shipping label" link
  appears on the order confirmation page, admin-only.
- Print CSS (`@media print`) hides the page chrome (nav, the Print button
  itself) so only the label prints, not the surrounding page.
- New dependency: `jsbarcode` (plus a hand-written `lib/jsbarcode.d.ts`,
  since the package ships no TypeScript types of its own).

**Order fulfillment tracking**
- `components/OrderStatusTracker.tsx` (new) — a 3-step visual tracker
  (Pending → Ready to Ship → Shipped) shown on the order confirmation page
  for every viewer.
- Admin viewers additionally see a "Mark as Ready to Ship" / "Mark as
  Shipped" button that calls `PATCH /orders/{id}/status` — advances one
  step at a time, button disappears once an order is fully shipped.
- This is separate from the payment status line already on the page
  (`pending_payment` etc., from Phase 6/7) — fulfillment and payment are
  tracked independently.

**In-app notifications**
- `components/NotificationBell.tsx` (new) — a bell icon in the Nav, visible
  to any logged-in user (buyer or admin). Shows an unread-count badge,
  polls `/notifications/unread-count` every 30 seconds, and a dropdown
  lists recent notifications — click one to mark it read and navigate to
  its linked order.
- Admins get notified when a new order comes in; buyers get notified when
  their order ships — same events the email notifications already cover,
  this is an additional channel, not a replacement.
- No mobile app exists yet (that's Phase 8) — but since this is plain REST
  (`/notifications`), a future mobile app calls the exact same endpoints
  with zero backend changes needed.

**Featured, Deals, About pages**
- `app/featured/page.tsx`, `app/deals/page.tsx` — both surface products
  with a discount applied (same criteria, different copy/header).
- `app/about/page.tsx` — simple static page. Copy is placeholder; edit
  directly in the file to change the wording.

**Wishlist**
- `app/wishlist/page.tsx` — a signed-in buyer's saved products.
- Heart-icon toggle button added to the product detail page (`app/product/[id]/page.tsx`),
  and a heart-icon link in the Nav (next to the cart icon).
- Unlike the cart (browser-only), the wishlist is tied to the account and
  requires login — it's meant to survive across devices.

**Analytics**
- `lib/analytics.ts` — `trackEvent()`, fire-and-forget, never throws into
  the calling UI.
- `components/PageViewTracker.tsx` — mounted once in the root layout, fires
  a `page_view` event on every route change (works for logged-out visitors
  too, via a cookie the backend sets).
- Product detail page fires `product_view` on load; Add to Cart / Buy Now
  fire `add_to_cart`; the wishlist heart fires `add_to_wishlist`.
- `app/admin/analytics/page.tsx` (new, admin-only) — unique visitors, total
  page views, and top-10 lists for most-viewed / most-added-to-cart /
  most-wishlisted products.

**Voucher admin UI**
- `app/admin/vouchers/page.tsx` (new, admin-only) — list all vouchers,
  deactivate any.
- `app/admin/vouchers/new/page.tsx` (new, admin-only) — create a voucher:
  percent/flat discount, optional free-shipping grant, optional minimum
  order / usage limit / expiry, and a scope toggle — **entire store** or
  **specific products** (checkbox list of every current product).
- Nav gained "Vouchers" and "Analytics" links, admin-only, in both the
  desktop and mobile menus.

## Next: Phase 7

Payments — Stripe and local Pakistani gateways (JazzCash/EasyPaisa),
processing the `pending_payment` orders Phase 6 creates and moving them to
`paid` via webhook-confirmed payment, not just a client-side "success" flag.