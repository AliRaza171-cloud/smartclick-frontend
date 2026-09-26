"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, extractErrorMessage } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await apiFetch("/auth/reset-password", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ token, new_password: password }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.push("/login");
    } else {
      const body = await res.json().catch(() => ({}));
      setError(extractErrorMessage(body, "That reset link is invalid or expired."));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="font-display font-bold text-2xl mb-8">
          Smart<span style={{ color: "var(--sc-accent)" }}>Click</span>
        </div>
        <h1 className="font-display text-3xl font-semibold mb-6">Set a new password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="password">New password</label>
            <input
              id="password" type="password" required autoComplete="new-password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2"
              style={{ borderColor: "var(--sc-border)" }}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit" disabled={submitting}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--sc-accent)" }}
          >
            {submitting ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}