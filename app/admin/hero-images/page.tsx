"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, apiFetchMultipart, extractErrorMessage } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface HeroImage {
  id: string;
  image_url: string;
  placement: "carousel" | "strip";
  sort_order: number;
}

export default function AdminHeroImagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [removeBg, setRemoveBg] = useState(true);
  const [uploading, setUploading] = useState<"carousel" | "strip" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`${API_BASE}/hero-images`, { cache: "no-store" });
    if (res.ok) setImages(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    if (authLoading || user?.role !== "admin") return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  async function handleUpload(placement: "carousel" | "strip") {
    if (files.length === 0) return;
    setError(null);
    setUploading(placement);

    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    formData.append("remove_bg", String(removeBg));
    formData.append("placement", placement);

    const res = await apiFetchMultipart("/hero-images", formData);
    setUploading(null);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(extractErrorMessage(body, "Couldn't upload these images."));
      return;
    }
    setFiles([]);
    setPreviews([]);
    load();
  }

  async function handleDelete(id: string) {
    await apiFetch(`/hero-images/${id}`, { method: "DELETE" });
    load();
  }

  if (authLoading) return null;
  if (!user || user.role !== "admin") {
    return <div className="p-10 text-sm text-sc-muted">Admin access required.</div>;
  }

  const carouselImages = images.filter((i) => i.placement === "carousel");
  const stripImages = images.filter((i) => i.placement === "strip");

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold mb-2">Hero images</h1>
      <p className="text-sm text-sc-muted mb-8">
        The <strong>Carousel</strong> images cycle in the homepage's main swiping banner. The{" "}
        <strong>Strip banner</strong> is the single flatter promo image shown just below it — design each
        image with any text or discount baked right in.
      </p>

      <div className="bg-white border border-sc-border rounded-xl p-5 mb-8">
        <label className="block text-sm font-semibold mb-2">Select image(s) to upload</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFilesSelected}
          className="text-sm"
        />
        {previews.length > 0 && (
          <div className="flex gap-3 mt-4 flex-wrap">
            {previews.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-sc-border" />
            ))}
          </div>
        )}
        <label className="flex items-center gap-2 text-sm mt-3">
          <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} />
          Remove background automatically (transparent PNG)
        </label>
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <p className="text-xs text-sc-faint mt-4 mb-2">
          Choose where these selected image(s) should go:
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleUpload("carousel")}
            disabled={files.length === 0 || uploading !== null}
            className="rounded-lg text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50"
            style={{ background: "var(--sc-accent)" }}
          >
            {uploading === "carousel" ? "Uploading..." : "Add to Carousel"}
          </button>
          <button
            onClick={() => handleUpload("strip")}
            disabled={files.length === 0 || uploading !== null}
            className="rounded-lg border border-sc-border text-sm font-semibold px-5 py-2.5 disabled:opacity-50"
          >
            {uploading === "strip" ? "Uploading..." : "Add to Strip Banner"}
          </button>
        </div>
      </div>

      <h2 className="text-sm font-semibold mb-3">Carousel images ({carouselImages.length})</h2>
      {loading ? (
        <p className="text-sm text-sc-muted mb-8">Loading…</p>
      ) : carouselImages.length === 0 ? (
        <p className="text-sm text-sc-muted mb-8">None yet — upload some above.</p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-8">
          {carouselImages.map((img) => (
            <div key={img.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_BASE}${img.image_url}`}
                alt=""
                className="w-full aspect-square object-cover rounded-lg border border-sc-border bg-[#F3F2EE]"
              />
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-sm font-semibold mb-3">Strip banner ({stripImages.length})</h2>
      {loading ? (
        <p className="text-sm text-sc-muted">Loading…</p>
      ) : stripImages.length === 0 ? (
        <p className="text-sm text-sc-muted">None yet — upload one above.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stripImages.map((img) => (
            <div key={img.id} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${API_BASE}${img.image_url}`}
                alt=""
                className="w-full aspect-[3/1] object-cover rounded-lg border border-sc-border bg-[#F3F2EE]"
              />
              <button
                onClick={() => handleDelete(img.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}