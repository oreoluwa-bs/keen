#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Parse arguments
RELEASE_MODE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --release)
      RELEASE_MODE=1
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--release]"
      exit 1
      ;;
  esac
done

# Determine version from git tag, or fallback to 'dev'
if git describe --tags --exact-match >/dev/null 2>&1; then
  VERSION="$(git describe --tags --exact-match)"
  VERSION="${VERSION#v}"
elif git describe --tags --always >/dev/null 2>&1; then
  VERSION="$(git describe --tags --always)"
  VERSION="${VERSION#v}"
else
  VERSION="dev"
fi

# Determine target triple from host platform
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin)
    case "$ARCH" in
      arm64) TARGET="aarch64-apple-darwin" ;;
      x86_64) TARGET="x86_64-apple-darwin" ;;
      *) echo "Unsupported macOS architecture: $ARCH"; exit 1 ;;
    esac
    ;;
  Linux)
    case "$ARCH" in
      x86_64) TARGET="x86_64-unknown-linux-gnu" ;;
      aarch64) TARGET="aarch64-unknown-linux-gnu" ;;
      *) echo "Unsupported Linux architecture: $ARCH"; exit 1 ;;
    esac
    ;;
  *)
    echo "Unsupported platform: $OS"
    exit 1
    ;;
esac

# Determine output filename
# Tauri dev mode resolves externalBin to the literal path (../../keen)
# Tauri build mode appends the target triple (../../keen-<target-triple>)
if [ "$RELEASE_MODE" = 1 ]; then
  OUTPUT="keen-${TARGET}"
else
  OUTPUT="keen"
fi

echo "Building sidecar: ${OUTPUT} (version: ${VERSION}, target: ${TARGET})"

go build \
  -ldflags="-s -w -X main.Version=${VERSION}" \
  -o "${OUTPUT}" \
  ./cmd/keen

# Ad-hoc sign on macOS so Gatekeeper doesn't report the binary as "damaged"
if [ "$OS" = "Darwin" ]; then
  echo "Ad-hoc signing: ${OUTPUT}"
  codesign --sign - --force --options runtime "${OUTPUT}"
fi

echo "Done: ${OUTPUT}"
