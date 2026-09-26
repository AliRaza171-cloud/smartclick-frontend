"use client";

import { useEffect, useRef, useState } from "react";
import { useGsap } from "@/lib/gsap";

const SESSION_KEY = "smartclick_intro_seen";

export default function IntroSplash() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const screenContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(SESSION_KEY);
    if (!alreadySeen) {
      setShow(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!show || !mounted) return;

    document.body.style.overflow = "hidden";
    const { gsap } = useGsap();

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setShow(false);
      },
    });

    tl.set(lidRef.current, { rotateX: -100 })
      .set(screenContentRef.current, { opacity: 0, scale: 0.85 })
      .to(lidRef.current, {
        rotateX: 0,
        duration: 1.1,
        ease: "power3.out",
      })
      .to(
        screenContentRef.current,
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" },
        "-=0.35"
      )
      .to({}, { duration: 0.7 })
      .to(overlayRef.current, { opacity: 0, duration: 0.6, ease: "power2.inOut" });

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, [show, mounted]);

  if (!mounted || !show) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      style={{ perspective: "1400px" }}
    >
      <div className="relative" style={{ width: 360, height: 260 }}>
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-b-md"
          style={{
            width: 380,
            height: 14,
            background: "linear-gradient(to bottom, #3a3a3a, #1c1c1c)",
          }}
        />
        <div
          ref={lidRef}
          className="absolute bottom-[14px] left-1/2 -translate-x-1/2 rounded-t-lg rounded-b-sm overflow-hidden"
          style={{
            width: 360,
            height: 240,
            background: "#0E1712",
            border: "1px solid #2A2A2A",
            transformOrigin: "bottom center",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            ref={screenContentRef}
            className="w-full h-full flex items-center justify-center"
          >
            <span className="font-display text-3xl font-semibold text-white">
              Smart<span style={{ color: "#22C08C" }}>Click</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}