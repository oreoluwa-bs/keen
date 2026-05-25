"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Preset } from "@/hooks/use-presets";
import type { Shortcut } from "@/hooks/use-shortcuts";
import { FORMATS, type Format, type ImageItem } from "@/lib/images";
import { cn } from "@/lib/utils";
import {
  ArrowExpandDiagonalIcon,
  HelpCircleIcon,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

const BUILTIN_SHORTCUTS: Shortcut[] = [
  { key: "Backspace", handler: () => {}, label: "Clear all images" },
  { key: "Delete", handler: () => {}, label: "Clear all images" },
];

interface HeaderProps {
  images: ImageItem[];
  onRequestClear: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  format: Format;
  onFormatChange: (f: Format) => void;
  quality: number;
  onQualityChange: (q: number) => void;
  width: number;
  height: number;
  onResizeChange: (w: number, h: number) => void;
  presets: Preset[];
  onPresetApply: (preset: Preset) => void;
  onPresetSave: (name: string) => void;
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
        <button
          type="button"
          className={cn(
            "group inline-flex items-center gap-1.5 outline-none cursor-pointer text-[13px] h-7 px-2.5 border border-border bg-transparent transition-all duration-80 rounded-lg focus-visible:ring-1 focus-visible:ring-[#6B97FF]",
            hasResize && "bg-accent",
          )}
        >
          <HugeiconsIcon
            icon={ArrowExpandDiagonalIcon}
            size={13}
            className="shrink-0 text-muted-foreground"
          />
          <span
            className={hasResize ? "text-foreground" : "text-muted-foreground"}
          >
            {hasResize
              ? `${width > 0 ? width : "Auto"}×${height > 0 ? height : "Auto"}`
              : "Original"}
          </span>
        </button>
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

function formatShortcut(s: Shortcut) {
  const parts: string[] = [];
  if (s.modifiers?.meta) parts.push("⌘");
  if (s.modifiers?.ctrl) parts.push("^");
  if (s.modifiers?.shift) parts.push("⇧");
  if (s.modifiers?.alt) parts.push("⌥");
  const keyLabel =
    s.key === "Backspace"
      ? "⌫"
      : s.key === "Delete"
        ? "⌦"
        : s.key === "Escape"
          ? "⎋"
          : s.key.toUpperCase();
  parts.push(keyLabel);
  return parts.join("");
}

export function Header({
  images,
  onRequestClear,
  theme,
  onToggleTheme,
  format,
  onFormatChange,
  quality,
  onQualityChange,
  width,
  height,
  onResizeChange,
  presets,
  onPresetApply,
  onPresetSave,
}: HeaderProps) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const total = images.length;
  const pending = images.filter((i) => i.status === "pending").length;
  const done = images.filter((i) => i.status === "done").length;
  const errors = images.filter((i) => i.status === "error").length;
  const hasImages = total > 0;

  const doneImages = images.filter((i) => i.status === "done");
  const totalOriginal = doneImages.reduce((sum, i) => sum + i.size, 0);
  const totalOutput = doneImages.reduce(
    (sum, i) => sum + (i.outputSize ?? i.size),
    0,
  );
  const totalSavings = totalOriginal - totalOutput;

  const activePreset = presets.find(
    (p) =>
      p.format === format &&
      p.quality === quality &&
      p.width === width &&
      p.height === height,
  );

  return (
    <header className="flex items-center justify-between px-3 h-12 shrink-0 border-b border-border gap-3">
      <div className="flex items-center gap-2 min-w-0">
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
          <SelectTrigger size="sm" className="text-xs rounded-lg min-w-24">
            <SelectValue placeholder="Preset" />
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
            <SelectValue placeholder="Format" />
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
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <AnimatePresence mode="wait">
          {hasImages ? (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              {pending > 0 && (
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {pending} pending
                </span>
              )}
              {done > 0 && (
                <span className="inline-flex items-center gap-1 text-[12px] tabular-nums text-foreground">
                  <span className="size-1.5 rounded-full bg-foreground/60" />
                  {done} done
                  {totalSavings > 0 && (
                    <span className="text-muted-foreground">
                      (-{Math.round((totalSavings / totalOriginal) * 100)}%)
                    </span>
                  )}
                </span>
              )}
              {errors > 0 && (
                <span className="inline-flex items-center gap-1 text-[12px] tabular-nums text-destructive">
                  <span className="size-1.5 rounded-full bg-destructive" />
                  {errors} {errors === 1 ? "error" : "errors"}
                </span>
              )}
              <div className="w-px h-4 bg-border mx-1" />
              <Button variant="ghost" size="sm" onClick={onRequestClear}>
                Clear
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="empty-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span className="text-[11px] text-muted-foreground/60 tracking-wide uppercase">
                Drop images to convert
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-hover transition-colors duration-80 outline-none focus-visible:ring-1 focus-visible:ring-[#6B97FF]"
            >
              <HugeiconsIcon icon={HelpCircleIcon} size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium mb-1">
                Keyboard Shortcuts
              </span>
              {BUILTIN_SHORTCUTS.map((s) => (
                <div
                  key={s.key + s.label}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-[12px] text-muted-foreground">
                    {s.label}
                  </span>
                  <kbd className="text-[11px] text-foreground font-mono tabular-nums">
                    {formatShortcut(s)}
                  </kbd>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-hover transition-colors duration-80 outline-none focus-visible:ring-1 focus-visible:ring-[#6B97FF]"
        >
          <HugeiconsIcon
            icon={theme === "dark" ? Sun01Icon : Moon01Icon}
            size={14}
          />
        </button>
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
    </header>
  );
}
