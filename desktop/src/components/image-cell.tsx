"use client";

import { Button } from "@/components/ui/button";
import type { ImageItem } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import { useCallback, useState } from "react";

interface ImageCellProps {
  item: ImageItem;
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  onPreview?: () => void;
  index: number;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageCell({ item, onRemove, onRetry, onPreview, index }: ImageCellProps) {
  const [loaded, setLoaded] = useState(false);

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
    >
      <div
        className="relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer"
        onClick={onPreview}
      >
        {!loaded && (
          <div className="absolute inset-0 bg-muted animate-pulse rounded-xl" />
        )}
        <img
          src={item.preview}
          alt={item.name}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-200",
            "outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10",
            loaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setLoaded(true)}
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
          <>
            <div className="absolute inset-0 rounded-xl bg-foreground/[0.03]" />
            <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-foreground flex items-center justify-center">
              <HugeiconsIcon
                icon={Tick02Icon}
                size={12}
                color="var(--background)"
              />
            </div>
          </>
        )}
        {item.status === "error" && (
          <div className="absolute inset-0 bg-destructive/10 flex flex-col items-center justify-center gap-1.5 rounded-xl p-2">
            <span className="text-[11px] text-destructive text-center leading-tight line-clamp-2">
              {item.error ?? "Failed"}
            </span>
            {onRetry && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry(item.id);
                }}
                className="text-[11px] text-destructive font-medium underline underline-offset-2 hover:opacity-80 transition-opacity duration-80"
              >
                Retry
              </button>
            )}
          </div>
        )}
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handleRemove}
          aria-label="Remove image"
          className={cn(
            "absolute top-2 left-2",
            "transition-opacity duration-125 ease-out active:scale-[0.96]",
            "opacity-0 group-hover:opacity-100",
          )}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={12} />
        </Button>
      </div>
      <div className="mt-1.5 px-0.5 flex flex-col gap-0.5">
        <p className="text-[12px] text-muted-foreground truncate">
          {item.name}
        </p>
        <span className="text-[11px] text-muted-foreground/60 tabular-nums">
          {formatSize(item.size)}
        </span>
      </div>
    </motion.div>
  );
}
