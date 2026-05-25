#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <new-version>"
  echo "Example: $0 0.2.0"
  exit 1
fi

NEW_VERSION="$1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "$NEW_VERSION" > "$ROOT/VERSION"

sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" "$ROOT/desktop/package.json"

sed -i '' "s/^version = \".*\"/version = \"$NEW_VERSION\"/" "$ROOT/desktop/src-tauri/Cargo.toml"

sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" "$ROOT/desktop/src-tauri/tauri.conf.json"

echo "Bumped version to $NEW_VERSION in:"
echo "  VERSION"
echo "  desktop/package.json"
echo "  desktop/src-tauri/Cargo.toml"
echo "  desktop/src-tauri/tauri.conf.json"
