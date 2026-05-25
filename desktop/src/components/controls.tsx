"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type ImageItem } from "@/lib/images";
import {
  BadgeInfoIcon,
  Folder01Icon,
  Loading03Icon,
  Upload05Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";

interface ControlsProps {
  stripExif: boolean;
  onStripExifChange: (v: boolean) => void;
  outputFolder: string | null;
  onPickFolder: () => void;
  onConvert: () => void;
  isConverting: boolean;
  images: ImageItem[];
}

export function Controls({
  stripExif,
  onStripExifChange,
  outputFolder,
  onPickFolder,
  onConvert,
  isConverting,
  images,
}: ControlsProps) {
  const pendingCount = images.filter((i) => i.status === "pending").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4 px-4 py-3">
        <ExifControls
          stripExif={stripExif}
          onStripExifChange={onStripExifChange}
        />

        <Button
          type="button"
          onClick={onPickFolder}
          variant="tertiary"
          className="text-xs"
          leadingIcon={() => (
            <HugeiconsIcon icon={Folder01Icon} size={16} className="shrink-0" />
          )}
        >
          <span className="max-w-45 truncate">
            {outputFolder ?? "Output folder"}
          </span>
        </Button>

        <div className="flex-1" />

        <Button
          variant="primary"
          size="md"
          loading={isConverting}
          disabled={isConverting || pendingCount === 0 || !outputFolder}
          className="text-xs"
          leadingIcon={
            isConverting
              ? () => (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={16}
                    className="animate-spin"
                  />
                )
              : () => <HugeiconsIcon icon={Upload05Icon} size={16} />
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

function ExifControls({
  stripExif,
  onStripExifChange,
}: {
  stripExif: boolean;
  onStripExifChange: (v: boolean) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="tertiary"
          className={cn("text-xs", stripExif && "bg-accent text-foreground")}
          leadingIcon={() => (
            <HugeiconsIcon
              icon={BadgeInfoIcon}
              size={14}
              className={cn(
                "shrink-0",
                stripExif ? "text-foreground" : "text-muted-foreground"
              )}
            />
          )}
        >
          <span
            className={stripExif ? "text-foreground" : "text-muted-foreground"}
          >
            {stripExif ? "Strip Exif" : "Exif"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-medium">EXIF Metadata</span>
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Camera model, GPS location, and timestamps embedded in images.
            Stripping also prevents auto-rotation based on EXIF orientation
            data.
          </p>
          <div className="flex items-center justify-between rounded-lg border border-border p-2">
            <Switch
              label="Strip EXIF"
              checked={stripExif}
              onToggle={() => onStripExifChange(!stripExif)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


