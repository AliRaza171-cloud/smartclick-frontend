"use client";

import { useEffect, useRef, useState } from "react";
import { resolveImageUrl } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ADVANCE_MS = 4000;

interface HeroImage {
  id: string;
  image_url: string;
  placement: string;
}

export default function HeroCarouselWeb() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/hero-images`)
      .then((res) => (res.ok ? res.json() : []))
      .then((all: HeroImage[]) => setImages(all.filter((img) => img.placement === "carousel")))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, ADVANCE_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [images.length]);

  function goTo(index: number) {
    setActiveIndex(((index % images.length) + images.length) % images.length);
  }

  if (images.length === 0) return null;

  return (
    <div className="px-6 md:px-18 pt-6 pb-6">
      <div className="relative w-full h-[220px] md:h-[320px] rounded-2xl overflow-hidden bg-sc-bg">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((image) => (
            <img
              key={image.id}
              src={resolveImageUrl(image.image_url)}
              alt=""
              className="w-full h-full object-cover flex-shrink-0"
            />
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}