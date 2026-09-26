"use client";

import { useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface HeroImage {
  id: string;
  image_url: string;
  placement: string;
}

export default function PromoBanner() {
  const [image, setImage] = useState<HeroImage | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/hero-images`)
      .then((res) => (res.ok ? res.json() : []))
      .then((images: HeroImage[]) => {
        setImage(images.find((img) => img.placement === "strip") || null);
      })
      .catch(() => {});
  }, []);

  if (!image) return null;

  return (
    <div className="px-6 md:px-18 pb-6">
      <img
        src={resolveImageUrl(image.image_url)}
        alt=""
        className="w-full h-36 md:h-48 object-cover rounded-2xl"
      />
    </div>
  );
}