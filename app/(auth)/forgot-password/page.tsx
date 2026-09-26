"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    // Backend always returns 204 regardless of whether the email exists —
    // the UI mirrors that by always showing the same confirmation message.
    await apiFetch("/auth/forgot-password", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email }),
    });
    setSubmitting(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="font-display font-bold text-2xl mb-8">
          Smart<span style={{ color: "var(--sc-accent)" }}>Click</span>
        </div>
        <h1 className="font-display text-3xl font-semibold mb-2">Reset your password</h1>

        {sent ? (
          <p className="text-sm mt-4" style={{ color: "var(--sc-muted)" }}>
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-sm mb-1" htmlFor="email">Email</label>
              <input
                id="email" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2"
                style={{ borderColor: "var(--sc-border)" }}
              />
            </div>
            <button
              type="submit" disabled={submitting}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--sc-accent)" }}
            >
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
