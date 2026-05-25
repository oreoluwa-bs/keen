# Releasing

## Versioning

This project uses [semantic versioning](https://semver.org/). The single source of truth is `VERSION` at the repo root — all manifests (`package.json`, `Cargo.toml`, `tauri.conf.json`) are kept in sync via the bump script.

## Prerequisites

- [`git-cliff`](https://git-cliff.org) installed locally
- `GITHUB_TOKEN` with `repo` scope (for goreleaser in CI)
- Write access to the repository

## Step-by-step

### 1. Land changes on `main`

Ensure all commits use [conventional commit messages](https://www.conventionalcommits.org/). The changelog is auto-generated from these.

### 2. Run the release script

```bash
./scripts/release.sh 0.2.0
```

This does the following:

| Step | What it does |
|---|---|
| `bump-version.sh` | Writes new version to `VERSION`, `package.json`, `Cargo.toml`, `tauri.conf.json` |
| `git cliff --bump` | Generates `CHANGELOG.md` from conventional commits |
| `git commit` | Commits all changes |
| `git tag` | Creates an annotated tag (`v0.2.0`) |

### 3. Push

```bash
git push origin main --tags
```

### 4. CI builds the release

Pushing a `v*` tag triggers `.github/workflows/release.yml`:

```
Tag v0.2.0
    │
    ├── Job: cli (ubuntu-latest)
    │     └── goreleaser release
    │           ├── Build: keen_{version}_{os}_{arch}.tar.gz (darwin/linux × amd64/arm64)
    │           ├── Generate: checksums.txt
    │           └── Create: GitHub Release
    │
    └── Job: desktop (needs: cli)
          ├── macOS ARM  → build sidecar → tauri build → upload .dmg
          ├── macOS Intel → build sidecar → tauri build → upload .dmg
          └── Linux       → build sidecar → tauri build → upload .AppImage
```

All artifacts are uploaded to the same GitHub Release.

### 5. The release is live

- CLI binaries are downloadable from the release page
- Desktop bundles (`.dmg`, `.AppImage`) are attached to the same release
- The changelog is visible on the release page

## Testing a release locally

```bash
# Dry run with goreleaser (doesn't publish)
goreleaser release --snapshot --clean

# View unreleased changelog
git cliff --unreleased

# Reset after a failed local release attempt
git reset --soft HEAD~1 && git tag -d v0.2.0
```
