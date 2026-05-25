#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CURRENT_VERSION="$(cat "$ROOT/VERSION")"

if [ $# -eq 1 ]; then
  NEW_VERSION="$1"
else
  echo "Current version: $CURRENT_VERSION"
  read -rp "New version: " NEW_VERSION
fi

if [ -z "$NEW_VERSION" ]; then
  echo "Aborted."
  exit 1
fi

echo "=== Bumping version: $CURRENT_VERSION → $NEW_VERSION ==="
"$ROOT/scripts/bump-version.sh" "$NEW_VERSION"

echo ""
echo "=== Generating changelog ==="
cd "$ROOT"
git cliff --bump --output CHANGELOG.md

echo ""
echo "=== Staging changes ==="
git add VERSION CHANGELOG.md desktop/package.json desktop/src-tauri/Cargo.toml desktop/src-tauri/tauri.conf.json

echo ""
echo "=== Committing ==="
git commit -m "chore: release v$NEW_VERSION"

echo ""
echo "=== Tagging ==="
git tag -a "v$NEW_VERSION" -m "release v$NEW_VERSION"

echo ""
echo "Done! Push with: git push origin main --tags"
