import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  hasImages: boolean;
}

export function Dropzone({ onFiles, hasImages }: DropzoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFiles(accepted);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tiff"],
    },
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
  });

  const active = isDragActive || dragOver;

  if (hasImages) {
    return (
      <div
        {...getRootProps()}
        className={cn(
          "relative flex items-center justify-center gap-2 py-2 px-4 cursor-pointer transition-all duration-150 ease-out",
          active && "bg-accent",
        )}
      >
        <input {...getInputProps()} />
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground shrink-0"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-[13px] text-muted-foreground">
          {active ? "Drop to add" : "Add more images"}
        </span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center gap-3 w-full h-full cursor-pointer select-none",
        "transition-all duration-150 ease-out",
        active && "bg-accent",
      )}
    >
      <input {...getInputProps()} />
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12",
          "transition-all duration-150 ease-out",
          active ? "border-foreground bg-accent/50" : "border-border",
        )}
      >
        <svg
          width={32}
          height={32}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
          style={{
            transform: active ? "scale(1.05)" : "scale(1)",
            transition: "transform 150ms ease-out",
          }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[14px] font-medium text-foreground">
            Upload images
          </span>
          <span className="text-[13px] text-muted-foreground">
            Drop here or click to browse
          </span>
        </div>
      </div>
    </div>
  );
}
