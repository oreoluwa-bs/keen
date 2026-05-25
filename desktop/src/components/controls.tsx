"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SliderComfortable } from "@/components/ui/slider";
import { FORMATS, type Format, type ImageItem } from "@/lib/images";
import {
  ArrowExpandDiagonalIcon,
  BadgeInfoIcon,
  Folder01Icon,
  Loading03Icon,
  Upload05Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import type { Preset } from "@/hooks/use-presets";

interface ControlsProps {
  format: Format;
  onFormatChange: (f: Format) => void;
  quality: number;
  onQualityChange: (q: number) => void;
  width: number;
  height: number;
  onResizeChange: (w: number, h: number) => void;
  stripExif: boolean;
  onStripExifChange: (v: boolean) => void;
  presets: Preset[];
  onPresetApply: (preset: Preset) => void;
  onPresetSave: (name: string) => void;
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
  width,
  height,
  onResizeChange,
  stripExif,
  onStripExifChange,
  presets,
  onPresetApply,
  onPresetSave,
  outputFolder,
  onPickFolder,
  onConvert,
  isConverting,
  images,
}: ControlsProps) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCount = images.filter((i) => i.status === "pending").length;

  const activePreset = presets.find(
    (p) =>
      p.format === format &&
      p.quality === quality &&
      p.width === width &&
      p.height === height &&
      p.stripExif === stripExif,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="flex items-center gap-4 px-4 py-3">
        <Select
          value={activePreset?.name ?? "__custom__"}
          onValueChange={(v) => {
            if (v === "__save__") {
              setSaveName("");
              setSaveOpen(true);
              return;
            }
            if (v === "__custom__") return;
            const preset = presets.find((p) => p.name === v);
            if (preset) onPresetApply(preset);
          }}
        >
          <SelectTrigger size="sm" className="text-xs rounded-lg min-w-28">
            <span className="">Preset</span>
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              <SelectItem value="__custom__">Custom</SelectItem>
              {presets.map((p) => (
                <SelectItem key={p.name} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
              <div className="h-px bg-border mx-2 my-1" />
              <SelectItem value="__save__">
                <span className="text-muted-foreground">
                  Save current as preset...
                </span>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={format} onValueChange={onFormatChange}>
          <SelectTrigger size="sm" className="text-xs rounded-lg">
            <span className="">Format</span>
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              {FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 flex-1 min-w-25 max-w-50">
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

        <ResizeControls
          width={width}
          height={height}
          onResizeChange={onResizeChange}
        />

        <ExifControls
          stripExif={stripExif}
          onStripExifChange={onStripExifChange}
        />

        <Button
          type="button"
          onClick={onPickFolder}
          variant={"tertiary"}
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

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="w-72" showCloseButton>
          <DialogHeader>
            <DialogTitle>Save preset</DialogTitle>
          </DialogHeader>
          <input
            ref={inputRef}
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="e.g. WebP Small"
            className="flex h-8 w-full rounded-md border border-border bg-transparent px-3 text-[13px] outline-none focus-visible:ring-1 focus-visible:ring-[#6B97FF] transition-all duration-80"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && saveName.trim()) {
                onPresetSave(saveName.trim());
                setSaveOpen(false);
              }
            }}
          />
          <DialogFooter>
            <Button variant="tertiary" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!saveName.trim()}
              onClick={() => {
                onPresetSave(saveName.trim());
                setSaveOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function ResizeControls({
  height,
  width,
  onResizeChange,
}: {
  width: number;
  height: number;
  onResizeChange: (w: number, h: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasResize = width > 0 || height > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="tertiary"
          className="text-xs"
          leadingIcon={() => (
            <HugeiconsIcon
              icon={ArrowExpandDiagonalIcon}
              size={14}
              className="shrink-0 text-muted-foreground"
            />
          )}
        >
          <span
            className={hasResize ? "text-foreground" : "text-muted-foreground"}
          >
            {hasResize
              ? `${width > 0 ? width : "Auto"}×${height > 0 ? height : "Auto"}`
              : "Original"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-3">
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-medium">Resize</span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-muted-foreground w-12 shrink-0">
                Width
              </label>
              <input
                type="number"
                min={0}
                value={width || ""}
                placeholder="Auto"
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  onResizeChange(Number.isNaN(v) ? 0 : Math.max(0, v), height);
                }}
                className="flex h-7 w-full rounded-md border border-border bg-transparent px-2 text-[13px] outline-none focus-visible:ring-1 focus-visible:ring-[#6B97FF] transition-all duration-80 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[12px] text-muted-foreground w-12 shrink-0">
                Height
              </label>
              <input
                type="number"
                min={0}
                value={height || ""}
                placeholder="Auto"
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  onResizeChange(width, Number.isNaN(v) ? 0 : Math.max(0, v));
                }}
                className="flex h-7 w-full rounded-md border border-border bg-transparent px-2 text-[13px] outline-none focus-visible:ring-1 focus-visible:ring-[#6B97FF] transition-all duration-80 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>
          {hasResize && (
            <button
              type="button"
              onClick={() => {
                onResizeChange(0, 0);
                setOpen(false);
              }}
              className="text-[12px] text-muted-foreground hover:text-foreground transition-colors duration-80 self-start"
            >
              Reset to original
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
