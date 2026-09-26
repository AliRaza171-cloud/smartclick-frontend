"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { resolveImageUrl } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const ADVANCE_EVERY_MS = 3500;

interface BestSeller {
  id: string;
  title: string;
  image_urls: string[];
}

export default function BestSellersCarousel() {
  const [products, setProducts] = useState<BestSeller[]>([]);
  const [centerIndex, setCenterIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/products/best-sellers?limit=10`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProducts(data.filter((p: BestSeller) => p.image_urls?.[0])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (products.length < 2) return;
    const t = setInterval(() => setCenterIndex((i) => (i + 1) % products.length), ADVANCE_EVERY_MS);
    return () => clearInterval(t);
  }, [products.length]);

  if (products.length === 0) return null;

  const n = products.length;
  const possibleOffsets = n === 1 ? [0] : n === 2 ? [0, 1] : [-1, 0, 1];
  const visibleSlots = possibleOffsets.map((offset) => {
    const idx = ((centerIndex + offset) % n + n) % n;
    return { offset, product: products[idx] };
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "1400px" }}>
      {visibleSlots.map(({ offset, product }) => {
        const img = `${resolveImageUrl(product.image_urls[0])}`;
        const isCenter = offset === 0;

        return (
          <motion.div
            key={product.id}
            className="absolute"
            style={{ zIndex: isCenter ? 10 : 5 }}
            animate={{
              x: offset * 190,
              scale: isCenter ? 1 : 0.62,
              opacity: isCenter ? 1 : 0.6,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          >
            <motion.div
              animate={{ rotateY: [0, 360], y: [0, -12, 0] }}
              transition={{
                rotateY: { duration: 16, repeat: Infinity, ease: "linear", delay: offset * 1.3 },
                y: { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: offset * 0.4 },
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <img
                src={img}
                alt={product.title}
                className={isCenter ? "w-56 h-56 md:w-72 md:h-72 object-cover rounded-3xl shadow-[0_30px_50px_-15px_rgba(20,20,19,0.4)]" : "w-36 h-36 md:w-44 md:h-44 object-cover rounded-2xl shadow-[0_20px_35px_-12px_rgba(20,20,19,0.3)]"}
              />
            </motion.div>

            <motion.div
              animate={{ scaleX: [1, 0.85, 1], opacity: [0.3, 0.15, 0.3] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: offset * 0.4 }}
              className={isCenter ? "absolute left-1/2 -translate-x-1/2 -bottom-5 w-40 h-5 rounded-full bg-black/30 blur-md" : "absolute left-1/2 -translate-x-1/2 -bottom-3 w-24 h-3 rounded-full bg-black/25 blur-md"}
            />
          </motion.div>
        );
      })}
    </div>
  );
}