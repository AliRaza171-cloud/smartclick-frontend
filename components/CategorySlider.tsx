"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useGsap } from "@/lib/gsap";
import { CategoryMeta } from "@/lib/categories";
import { resolveImageUrl } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CategorySlider({ items }: { items: CategoryMeta[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const shouldLoop = items.length >= 6;
  const looped = shouldLoop ? [...items, ...items] : items;

  useEffect(() => {
    if (!shouldLoop) return;
    const { gsap } = useGsap();
    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(trackRef.current, {
        xPercent: -50,
        ease: "none",
        duration: items.length * 4,
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, [items.length, shouldLoop]);

  if (items.length === 0) return null;

  return (
    <div className="px-6 md:px-18 pt-14 pb-16">
      <div
        className="overflow-hidden"
        onMouseEnter={() => tweenRef.current?.pause()}
        onMouseLeave={() => tweenRef.current?.resume()}
      >
        <div ref={trackRef} className="flex gap-5 w-max">
          {looped.map((c, i) => (
            <Link
              key={`${c.slug}-${i}`}
              href={`/category/${c.slug}`}
              className="relative h-40 w-56 flex-shrink-0 rounded-2xl overflow-hidden border border-sc-border flex items-end p-5 font-semibold text-sm"
              style={{
                backgroundColor: "white",
                backgroundImage: c.image_url ? `url(${resolveImageUrl(c.image_url)})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {c.image_url && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              )}
              <span className={c.image_url ? "relative text-white" : ""}>{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}