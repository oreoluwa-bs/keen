import { useState, useCallback } from "react";

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void]
export function usePersistedState<T>(
  key: string,
  defaultValue?: T,
): [T | undefined, (value: T) => void]
export function usePersistedState<T>(
  key: string,
  defaultValue?: T,
): [T | undefined, (value: T) => void] {
  const [state, setState] = useState<T | undefined>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored) as T;
    } catch {}
    return defaultValue;
  });

  const setPersistedState = useCallback(
    (value: T) => {
      setState(value);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    },
    [key],
  );

  return [state, setPersistedState];
}
