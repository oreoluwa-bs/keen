.PHONY: build test test/unit test/integration bench lint clean install

BIN       := keen
VERSION   := $(shell cat VERSION 2>/dev/null || echo "dev")
LDFLAGS   := -ldflags="-s -w -X main.Version=$(VERSION)"
PKG       := github.com/oreoluwa-bs/keen/cmd/keen

build:
	go build $(LDFLAGS) -o $(BIN) $(PKG)

install:
	go install $(LDFLAGS) $(PKG)

test:
	go test ./... -count=1

test/unit:
	go test ./internal/... -count=1

test/integration:
	go test ./cmd/... -count=1

bench:
	go test ./internal/img/... -bench=. -benchmem -count=1

bench/encode:
	go test ./internal/img/... -bench=BenchmarkEncode -benchmem -count=1

bench/convert:
	go test ./internal/img/... -bench=BenchmarkConvert -benchmem -count=1

lint:
	go vet ./...

clean:
	rm -f $(BIN)
	rm -rf testdata/output/*
	rm -f testdata/keen_test*
