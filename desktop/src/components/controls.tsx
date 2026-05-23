"use client";

import { FORMATS, type Format, type ImageItem } from "@/lib/images";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

interface ControlsProps {
  format: Format;
  onFormatChange: (f: Format) => void;
  quality: number;
  onQualityChange: (q: number) => void;
  onConvert: () => void;
  isConverting: boolean;
  images: ImageItem[];
}

export function Controls({
  format,
  onFormatChange,
  quality,
  onQualityChange,
  onConvert,
  isConverting,
  images,
}: ControlsProps) {
  const [selectOpen, setSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const pendingCount = images.filter((i) => i.status === "pending").length;

  useEffect(() => {
    if (!selectOpen) return;
    const handler = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = FORMATS.findIndex((f) => f.value === format);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (idx + 1) % FORMATS.length;
        onFormatChange(FORMATS[next].value);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (idx - 1 + FORMATS.length) % FORMATS.length;
        onFormatChange(FORMATS[prev].value);
      }
    },
    [format, onFormatChange],
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const getQualityFromX = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return quality;
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const raw = (x / rect.width) * 100;
      return Math.max(1, Math.min(100, Math.round(raw)));
    },
    [quality],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      dragging.current = true;
      onQualityChange(getQualityFromX(e.clientX));
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [getQualityFromX, onQualityChange],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      onQualityChange(getQualityFromX(e.clientX));
    },
    [getQualityFromX, onQualityChange],
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4 px-4 py-3">
        <div ref={selectRef} className="relative shrink-0">
          <button
            type="button"
            role="combobox"
            aria-expanded={selectOpen}
            onClick={() => setSelectOpen(!selectOpen)}
            onKeyDown={handleKeyDown}
            className={cn(
              "group inline-flex items-center justify-between gap-2 outline-none cursor-pointer",
              "text-[13px] h-8 px-3 min-w-[120px]",
              "border border-border bg-transparent text-foreground",
              "transition-all duration-80",
              "focus-visible:ring-1 focus-visible:ring-[#6B97FF]",
              "rounded-lg",
            )}
          >
            <span className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-muted-foreground text-[12px]">Format</span>
              <span className="font-medium">
                {FORMATS.find((f) => f.value === format)?.label}
              </span>
            </span>
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-muted-foreground"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <AnimatePresence>
            {selectOpen && (
              <motion.div
                ref={listRef}
                initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{
                  opacity: 0,
                  y: -4,
                  scaleY: 0.96,
                  transition: { duration: 0.1 },
                }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                style={{ transformOrigin: "top center" }}
                className="absolute bottom-full mb-1 left-0 min-w-full bg-background border border-border rounded-lg shadow-lg p-1 z-50"
              >
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    role="option"
                    aria-selected={f.value === format}
                    onClick={() => {
                      onFormatChange(f.value);
                      setSelectOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded-md transition-colors duration-80",
                      f.value === format
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-hover",
                    )}
                  >
                    <span className="flex-1 text-left">{f.label}</span>
                    {f.value === format && (
                      <svg
                        width={14}
                        height={14}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="4 12 9 17 20 6" />
                      </svg>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[200px]">
          <span className="text-[12px] text-muted-foreground shrink-0 tabular-nums">
            Q {quality}
          </span>
          <div
            ref={trackRef}
            className="relative flex-1 h-5 flex items-center cursor-pointer touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="w-full h-1 rounded-full bg-border relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-foreground/60 transition-[width] duration-75"
                style={{ width: `${quality}%` }}
              />
            </div>
            <div
              className="absolute h-3.5 w-3.5 rounded-full bg-foreground border-2 border-background transition-[left] duration-75"
              style={{
                left: `calc(${quality}% - 7px)`,
                top: "50%",
                marginTop: -7,
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onConvert}
          disabled={isConverting || pendingCount === 0}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 h-8 px-4 text-[13px] font-medium",
            "bg-foreground text-background rounded-lg",
            "transition-all duration-80",
            "hover:bg-foreground/90 active:bg-foreground/80 active:scale-[0.97]",
            "disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100",
            "focus-visible:ring-1 focus-visible:ring-[#6B97FF]",
          )}
        >
          {isConverting ? (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 12 12 C 14 8.5 19 8.5 19 12 C 19 15.5 14 15.5 12 12 C 10 8.5 5 8.5 5 12 C 5 15.5 10 15.5 12 12 Z"
                  stroke="currentColor"
                  strokeWidth="1.125"
                  strokeLinecap="round"
                  pathLength="100"
                  style={{
                    strokeDasharray: "15 85",
                    animation:
                      "spinner-move 2s linear infinite, spinner-dash 4s ease-in-out infinite",
                  }}
                />
              </svg>
              Converting
            </>
          ) : (
            <>
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              Convert{pendingCount > 0 ? ` (${pendingCount})` : " All"}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
