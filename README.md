# keen

Local image converter and compressor. CLI + Tauri desktop app.

## Features

- Convert between PNG, JPEG, GIF, BMP, TIFF, WebP
- Batch convert entire directories
- Resize with width/height constraints
- Adjust JPEG/WebP quality
- Strip EXIF metadata
- Automatic EXIF orientation correction
- Concurrent batch processing

## Installation

### CLI

```bash
go install github.com/oreoluwa-bs/keen/cmd/keen@latest
```

Or download a binary from [GitHub Releases](https://github.com/oreoluwa-bs/keen/releases).

### Desktop

Download the `.dmg` (macOS) or `.AppImage` (Linux) from [GitHub Releases](https://github.com/oreoluwa-bs/keen/releases).

## Usage

```bash
# Convert a single file
keen convert input.png output.jpg

# Convert with quality
keen convert --quality 80 input.png output.jpg

# Convert and resize
keen convert --width 800 input.heic output.jpg

# Batch convert a directory
keen batch --format webp --quality 80 ./photos ./converted

# Strip EXIF metadata (orientation still preserved by default)
keen convert --strip-exif input.jpg output.png

# Batch with multiple workers
keen batch --format jpeg --workers 8 ./raw ./processed
```

### Supported input formats

PNG, JPEG, GIF, BMP, TIFF, WebP + any format Go's image decoder supports (including HEIC via platform decoders).

### Supported output formats

PNG, JPEG, GIF, BMP, TIFF, WebP

## Building from source

```bash
make build
```

Binary is written to `./keen`.

### Desktop app

```bash
cd desktop
pnpm install
pnpm tauri dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and [RELEASING.md](RELEASING.md) for release process.
