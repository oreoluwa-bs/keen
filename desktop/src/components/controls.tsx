"use client";

import { Button } from "@/components/ui/button";
import { SliderComfortable } from "@/components/ui/slider";
import { FORMATS, type Format, type ImageItem } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Folder01Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

interface ControlsProps {
  format: Format;
  onFormatChange: (f: Format) => void;
  quality: number;
  onQualityChange: (q: number) => void;
  outputFolder: string | null;
  onPickFolder: () => void;
  onConvert: () => void;
  isConverting: boolean;
  images: ImageItem[];
}

export function Controls({
  format,
  onFormatChange,
  quality,
  onQualityChange,
  outputFolder,
  onPickFolder,
  onConvert,
  isConverting,
  images,
}: ControlsProps) {
  const [selectOpen, setSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const pendingCount = images.filter((i) => i.status === "pending").length;

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
          <SliderComfortable
            value={quality}
            onChange={onQualityChange}
            min={1}
            max={100}
            step={1}
            variant="scrubber"
            formatValue={(v) => `Q ${v}`}
          />
        </div>

        <button
          type="button"
          onClick={onPickFolder}
          className={cn(
            "group inline-flex items-center gap-2 outline-none cursor-pointer",
            "text-[13px] h-8 px-3",
            "border border-border bg-transparent",
            "transition-all duration-80 rounded-lg",
            "focus-visible:ring-1 focus-visible:ring-[#6B97FF]",
            outputFolder ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <HugeiconsIcon icon={Folder01Icon} size={16} className="shrink-0" />
          <span className="max-w-[180px] truncate">
            {outputFolder ?? "Output folder"}
          </span>
        </button>

        <div className="flex-1" />

        <Button
          variant="primary"
          size="md"
          loading={isConverting}
          disabled={isConverting || pendingCount === 0 || !outputFolder}
          leadingIcon={
            !isConverting
              ? () => <HugeiconsIcon icon={Upload04Icon} size={16} />
              : undefined
          }
          onClick={onConvert}
        >
          {!outputFolder
            ? "Pick folder first"
            : isConverting
              ? "Converting"
              : `Convert${pendingCount > 0 ? ` (${pendingCount})` : " All"}`}
        </Button>
      </div>
    </motion.div>
  );
}
