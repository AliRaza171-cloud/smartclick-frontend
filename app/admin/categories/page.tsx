"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, getAccessToken } from "@/lib/api";
import { fetchCategories, CategoryMeta } from "@/lib/categories";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AdminCategoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function load() {
    setCategories(await fetchCategories());
    setLoading(false);
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
        Set a banner image for each category so it shows on the homepage category strip instead of a
        blank card.
      </p>

      {loading ? (
        <p className="text-sm text-sc-muted">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-sc-muted">No categories yet.</p>
      ) : (
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.id} className="bg-white border border-sc-border rounded-xl p-4 flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-lg bg-[#F3F2EE] bg-cover bg-center flex-shrink-0"
                style={c.image_url ? { backgroundImage: `url(${API_BASE}${c.image_url})` } : undefined}
              />
              <div className="flex-1">
                <div className="text-sm font-semibold">{c.name}</div>
                {c.tagline && <div className="text-xs text-sc-muted">{c.tagline}</div>}
              </div>
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