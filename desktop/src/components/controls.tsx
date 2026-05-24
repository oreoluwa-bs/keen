"use client";

import { Button } from "@/components/ui/button";
import { SliderComfortable } from "@/components/ui/slider";
import { FORMATS, type Format, type ImageItem } from "@/lib/images";
import {
  Folder01Icon,
  Loading03Icon,
  Upload05Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
  const pendingCount = images.filter((i) => i.status === "pending").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4 px-4 py-3">
        <Select value={format} onValueChange={onFormatChange}>
          <SelectTrigger size="sm" className="text-xs rounded-full">
            <span className="">Format</span>
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              {FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-50">
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

        <Button
          type="button"
          onClick={onPickFolder}
          variant={"tertiary"}
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
