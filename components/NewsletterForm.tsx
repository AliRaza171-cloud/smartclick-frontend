"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="text-sm" style={{ color: "#22C08C" }}>Thanks — you're subscribed.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 rounded-full px-5 py-3 text-sm outline-none bg-white text-[#141413] placeholder:text-[#8A8678]"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full px-7 py-3 text-sm font-semibold text-white disabled:opacity-60 transition-transform hover:-translate-y-0.5 whitespace-nowrap"
        style={{ background: "#22C08C", color: "#0E1712" }}
      >
        {status === "submitting" ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" && (
        <p className="text-xs sm:hidden" style={{ color: "#F3A6A6" }}>Something went wrong — try again.</p>
      )}
    </form>
  );
}