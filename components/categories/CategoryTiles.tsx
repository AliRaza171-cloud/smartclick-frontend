"use client";

import { useState } from "react";
import Link from "next/link";
import { resolveImageUrl } from "@/lib/api";
import { CategoryMeta } from "@/lib/categories";

// Soft pastel tile + matching accent, cycled across categories (like the design).
const TONES = [
  { bg: "#EAF1FF", accent: "#3B6FE0" },
  { bg: "#FDECEC", accent: "#E0483B" },
  { bg: "#FCEBF1", accent: "#D6336C" },
  { bg: "#FBF0E6", accent: "#D9772B" },
  { bg: "#EAF6EC", accent: "#2F9E44" },
  { bg: "#E6F5FA", accent: "#1C8FB5" },
  { bg: "#EFEDFD", accent: "#6741D9" },
];

const INITIAL = 14; // two rows of 7 on desktop

export type CategoryWithCount = CategoryMeta & { count: number };

function CategoryTile({ c, index }: { c: CategoryWithCount; index: number }) {
  const tone = TONES[index % TONES.length];
  return (
    <Link
      href={`/category/${c.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sc-border bg-sc-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-32 overflow-hidden md:h-28 xl:h-32" style={{ background: tone.bg }}>
        {c.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveImageUrl(c.image_url)}
            alt={c.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-4xl font-bold" style={{ color: tone.accent }}>
              {c.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2 px-3 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold" title={c.name}>{c.name}</div>
          <div className="text-xs text-sc-faint">
            ({c.count} product{c.count === 1 ? "" : "s"})
          </div>
        </div>
        <span
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5"
          style={{ background: tone.bg, color: tone.accent }}
          aria-hidden
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default function CategoryTiles({ items }: { items: CategoryWithCount[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, INITIAL);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
        {visible.map((c, i) => (
          <CategoryTile key={c.id} c={c} index={i} />
        ))}
      </div>

      {items.length > INITIAL && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--sc-accent)" }}
          >
            {showAll ? "Show Fewer" : `View All Categories (${items.length})`}
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: showAll ? "rotate(-90deg)" : undefined }}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
