"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ImageItem } from "@/lib/images";
import {
  HelpCircleIcon,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import type { Shortcut } from "@/hooks/use-shortcuts";

const BUILTIN_SHORTCUTS: Shortcut[] = [
  { key: "r", handler: () => {}, label: "Toggle corner radius" },
  { key: "i", handler: () => {}, label: "Switch icon set" },
  { key: "Backspace", handler: () => {}, label: "Clear all images" },
  { key: "Delete", handler: () => {}, label: "Clear all images" },
];

interface HeaderProps {
  images: ImageItem[];
  onClearAll: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
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

export function Header({ images, onClearAll, theme, onToggleTheme }: HeaderProps) {
  const total = images.length;
  const pending = images.filter((i) => i.status === "pending").length;
  const done = images.filter((i) => i.status === "done").length;
  const errors = images.filter((i) => i.status === "error").length;
  const hasImages = total > 0;

  return (
    <header className="flex items-center justify-between px-4 h-12 shrink-0 border-b border-border">
      <div className="flex items-center gap-2.5">
        <span className="size-2 rounded-full bg-foreground/30" />
        <span className="text-[14px] font-semibold tracking-tight">keen</span>
      </div>

      <div className="flex items-center gap-2">
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
                </span>
              )}
              {errors > 0 && (
                <span className="inline-flex items-center gap-1 text-[12px] tabular-nums text-destructive">
                  <span className="size-1.5 rounded-full bg-destructive" />
                  {errors} {errors === 1 ? "error" : "errors"}
                </span>
              )}
              <div className="w-px h-4 bg-border mx-1" />
              <Button variant="ghost" size="sm" onClick={onClearAll}>
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
              className="flex flex-col items-end gap-0.5"
            >
              <span className="text-[11px] text-muted-foreground/60 tracking-wide uppercase">
                Drop images to convert
              </span>
              <span className="text-[10px] text-muted-foreground/40 tracking-wide">
                R radius · I icons
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
    </header>
  );
}
