"use client";

import type { ImageItem } from "@/lib/images";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";

interface ImageCellProps {
  item: ImageItem;
  onRemove: (id: string) => void;
  index: number;
}

export function ImageCell({ item, onRemove, index }: ImageCellProps) {
  const [loaded, setLoaded] = useState(false);
  const [showRemove, setShowRemove] = useState(false);

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        opacity: { duration: 0.2, delay: index * 0.04 },
        y: { duration: 0.2, delay: index * 0.04 },
        layout: { duration: 0.2 },
      }}
      className="relative group"
      onMouseEnter={() => setShowRemove(true)}
      onMouseLeave={() => setShowRemove(false)}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
        {!loaded && (
          <div className="absolute inset-0 bg-muted animate-pulse rounded-xl" />
        )}
        <img
          src={item.preview}
          alt={item.name}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setLoaded(true)}
          style={{
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
          }}
        />
        {item.status === "converting" && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-xl backdrop-blur-[2px]">
            <svg
              className="h-6 w-6 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
            >
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
          </div>
        )}
        {item.status === "done" && (
          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-foreground flex items-center justify-center">
            <svg
              width={12}
              height={12}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--background)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="4 12 9 17 20 6" />
            </svg>
          </div>
        )}
        {item.status === "error" && (
          <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center rounded-xl">
            <span className="text-[12px] text-destructive px-2 text-center leading-tight">
              {item.error ?? "Failed"}
            </span>
          </div>
        )}
        <button
          onClick={handleRemove}
          className={cn(
            "absolute top-2 left-2 h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center",
            "transition-opacity duration-125 ease-out",
            showRemove ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
          aria-label="Remove image"
        >
          <svg
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <p className="mt-1.5 text-[12px] text-muted-foreground truncate px-0.5">
        {item.name}
      </p>
    </motion.div>
  );
}
