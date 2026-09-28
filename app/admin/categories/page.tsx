// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useAuth } from "@/lib/auth-context";
// import { apiFetch, getAccessToken, resolveImageUrl } from "@/lib/api";
// import { fetchCategories, CategoryMeta } from "@/lib/categories";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export default function AdminCategoriesPage() {
//   const { user, loading: authLoading } = useAuth();
//   const [categories, setCategories] = useState<CategoryMeta[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);
//   const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

//   async function load() {
//     setCategories(await fetchCategories());
//     setLoading(false);
//   }

//   useEffect(() => {
//     if (authLoading || user?.role !== "admin") return;
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [authLoading, user]);

//   async function handleImageSelected(slug: string, file: File) {
//     setUploadingSlug(slug);
//     const formData = new FormData();
//     formData.append("image", file);

//     const token = getAccessToken();
//     await fetch(`${API_BASE}/categories/${slug}/image`, {
//       method: "PATCH",
//       credentials: "include",
//       headers: token ? { Authorization: `Bearer ${token}` } : {},
//       body: formData,
//     });

//     setUploadingSlug(null);
//     load();
//   }

//   if (authLoading) return null;
//   if (!user || user.role !== "admin") {
//     return <div className="p-10 text-sm text-sc-muted">Admin access required.</div>;
//   }

//   return (
//     <div className="max-w-3xl mx-auto px-6 py-12">
//       <h1 className="font-display text-3xl font-semibold mb-2">Manage categories</h1>
//       <p className="text-sm text-sc-muted mb-8">
//         Set a banner image for each category so it shows on the homepage category strip instead of a
//         blank card.
//       </p>

