import { useState, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ImageItem, ImageStatus, Format } from "@/lib/images";

interface UseConversionOptions {
  images: ImageItem[];
  format: Format;
  quality: number;
  width: number;
  height: number;
  outputFolder: string | null;
  updateImageStatus: (id: string, status: ImageStatus) => void;
  updateImageError: (id: string, error: string) => void;
}

export function useConversion({
  images,
  format,
  quality,
  width,
  height,
  outputFolder,
  updateImageStatus,
  updateImageError,
}: UseConversionOptions) {
  const [isConverting, setIsConverting] = useState(false);
  const imagesRef = useRef(images);
  imagesRef.current = images;

  const handleConvert = useCallback(async () => {
    if (!outputFolder) return;
    setIsConverting(true);

    const currentImages = imagesRef.current;
    const pending = currentImages.filter((img) => img.status === "pending");

    for (const image of pending) {
      updateImageStatus(image.id, "converting");

      try {
        const buf = await image.file.arrayBuffer();
        const bytes = Array.from(new Uint8Array(buf));

        const inputPath: string = await invoke("write_temp_file", {
          name: image.file.name,
          data: bytes,
        });

        const baseName = image.file.name.replace(/\.[^.]+$/, "");
        const outputPath = `${outputFolder}/${baseName}.${format}`;

        const args: string[] = [
          "convert",
          inputPath,
          outputPath,
          "--format",
          format,
          "--quality",
          String(quality),
        ];

        if (width > 0) args.push("--width", String(width));
        if (height > 0) args.push("--height", String(height));

        await invoke("run_keen", {
          args,
        });

        updateImageStatus(image.id, "done");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        updateImageError(image.id, msg);
      }
    }

    setIsConverting(false);
  }, [format, quality, width, height, outputFolder, updateImageStatus, updateImageError]);

  return { handleConvert, isConverting };
}
