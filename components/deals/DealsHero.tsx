"use client";

import { useEffect, useState } from "react";
import { Product } from "@/lib/products";
import { parseApiUtc } from "@/lib/deals";
import { ArrowIcon, CashIcon, FlameIcon, ShieldIcon, TagIcon, TimerIcon, TruckIcon } from "./icons";

function endOfToday() {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

function useCountdown(target: number) {
  // null until mounted so server and client HTML match (no hydration warning)
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const total = Math.floor((left ?? 0) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    ready: left !== null,
    parts: [
      [pad(Math.floor(total / 3600)), "Hours"],
      [pad(Math.floor((total % 3600) / 60)), "Min"],
      [pad(total % 60), "Sec"],
    ] as const,
  };
}

export default function DealsHero({
  maxDiscount,
  showcase,
  campaignMessage,
  campaignEndsAt,
}: {
  maxDiscount: number;
  showcase: Product[]; // top-discount products with images, rotated on the right
  campaignMessage?: string;
  campaignEndsAt?: string | null;
}) {
  // Counts down to the active campaign's end_at if the backend provides it,
  // otherwise to midnight (a daily flash sale).
  const [target] = useState(() => {
    const t = parseApiUtc(campaignEndsAt)?.getTime();
    return t !== undefined && t > Date.now() ? t : endOfToday();
  });
  const { ready, parts } = useCountdown(target);

  const slides = showcase.filter((p) => p.imageUrl).slice(0, 3);
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setSlide((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section>
      <div
        className="relative grid overflow-hidden rounded-3xl text-white shadow-lg md:grid-cols-[1.35fr_1fr_1fr]"
        style={{ background: "linear-gradient(110deg, #E4381F 0%, #F2582A 45%, #D92B2B 100%)" }}
      >
        {/* Headline */}
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-3">
            <FlameIcon size={64} color="#FDE047" fill="#FACC15" className="flex-shrink-0 drop-shadow" />
            <div className="font-display leading-[0.95]">
              <div className="text-2xl font-bold tracking-tight md:text-3xl">TODAY&apos;S BEST</div>
              <div className="text-5xl font-bold tracking-tight text-[#FDE047] md:text-6xl">DEALS</div>
            </div>
          </div>
          <p className="mt-4 text-base font-medium md:text-lg">
            {campaignMessage || "Save more. Shop smarter. Don't miss out!"}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-white/95">
            {maxDiscount > 0 && (
              <span className="flex items-center gap-1.5"><TagIcon size={15} /> Up to {maxDiscount}% OFF</span>
            )}
            <span className="flex items-center gap-1.5"><TruckIcon size={15} /> Free Shipping</span>
            <span className="flex items-center gap-1.5"><CashIcon size={15} /> Cash on Delivery</span>
            <span className="flex items-center gap-1.5"><ShieldIcon size={15} /> Secure Payment</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex flex-col justify-center bg-black/15 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <TimerIcon size={34} color="#FDE047" />
            <div>
              <div className="font-display text-xl font-bold">FLASH SALE</div>
              <div className="text-xs text-white/80">Ends in</div>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-1.5" aria-live="off">
            {parts.map(([value, label], i) => (
              <div key={label} className="flex items-start gap-1.5">
                {i > 0 && <span className="pt-2 text-2xl font-bold">:</span>}
                <div className="text-center">
                  <div className="min-w-[3.4rem] rounded-lg bg-[#141413] px-2 py-2 font-display text-3xl font-bold tabular-nums">
                    {ready ? value : "--"}
                  </div>
                  <div className="mt-1 text-[11px] text-white/80">{label}</div>
                </div>
              </div>
            ))}
          </div>
          <a
            href="#flash-deals"
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#FACC15] px-5 py-2 text-sm font-bold text-[#141413] transition-transform hover:-translate-y-0.5"
          >
            View All Deals <ArrowIcon />
          </a>
        </div>

        {/* Product showcase */}
        <div className="relative hidden min-h-[240px] md:block">
          {slides.length > 0 ? (
            slides.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.imageUrl}
                alt={p.name}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                  i === slide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#F2582A] to-[#B91C1C]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#E4381F]/70 via-transparent to-transparent" />
          {maxDiscount > 0 && (
            <div className="absolute right-5 top-5 rotate-12 rounded-2xl bg-[#FACC15] px-3.5 py-2 text-center font-display font-bold leading-tight text-[#DC2626] shadow-lg">
              <div className="text-xs">UP TO</div>
              <div className="text-3xl">{maxDiscount}%</div>
              <div className="text-xs">OFF</div>
            </div>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {slides.map((p, i) => (
            <button
              key={p.id}
              aria-label={`Show ${p.name}`}
              onClick={() => setSlide(i)}
              className="h-2 rounded-full transition-all"
              style={{ width: i === slide ? 20 : 8, background: i === slide ? "var(--sc-accent)" : "var(--sc-border)" }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
