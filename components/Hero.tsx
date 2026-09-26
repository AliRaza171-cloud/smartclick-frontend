"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useGsap } from "@/lib/gsap";

export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const { gsap, ScrollTrigger } = useGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-byline", { opacity: 0, y: -12, duration: 0.5 })
        .from(".hero-word", { opacity: 0, y: 40, duration: 0.6, stagger: 0.15 }, "-=0.2")
        .from(".hero-social", { opacity: 0, y: 16, duration: 0.5 }, "-=0.2");

      gsap.to(".hero-word-shop", {
        x: 120,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.to(".hero-word-smarter", {
        x: -120,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, rootRef);

    const video = videoRef.current;
    function handleVideoReady() {
      ScrollTrigger.refresh();
    }
    video?.addEventListener("loadedmetadata", handleVideoReady);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      video?.removeEventListener("loadedmetadata", handleVideoReady);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/hero-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-[#8A8A82]/35" />

      <div className="relative z-10 px-6 md:px-18 pt-16">
        <div className="flex justify-between items-start">
          <Link href="/about" className="hero-byline max-w-[260px] group">
            <div className="text-xs text-sc-faint mb-1 group-hover:text-sc-accent transition-colors">
              AI Shopping Curator
            </div>
            <div className="font-display text-xl font-semibold leading-snug group-hover:text-sc-accent transition-colors">
              Every listing matched, priced and vouchered by AI
            </div>
          </Link>
          <Link
            href="/about"
            className="hero-byline text-xs text-sc-accent bg-sc-accent-soft px-3.5 py-1.5 rounded-full hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            {"{ AI Verified }"}
          </Link>
        </div>

        <div className="flex justify-between items-end mt-6 md:mt-10 relative z-10">
          <div className="hero-word hero-word-shop font-display font-bold text-6xl md:text-8xl leading-[0.85] tracking-tight">SHOP</div>
          <div className="hero-word hero-word-smarter font-display font-bold text-6xl md:text-8xl leading-[0.85] tracking-tight">SMARTER</div>
        </div>

        <div className="hero-social flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-10 pb-16 border-t border-sc-border mt-8">
          <Link href="/about" className="flex items-center gap-5 pt-8 group">
            <div className="flex">
              <div className="w-10 h-10 rounded-full bg-[#D9C7A3] border-2 border-sc-bg -mr-3 group-hover:scale-105 transition-transform" />
              <div className="w-10 h-10 rounded-full bg-[#B7C9D9] border-2 border-sc-bg -mr-3 group-hover:scale-105 transition-transform delay-[30ms]" />
              <div className="w-10 h-10 rounded-full bg-[#C7D9C2] border-2 border-sc-bg group-hover:scale-105 transition-transform delay-[60ms]" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold flex items-center gap-2 group-hover:text-sc-accent transition-colors">
                3,000+
                <span className="text-sm font-semibold text-sc-accent">★ 4.9</span>
              </div>
              <div className="text-sm text-sc-muted max-w-[240px]">
                Orders completed on Daraz, rated 4.9 stars by shoppers.
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-6 pt-8">
            <Link href="/about" className="text-sm text-sc-accent hover:underline underline-offset-4">
              ✓&nbsp; AI-verified listings
            </Link>
            <Link
              href="/categories"
              className="group bg-sc-accent text-white rounded-lg px-8 py-4 text-sm font-semibold tracking-wide inline-flex items-center gap-2 hover:shadow-[0_12px_24px_-8px_rgba(15,138,110,0.5)] hover:-translate-y-0.5 transition-all"
            >
              START SHOPPING
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}