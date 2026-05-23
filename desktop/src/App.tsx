import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";
import "./App.css";
import { Button } from "@/components/ui/button";
import { Controls } from "./components/controls";
import { Dropzone } from "./components/dropzone";
import { Grid } from "./components/grid";
import { useImageState, type Format } from "./lib/images";

function App() {
  const {
    images,
    addImages,
    removeImage,
    clearAll,
    isConverting,
    setIsConverting,
  } = useImageState();
  const [format, setFormat] = useState<Format>("webp");
  const [quality, setQuality] = useState(85);

  const handleConvert = async () => {
    setIsConverting(true);
    for (const image of images) {
      if (image.status !== "pending") continue;
      try {
        await invoke("run_keen", {
          args: ["--version"],
        });
      } catch (err) {
        console.error(err);
      }
    }
    setIsConverting(false);
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-background">
      <header className="flex items-center justify-between px-4 h-12 shrink-0 border-b border-border">
        <span className="text-[14px] font-medium tracking-tight">keen</span>
        {images.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-muted-foreground tabular-nums">
              {images.length} image{images.length !== 1 ? "s" : ""}
            </span>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear
            </Button>
          </div>
        )}
      </header>
      <div className="flex-1 flex flex-col overflow-hidden">
        {images.length === 0 ? (
          <Dropzone onFiles={addImages} hasImages={false} />
        ) : (
          <>
            <Dropzone onFiles={addImages} hasImages={true} />
            <Grid images={images} onRemove={removeImage} />
          </>
        )}
      </div>
      {images.length > 0 && (
        <Controls
          format={format}
          onFormatChange={setFormat}
          quality={quality}
          onQualityChange={setQuality}
          onConvert={handleConvert}
          isConverting={isConverting}
          images={images}
        />
      )}
    </div>
  );
}

export default App;
