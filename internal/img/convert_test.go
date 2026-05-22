package img

import (
	"bytes"
	"fmt"
	"image"
	"image/color"
	"log"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestMain(m *testing.M) {
	generateFixtures()
	os.Exit(m.Run())
}

func generateFixtures() {
	fixtures := []string{"png", "gif", "bmp", "tiff", "webp"}
	for _, f := range fixtures {
		path := fmt.Sprintf("../../testdata/input/fixture.%s", f)
		if _, err := os.Stat(path); err == nil {
			continue
		}

		img := image.NewRGBA(image.Rect(0, 0, 4, 4))
		for y := 0; y < 4; y++ {
			for x := 0; x < 4; x++ {
				img.Set(x, y, color.RGBA{uint8(x * 64), uint8(y * 64), 128, 255})
			}
		}

		fh, err := os.Create(path)
		if err != nil {
			log.Fatalf("creating fixture %s: %v", path, err)
		}

		enc, ok := formats[f]
		if !ok {
			log.Fatalf("unknown format: %s", f)
		}

		if err := enc(img, fh, Options{Quality: 85}); err != nil {
			log.Fatalf("encoding fixture %s: %v", path, err)
		}
		fh.Close()
	}
}

func createTestImage() image.Image {
	img := image.NewRGBA(image.Rect(0, 0, 10, 10))
	for y := 0; y < 10; y++ {
		for x := 0; x < 10; x++ {
			img.Set(x, y, color.RGBA{uint8(x * 25), uint8(y * 25), 128, 255})
		}
	}
	return img
}

func TestConvertRoundTrip(t *testing.T) {
	tests := []struct {
		name   string
		format string
		opts   Options
	}{
		{"to jpeg", "jpeg", Options{Quality: 85}},
		{"to png", "png", Options{}},
		{"to gif", "gif", Options{}},
		{"to bmp", "bmp", Options{}},
		{"to tiff", "tiff", Options{}},
		{"to webp", "webp", Options{}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var pngBuf bytes.Buffer
			if err := encodePNG(createTestImage(), &pngBuf, Options{}); err != nil {
				t.Fatal(err)
			}

			var out bytes.Buffer
			tt.opts.Format = tt.format
			if err := New().Convert(&pngBuf, &out, tt.opts); err != nil {
				t.Fatal(err)
			}

			if out.Len() == 0 {
				t.Fatal("empty output")
			}
		})
	}
}

func TestFormatGrid(t *testing.T) {
	img := createTestImage()

	sources := make(map[string][]byte)
	for f := range formats {
		var buf bytes.Buffer
		if err := formats[f](img, &buf, Options{Quality: 85}); err != nil {
			t.Fatal(err)
		}
		sources[f] = buf.Bytes()
	}

	for srcFmt, srcData := range sources {
		for dstFmt := range formats {
			srcFmt, dstFmt := srcFmt, dstFmt
			t.Run(srcFmt+"_to_"+dstFmt, func(t *testing.T) {
				t.Parallel()

				var out bytes.Buffer
				err := New().Convert(bytes.NewReader(srcData), &out, Options{Format: dstFmt, Quality: 85})
				if err != nil {
					t.Fatal(err)
				}
				if out.Len() == 0 {
					t.Fatal("empty output")
				}
			})
		}
	}
}

func TestResize(t *testing.T) {
	src := createTestImage()
	dst := resize(src, 5, 5)
	bounds := dst.Bounds()
	if bounds.Dx() != 5 || bounds.Dy() != 5 {
		t.Fatalf("expected 5x5, got %dx%d", bounds.Dx(), bounds.Dy())
	}
}

func TestResizePreserveAspectRatio(t *testing.T) {
	src := createTestImage()
	dst := resize(src, 0, 5)
	bounds := dst.Bounds()
	if bounds.Dx() != 5 || bounds.Dy() != 5 {
		t.Fatalf("expected 5x5, got %dx%d", bounds.Dx(), bounds.Dy())
	}
}

