"use client";

import { useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { ImageItem } from "@/lib/images";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface ImagePreviewProps {
  images: ImageItem[];
  selectedIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImagePreview({
  images,
  selectedIndex,
  onClose,
  onNavigate,
}: ImagePreviewProps) {
  const isOpen = selectedIndex >= 0 && selectedIndex < images.length;
  const image = isOpen ? images[selectedIndex] : null;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < images.length - 1;

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(selectedIndex + 1);
  }, [hasNext, selectedIndex, onNavigate]);

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(selectedIndex - 1);
  }, [hasPrev, selectedIndex, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        onNavigate(selectedIndex - 1);
      }
      if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        onNavigate(selectedIndex + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, hasPrev, hasNext, selectedIndex, onNavigate]);

  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-background/95 backdrop-blur-2xl border-border/50 sm:max-w-[95vw]"
        showCloseButton={false}
      >
        <div className="relative flex flex-col w-full h-full max-h-[95vh]">
          <div className="relative flex-1 flex items-center justify-center p-4 min-h-0">
            <img
              src={image.preview}
              alt={image.name}
              className="max-w-full max-h-full object-contain rounded-lg select-none pointer-events-none"
              draggable={false}
            />

            {hasPrev && (
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-10 rounded-full bg-background/60 hover:bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 outline-none focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-[#6B97FF]"
                aria-label="Previous image"
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            {hasNext && (
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-10 rounded-full bg-background/60 hover:bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 outline-none focus-visible:opacity-100 focus-visible:ring-1 focus-visible:ring-[#6B97FF]"
                aria-label="Next image"
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[13px] text-foreground truncate">
                {image.name}
              </span>
              <span className="text-[12px] text-muted-foreground tabular-nums shrink-0">
                {formatSize(image.size)}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[12px] text-muted-foreground tabular-nums">
                {selectedIndex + 1} of {images.length}
              </span>
              <div className="w-px h-4 bg-border/50 mx-1" />
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-hover transition-colors duration-80 outline-none focus-visible:ring-1 focus-visible:ring-[#6B97FF]"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
