"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, extractErrorMessage } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Campaign {
  id: string;
  message: string;
  is_active: boolean;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
}

export default function AdminCampaignsPage() {
  const { user, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await apiFetch("/campaigns");
    if (res.ok) setCampaigns(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    if (authLoading || user?.role !== "admin") return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setError(null);
    setSubmitting(true);
    const res = await apiFetch("/campaigns", {
      method: "POST",
      body: JSON.stringify({
        message,
        start_at: startAt || null,
        end_at: endAt || null,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(extractErrorMessage(body, "Couldn't create this campaign."));
      return;
    }
    setMessage("");
    setStartAt("");
    setEndAt("");
    load();
  }

  async function handleDeactivate(id: string) {
    await apiFetch(`/campaigns/${id}/deactivate`, { method: "PATCH" });
    load();
  }

  async function handleDelete(id: string) {
    await apiFetch(`/campaigns/${id}`, { method: "DELETE" });
    load();
  }

  if (authLoading) return null;
  if (!user || user.role !== "admin") {
    return <div className="p-10 text-sm text-sc-muted">Admin access required.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl font-semibold mb-2">Sale campaigns</h1>
      <p className="text-sm text-sc-muted mb-8">
        Promotional messages shown in the app's promo banner — sale events, announcements, anything not
        tied to a specific voucher code (which show automatically on their own).
      </p>

      <form onSubmit={handleCreate} className="bg-white border border-sc-border rounded-xl p-5 mb-8 space-y-4">
        <div>
          <label className="block text-sm mb-1">Message</label>
          <input
            required value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. 11.11 Mega Sale — don't miss out"
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Starts (optional)</label>
            <input
              type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Ends (optional)</label>
            <input
              type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none" style={{ borderColor: "var(--sc-border)" }}
            />
          </div>
        </div>
        <p className="text-xs text-sc-faint">Leave both blank to show immediately until you deactivate it.</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit" disabled={submitting}
          className="rounded-lg text-white text-sm font-semibold px-5 py-2.5 disabled:opacity-50"
          style={{ background: "var(--sc-accent)" }}
        >
          {submitting ? "Creating..." : "Create Campaign"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-sc-muted">Loading…</p>
      ) : campaigns.length === 0 ? (
        <p className="text-sm text-sc-muted">No campaigns yet.</p>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-white border border-sc-border rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-semibold flex items-center gap-2">
                  {c.message}
                  {!c.is_active && (
                    <span className="text-xs font-normal text-sc-faint border border-sc-border rounded-full px-2 py-0.5">
                      Inactive
                    </span>
                  )}
                </div>
                {(c.start_at || c.end_at) && (
                  <div className="text-xs text-sc-muted mt-1">
                    {c.start_at ? new Date(c.start_at).toLocaleString() : "Now"}
                    {" → "}
                    {c.end_at ? new Date(c.end_at).toLocaleString() : "No end date"}
                  </div>
                )}
              </div>
              {c.is_active && (
                <button
                  onClick={() => handleDeactivate(c.id)}
                  className="text-xs font-semibold border rounded-lg px-4 py-2"
                  style={{ borderColor: "#DC2626", color: "#DC2626" }}
                >
                  Deactivate
                </button>
              )}
              <button
                onClick={() => handleDelete(c.id)}
                className="text-xs font-semibold border border-sc-border rounded-lg px-4 py-2 text-sc-muted"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}