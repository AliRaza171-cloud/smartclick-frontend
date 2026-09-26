"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

export default function StarRating({ value, onChange, size = 18 }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = !!onChange;
  const displayValue = hovered ?? value;

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(null)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          style={{ lineHeight: 0 }}
        >
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path
              d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z"
              fill={star <= displayValue ? "#F5B400" : "none"}
              stroke={star <= displayValue ? "#F5B400" : "#D9D6CC"}
              strokeWidth={1.5}
            />
          </svg>
        </button>
      ))}
    </div>
  );
}