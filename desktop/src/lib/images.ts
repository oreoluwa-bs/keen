import { useState, useCallback, useRef } from "react";

export type ImageStatus = "pending" | "converting" | "done" | "error";

export interface ImageItem {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  status: ImageStatus;
  error?: string;
}

export type Format =
  | "webp"
  | "jpeg"
  | "png"
  | "gif"
  | "bmp"
  | "tiff";

export const FORMATS: { value: Format; label: string }[] = [
  { value: "webp", label: "WebP" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "gif", label: "GIF" },
  { value: "bmp", label: "BMP" },
  { value: "tiff", label: "TIFF" },
];

export function useImageState() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const idCounter = useRef(0);

  const addImages = useCallback((files: File[]) => {
    const items: ImageItem[] = files.map((file) => {
      idCounter.current += 1;
      return {
        id: `img-${idCounter.current}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        status: "pending",
      };
    });
    setImages((prev) => [...prev, ...items]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setImages((prev) => {
      prev.forEach((i) => URL.revokeObjectURL(i.preview));
      return [];
    });
  }, []);

  const updateImageStatus = useCallback((id: string, status: ImageStatus) => {
    setImages((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  }, []);

  const updateImageError = useCallback((id: string, error: string) => {
    setImages((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "error" as const, error } : i))
    );
  }, []);

  return { images, addImages, removeImage, clearAll, updateImageStatus, updateImageError };
}