func TestFormatFromExt(t *testing.T) {
	tests := []struct {
		path   string
		format string
	}{
		{"out.jpg", "jpeg"},
		{"out.jpeg", "jpeg"},
		{"out.png", "png"},
		{"out.gif", "gif"},
		{"out.bmp", "bmp"},
		{"out.tiff", "tiff"},
		{"out.tif", "tiff"},
		{"/path/to/image.JPG", "jpeg"},
		{"out.webp", "webp"},
		{"out", ""},
		{"out.unknown", ""},
	}

	for _, tt := range tests {
		t.Run(tt.path, func(t *testing.T) {
			if got := FormatFromExt(tt.path); got != tt.format {
				t.Errorf("FormatFromExt(%q) = %q, want %q", tt.path, got, tt.format)
			}
		})
	}
}

func TestConvertRealImages(t *testing.T) {
	entries, err := os.ReadDir("../../testdata/input")
	if err != nil {
		t.Fatal(err)
	}

	var files []string
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		ext := strings.ToLower(filepath.Ext(e.Name()))
		if _, ok := extToFormat[ext]; ok {
			files = append(files, filepath.Join("../../testdata/input", e.Name()))
		}
	}

	if len(files) == 0 {
		t.Skip("no supported test images in testdata/input/")
	}

	formats := []string{"jpeg", "png", "gif", "bmp", "tiff", "webp"}

	for _, srcPath := range files {
		for _, dstFmt := range formats {
			srcPath, dstFmt := srcPath, dstFmt
			t.Run(filepath.Base(srcPath)+"/"+dstFmt, func(t *testing.T) {
				t.Parallel()

				srcFile, err := os.Open(srcPath)
				if err != nil {
					t.Fatal(err)
				}
				defer srcFile.Close()

				var buf bytes.Buffer
				err = New().Convert(srcFile, &buf, Options{Format: dstFmt, Quality: 85})
				if err != nil {
					t.Fatal(err)
				}
				if buf.Len() == 0 {
					t.Fatal("empty output")
				}
			})
		}
	}
}

func TestQualityClamp(t *testing.T) {
	var pngBuf bytes.Buffer
	if err := encodePNG(createTestImage(), &pngBuf, Options{}); err != nil {
		t.Fatal(err)
	}
	src := pngBuf.Bytes()

	tests := []struct {
		name    string
		quality int
	}{
		{"zero", 0},
		{"negative", -5},
		{"over max", 200},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var out bytes.Buffer
			err := New().Convert(bytes.NewReader(src), &out, Options{Format: "jpeg", Quality: tt.quality})
			if err != nil {
				t.Fatal(err)
			}
			if out.Len() == 0 {
				t.Fatal("empty output")
			}
		})
	}
}

func TestConvertDir(t *testing.T) {
	srcDir := t.TempDir()
	dstDir := t.TempDir()

	pairs := map[string]string{"a.png": "png", "b.jpeg": "jpeg"}
	for name, f := range pairs {
		path := filepath.Join(srcDir, name)
		fh, err := os.Create(path)
		if err != nil {
			t.Fatal(err)
		}
		if err := formats[f](createTestImage(), fh, Options{}); err != nil {
			fh.Close()
			t.Fatal(err)
		}
		fh.Close()
	}

	succeeded, total, err := ConvertDir(New(), srcDir, dstDir, Options{Format: "webp", Quality: 85})
	if err != nil {
		t.Fatal(err)
	}
	if succeeded != 2 {
		t.Fatalf("expected 2 files converted, got %d", succeeded)
	}
	if total != 2 {
		t.Fatalf("expected total 2, got %d", total)
	}

	for _, name := range []string{"a.webp", "b.webp"} {
		if _, err := os.Stat(filepath.Join(dstDir, name)); err != nil {
			t.Fatalf("missing output %s", name)
		}
	}
}

