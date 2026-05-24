import { cn } from "@/lib/utils";
import { Upload05Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
          "relative flex items-center justify-center gap-2 py-2 px-4 cursor-pointer transition-all duration-150 ease-out hover:bg-accent",
          active && "bg-accent",
        )}
      >
        <input {...getInputProps()} />
        <HugeiconsIcon
          icon={Upload05Icon}
          size={16}
          className="text-muted-foreground shrink-0"
        />
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
        <HugeiconsIcon
          icon={Upload05Icon}
          size={16}
          className="text-muted-foreground shrink-0"
        />
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
