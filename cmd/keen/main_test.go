package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

var binary = "../../testdata/keen_test"

func TestMain(m *testing.M) {
	cmd := exec.Command("go", "build", "-o", binary, ".")
	if err := cmd.Run(); err != nil {
		os.Exit(1)
	}

	code := m.Run()

	os.Remove(binary)
	os.Exit(code)
}

func TestConvertCLI(t *testing.T) {
	outDir := "../../testdata/output"
	if err := os.MkdirAll(outDir, 0755); err != nil {
		t.Fatal(err)
	}

	outPath := filepath.Join(outDir, "converted.webp")
	defer os.Remove(outPath)

	cmd := exec.Command(binary, "convert",
		"../../testdata/input/fixture.png", outPath)
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("convert failed: %v\n%s", err, out)
	}

	info, err := os.Stat(outPath)
	if err != nil {
		t.Fatal("output file not created")
	}
	if info.Size() == 0 {
		t.Fatal("output file is empty")
	}
}

func TestConvertExplicitFormat(t *testing.T) {
	outDir := "../../testdata/output"
	outPath := filepath.Join(outDir, "converted.xyz")
	os.MkdirAll(outDir, 0755)
	defer os.Remove(outPath)

	cmd := exec.Command(binary, "convert",
		"../../testdata/input/fixture.png", outPath,
		"--format", "png")
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("convert failed: %v\n%s", err, out)
	}

	info, err := os.Stat(outPath)
	if err != nil {
		t.Fatal("output file not created")
	}
	if info.Size() == 0 {
		t.Fatal("output file is empty")
	}
}

func TestConvertLosslessQualityWarning(t *testing.T) {
	outDir := "../../testdata/output"
	outPath := filepath.Join(outDir, "lossless_warn.png")
	os.MkdirAll(outDir, 0755)
	defer os.Remove(outPath)

	cmd := exec.Command(binary, "convert",
		"../../testdata/input/fixture.png", outPath,
		"--quality", "90")
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("convert failed: %v\n%s", err, out)
	}
	if !strings.Contains(string(out), "warning") {
		t.Fatal("expected warning about quality on lossless format")
	}
}

func TestBatchDir(t *testing.T) {
	srcDir := t.TempDir()
	dstDir := t.TempDir()

	fixtures := map[string]string{"a.png": "fixture.png", "b.webp": "fixture.webp"}
	for dstName, srcName := range fixtures {
		data, err := os.ReadFile("../../testdata/input/" + srcName)
		if err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(srcDir, dstName), data, 0644); err != nil {
			t.Fatal(err)
		}
	}

	cmd := exec.Command(binary, "batch", srcDir, dstDir, "--format", "png", "--workers", "2")
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("batch failed: %v\n%s", err, out)
	}

	entries, err := os.ReadDir(dstDir)
	if err != nil {
		t.Fatal(err)
	}
	if len(entries) != 2 {
		t.Fatalf("expected 2 output files, got %d", len(entries))
	}
}

func TestBatchRequiresFormat(t *testing.T) {
	srcDir := t.TempDir()
	cmd := exec.Command(binary, "batch", srcDir, "../../testdata/output")
	if err := cmd.Run(); err == nil {
		t.Fatal("expected error when --format is missing")
	}
}

func TestBatchSkipsUnknownExt(t *testing.T) {
	srcDir := t.TempDir()
	dstDir := t.TempDir()

	fh, _ := os.Create(filepath.Join(srcDir, "readme.txt"))
	fh.Close()

	cmd := exec.Command(binary, "batch", srcDir, dstDir, "--format", "jpeg")
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("batch failed: %v\n%s", err, out)
	}

	entries, _ := os.ReadDir(dstDir)
	if len(entries) != 0 {
		t.Fatal("expected no output files for unsupported inputs")
	}
}

func TestConvertMissingSrc(t *testing.T) {
	cmd := exec.Command(binary, "convert", "nonexistent.png", "out.png")
	if err := cmd.Run(); err == nil {
		t.Fatal("expected error for missing source")
	}
}

func TestConvertMissingArg(t *testing.T) {
	cmd := exec.Command(binary, "convert", "in.png")
	if err := cmd.Run(); err == nil {
		t.Fatal("expected error for missing argument")
	}
}
