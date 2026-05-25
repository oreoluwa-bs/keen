import { useCallback } from "react";
import { usePersistedState } from "./use-persisted-state";
import type { Format } from "@/lib/images";

export interface Preset {
  name: string;
  format: Format;
  quality: number;
  width: number;
  height: number;
  stripExif: boolean;
}

export interface PresetSettings {
  format: Format;
  quality: number;
  width: number;
  height: number;
  stripExif: boolean;
}

export function usePresets() {
  const [presets, setPresets] = usePersistedState<Preset[]>("presets", []);

  const savePreset = useCallback(
    (name: string, settings: PresetSettings) => {
      setPresets([
        ...presets.filter((p) => p.name !== name),
        { name, ...settings },
      ]);
    },
    [presets, setPresets],
  );

  const deletePreset = useCallback(
    (name: string) => {
      setPresets(presets.filter((p) => p.name !== name));
    },
    [presets, setPresets],
  );

  return { presets, savePreset, deletePreset };
}
