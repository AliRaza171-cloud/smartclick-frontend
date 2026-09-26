"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, extractErrorMessage } from "@/lib/api";
import StarRating from "./StarRating";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
}

interface Summary {
  average_rating: number | null;
  review_count: number;
}

interface Eligibility {
  can_review: boolean;
  reason: string | null;
  order_id: string | null;
}

export function ReviewSummaryBadge({ productId }: { productId: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/products/${productId}/reviews/summary`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setSummary)
      .catch(() => {});
  }, [productId]);

  if (!summary || summary.review_count === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <StarRating value={Math.round(summary.average_rating || 0)} size={15} />
      <span className="text-sc-muted">
        {summary.average_rating} ({summary.review_count} review{summary.review_count === 1 ? "" : "s"})
      </span>
    </div>
  );
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`);
    if (res.ok) setReviews(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!user) return;
    apiFetch(`/products/${productId}/reviews/eligibility`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setEligibility);
  }, [user, productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eligibility?.order_id || rating === 0) return;

    setError(null);
    setSubmitting(true);
    const res = await apiFetch(`/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ order_id: eligibility.order_id, rating, comment: comment || null }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(extractErrorMessage(body, "Couldn't submit your review."));
      return;
    }
    setEligibility({ can_review: false, reason: "already_reviewed", order_id: null });
    setRating(0);
    setComment("");
    load();
  }

  return (
        <div>

      {eligibility?.can_review && (
        <form onSubmit={handleSubmit} className="bg-white border border-sc-border rounded-xl p-5 mb-8">
          <p className="text-sm font-semibold mb-3">Leave a review</p>
          <div className="mb-3">
            <StarRating value={rating} onChange={setRating} size={24} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional — share your experience with this product"
            rows={3}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
            style={{ borderColor: "var(--sc-border)" }}
          />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          <button
            type="submit"
            disabled={rating === 0 || submitting}
            className="mt-3 rounded-lg text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50"
            style={{ background: "var(--sc-accent)" }}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-sc-muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-sc-muted">No reviews yet.</p>
      ) : (
        <div className="space-y-5">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-sc-border pb-5 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <StarRating value={r.rating} size={14} />
                <span className="text-sm font-semibold">{r.reviewer_name}</span>
              </div>
              {r.comment && <p className="text-sm text-sc-muted mb-1">{r.comment}</p>}
              <p className="text-xs text-sc-faint">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}