func TestConvertDirSkipsUnknownExt(t *testing.T) {
	srcDir := t.TempDir()
	dstDir := t.TempDir()

	fh, _ := os.Create(filepath.Join(srcDir, "note.txt"))
	fh.Close()

	succeeded, total, err := ConvertDir(New(), srcDir, dstDir, Options{Format: "png"})
	if err != nil {
		t.Fatal(err)
	}
	if succeeded != 0 {
		t.Fatalf("expected 0, got %d", succeeded)
	}
	if total != 0 {
		t.Fatalf("expected total 0, got %d", total)
	}
}

func TestUnsupportedFormat(t *testing.T) {
	var buf bytes.Buffer
	err := New().Convert(bytes.NewReader(nil), &buf, Options{Format: "avif"})
	if err == nil {
		t.Fatal("expected error for unsupported format")
	}
}

func TestConvertDirInvalidFormatEarly(t *testing.T) {
	srcDir := t.TempDir()
	dstDir := t.TempDir()

	fh, err := os.Create(filepath.Join(srcDir, "a.png"))
	if err != nil {
		t.Fatal(err)
	}
	if err := encodePNG(createTestImage(), fh, Options{}); err != nil {
		fh.Close()
		t.Fatal(err)
	}
	fh.Close()

	_, _, err = ConvertDir(New(), srcDir, dstDir, Options{Format: "avif"})
	if err == nil {
		t.Fatal("expected error for unsupported batch format")
	}

	entries, _ := os.ReadDir(dstDir)
	if len(entries) != 0 {
		t.Fatal("expected no output files for invalid format")
	}
}

func TestConvertDirCollisionDetected(t *testing.T) {
	srcDir := t.TempDir()
	dstDir := t.TempDir()

	for _, name := range []string{"a.png", "a.jpg"} {
		fh, err := os.Create(filepath.Join(srcDir, name))
		if err != nil {
			t.Fatal(err)
		}
		if err := encodePNG(createTestImage(), fh, Options{}); err != nil {
			fh.Close()
			t.Fatal(err)
		}
		fh.Close()
	}

	_, _, err := ConvertDir(New(), srcDir, dstDir, Options{Format: "webp"})
	if err == nil {
		t.Fatal("expected collision error")
	}
}

func TestConvertDirProgressProcessedCount(t *testing.T) {
	srcDir := t.TempDir()
	dstDir := t.TempDir()

	for _, name := range []string{"a.png", "b.png"} {
		fh, err := os.Create(filepath.Join(srcDir, name))
		if err != nil {
			t.Fatal(err)
		}
		if err := encodePNG(createTestImage(), fh, Options{}); err != nil {
			fh.Close()
			t.Fatal(err)
		}
		fh.Close()
	}

	var processed []int
	opts := Options{Format: "webp", Progress: func(current, total int, srcName, dstName string) {
		processed = append(processed, current)
	}}

	ConvertDir(New(), srcDir, dstDir, opts)

	if len(processed) != 2 {
		t.Fatalf("expected 2 progress calls, got %d", len(processed))
	}
	if processed[0] != 1 || processed[1] != 2 {
		t.Fatalf("expected progress [1, 2], got %v", processed)
	}
}

func TestConvertDirNoPartialOutputOnFailure(t *testing.T) {
	srcDir := t.TempDir()
	dstDir := t.TempDir()

	fh, err := os.Create(filepath.Join(srcDir, "bad.png"))
	if err != nil {
		t.Fatal(err)
	}
	fh.WriteString("not an image")
	fh.Close()

	_, _, err = ConvertDir(New(), srcDir, dstDir, Options{Format: "webp"})
	if err == nil {
		t.Fatal("expected error for invalid image")
	}

	entries, _ := os.ReadDir(dstDir)
	for _, e := range entries {
		if strings.HasSuffix(e.Name(), ".webp") || strings.HasSuffix(e.Name(), ".tmp") {
			t.Fatalf("unexpected partial file: %s", e.Name())
		}
	}
}
