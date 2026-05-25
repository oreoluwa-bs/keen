# Contributing

## Development setup

### CLI

Requirements: Go 1.25+

```bash
make build
make test
```

### Desktop app

Requirements: Go 1.25+, Node.js (LTS), pnpm, Rust

```bash
cd desktop
pnpm install
pnpm tauri dev
```

## Code style

- Standard Go conventions (`gofmt`, `go vet`)
- All processing in `internal/` — `cmd/` is just wiring
- No external HTTP calls. Fully offline.
- Output must be deterministic given same inputs.

## Testing

```bash
# All tests
make test

# Unit tests only
make test/unit

# Integration tests only
make test/integration

# Benchmarks
make bench
```

Tests live alongside the code they test. Test fixtures are in `testdata/`. Never delete testdata files.

## Pull request process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-change`)
3. Make your changes
4. Run tests: `make test`
5. Run linter: `make lint`
6. Commit with a conventional commit message
7. Push and open a PR
8. Squash merge when approved

## Commit messages

This project uses conventional commits for changelog generation.

```
feat: add WebP lossless support
fix: correct EXIF orientation for rotated images
refactor: extract encoder registry into formats.go
test: add round-trip tests for all formats
docs: update usage examples in README
ci: add release workflow
```

Allowed types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `ci`, `chore`, `build`, `style`.

## Desktop development

- The Go binary is bundled as a Tauri sidecar
- After changing the Go code, rebuild the binary before running the desktop app
- The sidecar binary must follow the `keen-{target-triple}` naming convention
