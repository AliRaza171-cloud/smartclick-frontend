"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
}

const COLORS = ["#0A130F", "#0F5C42", "#163326"];
const SPAWN_EVERY_MS = 45;
const MAX_SPARKLES = 40;

let nextId = 0;

export default function CursorGlow() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!hasHover) return;

    function handleMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastSpawnRef.current < SPAWN_EVERY_MS) return;
      lastSpawnRef.current = now;

      const sparkle: Sparkle = {
        id: nextId++,
        x: e.clientX + (Math.random() - 0.5) * 14,
        y: e.clientY + (Math.random() - 0.5) * 14,
        size: 5 + Math.random() * 6,
        rotation: Math.random() * 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };

      setSparkles((prev) => [...prev.slice(-MAX_SPARKLES + 1), sparkle]);
    }

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  function removeSparkle(id: number) {
    setSparkles((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            className="absolute"
            style={{
              left: s.x,
              top: s.y,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ opacity: 1, scale: 0.4, rotate: s.rotation }}
            animate={{ opacity: 0, scale: 1.4, y: -12, rotate: s.rotation + 40 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            onAnimationComplete={() => removeSparkle(s.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}