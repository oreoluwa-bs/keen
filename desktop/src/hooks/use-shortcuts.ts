import { useEffect, useRef } from "react";

export interface Shortcut {
  key: string;
  handler: () => void;
  label: string;
  modifiers?: {
    meta?: boolean;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
  };
}

export function useShortcuts(shortcuts: Shortcut[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return;

      for (const s of shortcutsRef.current) {
        let match = e.key === s.key;

        if (s.modifiers?.meta) match = match && e.metaKey;
        if (s.modifiers?.ctrl) match = match && e.ctrlKey;
        if (s.modifiers?.shift) match = match && e.shiftKey;
        if (s.modifiers?.alt) match = match && e.altKey;

        if (match) {
          e.preventDefault();
          s.handler();
          return;
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return shortcuts;
}
