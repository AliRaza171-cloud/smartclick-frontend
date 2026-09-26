"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await register(email, password, fullName);
    setSubmitting(false);
    if (result.ok) {
      router.push("/");
    } else {
      setError(result.error || "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: "linear-gradient(160deg, #0E1712 0%, #060A08 100%)" }}
      >
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "#22C08C", opacity: 0.18 }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "#22C08C", opacity: 0.12 }}
        />
        <div className="relative z-10 text-center px-12">
          <div className="font-display font-bold text-4xl mb-4" style={{ color: "#F3F2EE" }}>
            Smart<span style={{ color: "#22C08C" }}>Click</span>
          </div>
          <p className="text-sm max-w-xs mx-auto" style={{ color: "#9DB3A6" }}>
            AI-curated listings, sorted your way — create an account to start shopping smarter.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-sm">
          <div className="font-display font-bold text-2xl mb-8 lg:hidden">
            Smart<span style={{ color: "var(--sc-accent)" }}>Click</span>
          </div>
          <h1 className="font-display text-3xl font-semibold mb-2">Create your account</h1>
          <p className="text-sm mb-8" style={{ color: "var(--sc-muted)" }}>
            AI-curated listings, sorted your way.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8678" strokeWidth={2}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="name" required value={fullName} placeholder="Full name"
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-full border pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-2"
                style={{ borderColor: "var(--sc-border)", background: "#F8F7F4" }}
              />
            </div>
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8678" strokeWidth={2}
              >
                <path d="M2 6h20v12H2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
              <input
                id="email" type="email" required autoComplete="email" value={email} placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-2"
                style={{ borderColor: "var(--sc-border)", background: "#F8F7F4" }}
              />
            </div>
            <div>
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A8678" strokeWidth={2}
                >
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                <input
                  id="password" type="password" required autoComplete="new-password" value={password} placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-full border pl-11 pr-4 py-3.5 text-sm outline-none focus:ring-2"
                  style={{ borderColor: "var(--sc-border)", background: "#F8F7F4" }}
                />
              </div>
              <p className="text-xs mt-1.5 ml-1" style={{ color: "var(--sc-faint)" }}>
                At least 10 characters, with an uppercase letter, a lowercase letter, and a number.
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full py-3.5 text-sm font-semibold text-white disabled:opacity-60 transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--sc-accent)" }}
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-5 text-sm">
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--sc-accent)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}