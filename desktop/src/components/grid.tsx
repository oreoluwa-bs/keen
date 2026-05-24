"use client";

import type { ImageItem } from "@/lib/images";
import { AnimatePresence } from "framer-motion";
import { ImageCell } from "./image-cell";

interface GridProps {
  images: ImageItem[];
  onRemove: (id: string) => void;
  onRetry?: (id: string) => void;
  onPreview?: (index: number) => void;
}

export function Grid({ images, onRemove, onRetry, onPreview }: GridProps) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-border">
      <AnimatePresence mode="popLayout">
        {images.map((item, i) => (
          <ImageCell
            key={item.id}
            item={item}
            onRemove={onRemove}
            onRetry={onRetry}
            onPreview={onPreview ? () => onPreview(i) : undefined}
            index={i}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
