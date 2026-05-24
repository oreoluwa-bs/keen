import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import "./App.css";
import { Controls } from "./components/controls";
import { Dropzone } from "./components/dropzone";
import { ErrorBoundary } from "./components/error-boundary";
import { Grid } from "./components/grid";
import { Header } from "./components/header";
import { useConversion } from "./hooks/use-conversion";
import { useImageState, type Format } from "./lib/images";

function App() {
  const {
    images,
    addImages,
    removeImage,
    clearAll,
    updateImageStatus,
    updateImageError,
  } = useImageState();
  const [format, setFormat] = useState<Format>("webp");
  const [quality, setQuality] = useState(85);
  const [outputFolder, setOutputFolder] = useState<string | null>(null);

  const { handleConvert, isConverting } = useConversion({
    images,
    format,
    quality,
    outputFolder,
    updateImageStatus,
    updateImageError,
  });

  const handlePickFolder = async () => {
    const folder = await open({ directory: true });
    if (folder) setOutputFolder(folder);
  };

  return (
    <ErrorBoundary>
      <div className="h-dvh flex flex-col overflow-hidden bg-background">
        <Header images={images} onClearAll={clearAll} />
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
            outputFolder={outputFolder}
            onPickFolder={handlePickFolder}
            onConvert={handleConvert}
            isConverting={isConverting}
            images={images}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