//       {loading ? (
//         <p className="text-sm text-sc-muted">Loading…</p>
//       ) : categories.length === 0 ? (
//         <p className="text-sm text-sc-muted">No categories yet.</p>
//       ) : (
//         <div className="space-y-3">
//           {categories.map((c) => (
//             <div key={c.id} className="bg-white border border-sc-border rounded-xl p-4 flex items-center gap-4">
//               <div
//                 className="w-20 h-20 rounded-lg bg-[#F3F2EE] bg-cover bg-center flex-shrink-0"
//                 style={c.image_url ? { backgroundImage: `url(${resolveImageUrl(c.image_url)})` } : undefined}
//               />
//               <div className="flex-1">
//                 <div className="text-sm font-semibold">{c.name}</div>
//                 {c.tagline && <div className="text-xs text-sc-muted">{c.tagline}</div>}
//               </div>
//               <input
//                 ref={(el) => { fileInputRefs.current[c.slug] = el; }}
//                 type="file"
//                 accept="image/jpeg,image/png,image/webp"
//                 className="hidden"
//                 onChange={(e) => {
//                   const file = e.target.files?.[0];
//                   if (file) handleImageSelected(c.slug, file);
//                 }}
//               />
//               <button
//                 onClick={() => fileInputRefs.current[c.slug]?.click()}
//                 disabled={uploadingSlug === c.slug}
//                 className="text-xs font-semibold border border-sc-border rounded-lg px-4 py-2 disabled:opacity-50"
//               >
//                 {uploadingSlug === c.slug ? "Uploading..." : c.image_url ? "Change image" : "Add image"}
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, extractErrorMessage, getAccessToken, resolveImageUrl } from "@/lib/api";
import { fetchCategories, CategoryMeta } from "@/lib/categories";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminCategoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  // Storefront order being edited; null = unchanged from the server.
  const [draftOrder, setDraftOrder] = useState<string[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  // Category being renamed (by slug) and the form's values.
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setCategories(await fetchCategories());
    setDraftOrder(null);
    setLoading(false);
  }

  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const ordered = draftOrder
    ? draftOrder.map((s) => bySlug.get(s)).filter((c): c is CategoryMeta => !!c)
    : categories;

  function move(index: number, delta: number) {
    const next = ordered.map((c) => c.slug);
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrderError(null);
    setDraftOrder(next);
  }

  async function saveOrder() {
    if (!draftOrder) return;
    setSavingOrder(true);
    setOrderError(null);
    const res = await apiFetch("/categories/order", {
      method: "PATCH",
      body: JSON.stringify({ slugs: draftOrder }),
    });
    setSavingOrder(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setOrderError(extractErrorMessage(body, "Couldn't save the new order."));
      return;
    }
    load();
  }

  function startEdit(c: CategoryMeta) {
    setEditing(c.slug);
    setEditName(c.name);
    setEditTagline(c.tagline ?? "");
    setEditError(null);
    setNotice(null);
  }

  async function saveEdit(c: CategoryMeta) {
    const name = editName.replace(/\s+/g, " ").trim();
    if (!name) {
      setEditError("Enter a name.");
      return;
    }
    const changes: { name?: string; tagline?: string } = {};
    if (name !== c.name) changes.name = name;
    if (editTagline.trim() !== (c.tagline ?? "")) changes.tagline = editTagline.trim();
    if (Object.keys(changes).length === 0) {
      setEditing(null);
      return;
    }
    setSavingEdit(true);
    setEditError(null);
    const res = await apiFetch(`/categories/${encodeURIComponent(c.slug)}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
    setSavingEdit(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setEditError(extractErrorMessage(body, "Couldn't save the category."));
      return;
    }
    setEditing(null);
    if (changes.name) setNotice(`Renamed “${c.name}” to “${name}”. Its products moved with it.`);
    load();
  }

  useEffect(() => {
    if (authLoading || user?.role !== "admin") return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  async function handleImageSelected(slug: string, file: File) {
    setUploadingSlug(slug);
    const formData = new FormData();
    formData.append("image", file);

    const token = getAccessToken();
    await fetch(`${API_BASE}/categories/${slug}/image`, {
      method: "PATCH",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    setUploadingSlug(null);
    load();
  }

  if (authLoading) return null;
  if (!user || user.role !== "admin") {
    return <div className="p-10 text-sm text-sc-muted">Admin access required.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold mb-2">Manage categories</h1>
      <p className="text-sm text-sc-muted mb-8">
        Set a banner image for each category so it shows on the homepage category strip and the Categories page
        instead of a blank card. Use the arrows to choose the order categories appear in across the store, and
        Edit to rename a category — its products move with it.
      </p>

      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-sc-border bg-white px-4 py-3 text-sm" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-xs font-semibold text-sc-muted">Dismiss</button>
        </div>
      )}

      {draftOrder && (
        <div className="sticky top-4 z-10 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sc-accent bg-sc-accent-soft px-4 py-3">
          <span className="text-sm font-medium">You changed the category order.</span>
          <div className="flex items-center gap-2">
            {orderError && <span className="text-xs text-[#DC2626]">{orderError}</span>}
            <button
              onClick={() => { setDraftOrder(null); setOrderError(null); }}
              className="rounded-lg border border-sc-border bg-white px-3 py-1.5 text-xs font-semibold"
            >
              Discard
            </button>
            <button
              onClick={saveOrder}
              disabled={savingOrder}
              className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--sc-accent)" }}
            >
              {savingOrder ? "Saving…" : "Save order"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-sc-muted">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-sc-muted">No categories yet.</p>
      ) : (
        <div className="space-y-3">
          {ordered.map((c, i) => (
            <div key={c.id} className="bg-white border border-sc-border rounded-xl p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
              <div className="flex flex-col items-center gap-0.5">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || editing !== null}
                  aria-label={`Move ${c.name} up`}
                  className="rounded p-1 text-sc-muted hover:bg-[#F3F2EE] disabled:opacity-25"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                </button>
                <span className="text-[11px] font-semibold text-sc-faint">{i + 1}</span>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === ordered.length - 1 || editing !== null}
                  aria-label={`Move ${c.name} down`}
                  className="rounded p-1 text-sc-muted hover:bg-[#F3F2EE] disabled:opacity-25"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
              </div>
              <div
                className="w-20 h-20 rounded-lg bg-[#F3F2EE] bg-cover bg-center flex-shrink-0"
                style={c.image_url ? { backgroundImage: `url(${resolveImageUrl(c.image_url)})` } : undefined}
              />
              {editing === c.slug ? (
                <form
                  className="flex-1 min-w-0 space-y-2"
                  onSubmit={(e) => { e.preventDefault(); saveEdit(c); }}
                >
                  <label className="block text-xs font-semibold text-sc-muted">
                    Name
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={60}
                      autoFocus
                      autoComplete="off"
                      className="mt-1 w-full rounded-lg border border-sc-border px-3 py-2 text-sm font-normal text-sc-ink"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-sc-muted">
                    Tagline (optional)
                    <input
                      value={editTagline}
                      onChange={(e) => setEditTagline(e.target.value)}
                      maxLength={160}
                      autoComplete="off"
                      className="mt-1 w-full rounded-lg border border-sc-border px-3 py-2 text-sm font-normal text-sc-ink"
                    />
                  </label>
                  {editError && <p className="text-xs text-[#DC2626]">{editError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      style={{ background: "var(--sc-accent)" }}
                    >
                      {savingEdit ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditing(null); setEditError(null); }}
                      className="rounded-lg border border-sc-border bg-white px-3 py-1.5 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold break-words">{c.name}</div>
                  {c.tagline && <div className="text-xs text-sc-muted">{c.tagline}</div>}
                </div>
              )}
              <input
                ref={(el) => { fileInputRefs.current[c.slug] = el; }}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelected(c.slug, file);
                }}
              />
              {editing !== c.slug && (
                <button
                  onClick={() => startEdit(c)}
                  disabled={!!draftOrder}
                  title={draftOrder ? "Save or discard the new order first" : undefined}
                  className="text-xs font-semibold border border-sc-border rounded-lg px-4 py-2 disabled:opacity-50"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => fileInputRefs.current[c.slug]?.click()}
                disabled={uploadingSlug === c.slug}
                className="text-xs font-semibold border border-sc-border rounded-lg px-4 py-2 disabled:opacity-50"
              >
                {uploadingSlug === c.slug ? "Uploading..." : c.image_url ? "Change image" : "Add image"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}