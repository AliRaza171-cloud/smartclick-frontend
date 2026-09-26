"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, apiFetchMultipart, extractErrorMessage } from "@/lib/api";
import { fetchCategories, CategoryMeta } from "@/lib/categories";

const NEW_CATEGORY_VALUE = "__new__";

interface Draft {
  category: string;
  title: string;
  description: string;
  tags: string[];
  confidence: number;
  needs_review: boolean;
}

export default function NewProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [aiGenerated, setAiGenerated] = useState(false);

  // Publishable fields — pre-filled from the AI draft once analysis
  // returns, but always editable, and equally usable if the admin skips
  // analysis (e.g. the AI service is down) and fills these in by hand.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryList, setCategoryList] = useState<CategoryMeta[]>([]);
  const [category, setCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryTagline, setNewCategoryTagline] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then((list) => {
      setCategoryList(list);
      if (list.length > 0) setCategory(list[0].name);
    });
  }, []);

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    setCategoryError(null);

    const res = await apiFetch("/categories", {
      method: "POST",
      body: JSON.stringify({ name: newCategoryName.trim(), tagline: newCategoryTagline.trim() || undefined }),
    });
    setCreatingCategory(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setCategoryError(extractErrorMessage(body, "Couldn't create that category."));
      return;
    }

    const created = await res.json();
    setCategoryList((prev) => [...prev, created]);
    setCategory(created.name);
    setNewCategoryName("");
    setNewCategoryTagline("");
  }
  const [price, setPrice] = useState("");
  const [discountPct, setDiscountPct] = useState("");
  const [freeShipping, setFreeShipping] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [tags, setTags] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  function handleImagesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
    setDraft(null);
    setAnalyzeError(null);
  }

  async function handleAnalyze() {
    if (images.length === 0) return;
    setAnalyzing(true);
    setAnalyzeError(null);

    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));

    const res = await apiFetchMultipart("/products/analyze", formData);
    setAnalyzing(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      // AI being unavailable is not a dead end — the form below still works
      // for a fully manual listing.
      setAnalyzeError(extractErrorMessage(body, "The AI assistant couldn't analyze these images."));
      return;
    }

    const result: Draft = await res.json();
    setDraft(result);
    setAiGenerated(true);
    setTitle(result.title);
    setDescription(result.description);
    setCategory(result.category);
    setTags(result.tags.join(", "));
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setPublishError(null);

    if (images.length === 0) {
      setPublishError("At least one image is required.");
      return;
    }
    if (!category) {
      setPublishError("Choose or create a category first.");
      return;
    }

    setPublishing(true);
    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));
    if (video) formData.append("video", video);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    if (discountPct) formData.append("discount_pct", discountPct);
    formData.append("free_shipping", String(freeShipping));
    if (voucherCode) formData.append("voucher_code", voucherCode);
    formData.append(
      "tags",
      JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean))
    );
    formData.append("ai_generated", String(aiGenerated));
    formData.append("ai_flagged_needs_review", String(draft?.needs_review || false));

    const res = await apiFetchMultipart("/products", formData);
    setPublishing(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setPublishError(extractErrorMessage(body, "Something went wrong publishing this listing."));
      return;
    }

    const product = await res.json();
    router.push(`/product/${product.id}`);
  }

  if (authLoading) return null;

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-sm text-sc-muted">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl font-semibold mb-2">Add a product</h1>
      <p className="text-sm text-sc-muted mb-10">
        Upload photos, let the AI draft a listing, then review before publishing.
      </p>

      {/* Step 1: images */}
      <div className="mb-8">
        <label className="block text-sm font-semibold mb-2">Product photos</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleImagesSelected}
          className="text-sm"
        />
        {previews.length > 0 && (
          <div className="flex gap-3 mt-4 flex-wrap">
            {previews.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="w-24 h-24 object-cover rounded-lg border border-sc-border" />
            ))}
          </div>
        )}

        <div className="mt-5">
          <label className="block text-sm mb-1">Product video (optional)</label>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
          />
          {video && <p className="text-xs text-sc-muted mt-1">{video.name}</p>}
        </div>
      </div>

      {/* Step 2: AI analyze */}
      <div className="mb-10">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={images.length === 0 || analyzing}
          className="rounded-lg border border-sc-border px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {analyzing ? "Analyzing..." : "Analyze with AI"}
        </button>
        {analyzeError && (
          <p className="text-sm text-amber-700 mt-3">
            {analyzeError} You can still fill in the listing manually below.
          </p>
        )}
        {draft?.needs_review && (
          <p className="text-sm text-amber-700 mt-3">
            The AI flagged this as needing a closer look (confidence: {Math.round(draft.confidence * 100)}%) —
            double-check the details below before publishing.
          </p>
        )}
      </div>

      {/* Step 3: editable listing form */}
      <form onSubmit={handlePublish} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            required value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            value={category || NEW_CATEGORY_VALUE}
            onChange={(e) => setCategory(e.target.value === NEW_CATEGORY_VALUE ? "" : e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
          >
            {categoryList.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
            <option value={NEW_CATEGORY_VALUE}>+ Add new category</option>
          </select>

          {(category === "" || categoryList.length === 0) && (
            <div className="mt-3 p-4 rounded-lg border border-sc-border bg-white space-y-3">
              <div>
                <label className="block text-xs mb-1">New category name</label>
                <input
                  value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Tagline (optional)</label>
                <input
                  value={newCategoryTagline} onChange={(e) => setNewCategoryTagline(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
                />
              </div>
              {categoryError && <p className="text-xs text-red-600">{categoryError}</p>}
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCategory || !newCategoryName.trim()}
                className="text-sm font-semibold rounded-lg border border-sc-border px-4 py-2 disabled:opacity-50"
              >
                {creatingCategory ? "Creating..." : "Create category"}
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1">Tags (comma-separated)</label>
          <input
            value={tags} onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Price (Rs.)</label>
            <input
              required type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Discount % (optional)</label>
            <input
              type="number" min="0" max="100" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Voucher code (optional)</label>
          <input
            value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            placeholder="Must already exist — create vouchers separately"
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={freeShipping} onChange={(e) => setFreeShipping(e.target.checked)} />
          Free shipping
        </label>

        {publishError && <p className="text-sm text-red-600">{publishError}</p>}

        <button
          type="submit" disabled={publishing}
          className="w-full rounded-lg py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--sc-accent)" }}
        >
          {publishing ? "Publishing..." : "Publish Listing"}
        </button>
      </form>
    </div>
  );
}
