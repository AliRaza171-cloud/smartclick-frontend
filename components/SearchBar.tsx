"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NAV_MUTED = "#9DB3A6";

export default function SearchBar({ className = "flex-1 max-w-sm mx-8" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative w-full">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2"
          width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={NAV_MUTED} strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-full pl-11 pr-4 py-2.5 text-sm outline-none bg-white/10 text-white placeholder:text-white/40 border border-white/10 focus:border-[#22C08C] transition-colors"
        />
      </div>
    </form>
  );
}