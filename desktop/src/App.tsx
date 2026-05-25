import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import "./App.css";
import { Controls } from "./components/controls";
import { Dropzone } from "./components/dropzone";
import { ErrorBoundary } from "./components/error-boundary";
import { Grid } from "./components/grid";
import { Header } from "./components/header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { useConversion } from "./hooks/use-conversion";
import { usePersistedState } from "./hooks/use-persisted-state";
import { usePresets } from "./hooks/use-presets";
import { useShortcuts } from "./hooks/use-shortcuts";
import { useTheme } from "./hooks/use-theme";
import { useImageState, type Format } from "./lib/images";

function App() {
  const {
    images,
    addImages,
    removeImage,
    clearAll,
    updateImageStatus,
    updateImageError,
    updateImageDone,
  } = useImageState();
  const { presets, savePreset } = usePresets();
  const { theme, toggleTheme } = useTheme();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  useShortcuts([
    {
      key: "Backspace",
      handler: () => setClearDialogOpen(true),
      label: "Clear all images",
    },
    {
      key: "Delete",
      handler: () => setClearDialogOpen(true),
      label: "Clear all images",
    },
  ]);
  const [format, setFormat] = usePersistedState<Format>("format", "webp");
  const [quality, setQuality] = usePersistedState("quality", 85);
  const [width, setWidth] = usePersistedState("resize-width", 0);
  const [height, setHeight] = usePersistedState("resize-height", 0);
  const [stripExif, setStripExif] = usePersistedState("strip-exif", false);
  const [outputFolder, setOutputFolder] = usePersistedState<string | null>(
    "output-folder",
    null,
  );

  const { handleConvert, isConverting } = useConversion({
    images,
    format,
    quality,
    width,
    height,
    stripExif,
    outputFolder,
    updateImageStatus,
    updateImageError,
    updateImageDone,
  });

  const handlePickFolder = async () => {
    const folder = await open({ directory: true });
    if (folder) setOutputFolder(folder);
  };

  return (
    <ErrorBoundary>
      <div className="h-dvh flex flex-col overflow-hidden bg-background">
        <Header
          images={images}
          onRequestClear={() => setClearDialogOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
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
            width={width}
            height={height}
            onResizeChange={(w, h) => {
              setWidth(w);
              setHeight(h);
            }}
            stripExif={stripExif}
            onStripExifChange={setStripExif}
            presets={presets}
            onPresetApply={(p) => {
              setFormat(p.format);
              setQuality(p.quality);
              setWidth(p.width);
              setHeight(p.height);
              setStripExif(p.stripExif);
            }}
            onPresetSave={(name) => {
              savePreset(name, { format, quality, width, height, stripExif });
            }}
            outputFolder={outputFolder}
            onPickFolder={handlePickFolder}
            onConvert={handleConvert}
            isConverting={isConverting}
            images={images}
          />
        )}
      </div>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all images?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {images.length} image
              {images.length !== 1 ? "s" : ""} from the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={clearAll}
              className="bg-primary text-primary-foreground"
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ErrorBoundary>
  );
}

export default App;
