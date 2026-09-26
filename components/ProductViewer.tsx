"use client";

import { useRef, useState } from "react";

export default function ProductViewer({ images, videoUrl }: { images: string[]; videoUrl?: string | null }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<{ transformOrigin: string; transform: string } | null>(null);
  const dragState = useRef<{ startX: number; startIndex: number } | null>(null);
  const wasDraggingRef = useRef(false);

  if (images.length === 0 && !videoUrl) {
    return (
      <div className="h-[420px] md:h-[520px] rounded-2xl bg-[#EDEBE4] flex items-center justify-center text-xs text-sc-faint">
        No photos uploaded
      </div>
    );
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (showVideo) return;
    dragState.current = { startX: e.clientX, startIndex: activeIndex };
    wasDraggingRef.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragState.current && images.length > 1) {
      const deltaX = e.clientX - dragState.current.startX;
      if (Math.abs(deltaX) > 4) wasDraggingRef.current = true;
      const framesMoved = Math.trunc(deltaX / 40);
      const next = ((dragState.current.startIndex - framesMoved) % images.length + images.length) % images.length;
      setActiveIndex(next);
      return;
    }

    if (showVideo) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${xPct}% ${yPct}%`, transform: "scale(2)" });
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  function handleMouseLeave() {
    dragState.current = null;
    setZoomStyle(null);
  }

  function handleThumbnailClick(i: number) {
    setShowVideo(false);
    setActiveIndex(i);
  }

  return (
    <div>
      <div
        className="relative h-[420px] md:h-[520px] rounded-2xl bg-[#EDEBE4] overflow-hidden select-none touch-pan-y"
        style={{ cursor: showVideo ? "default" : images.length > 1 ? "grab" : "zoom-in" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseLeave={handleMouseLeave}
      >
        {showVideo && videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeIndex]}
              alt=""
              draggable={false}
              className="w-full h-full object-cover pointer-events-none transition-transform duration-150 ease-out"
              style={zoomStyle || undefined}
            />
            {images.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-4 py-2 text-xs text-white flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2}>
                  <path d="M21 12a9 9 0 1 1-3-6.7" />
                </svg>
                Drag to rotate · Hover to zoom
              </div>
            )}
          </>
        )}
      </div>

      {(images.length > 1 || videoUrl) && (
        <div className="flex gap-3 mt-4">
          {videoUrl && (
            <button
              onClick={() => setShowVideo(true)}
              className="relative w-20 h-20 rounded-lg overflow-hidden border-2 bg-[#141413] flex items-center justify-center flex-shrink-0"
              style={{ borderColor: showVideo ? "var(--sc-accent)" : "var(--sc-border)" }}
              aria-label="Play product video"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => handleThumbnailClick(i)}
              className="w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0"
              style={{ borderColor: !showVideo && i === activeIndex ? "var(--sc-accent)" : "var(--sc-border)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}