package img

import (
	"bytes"
	"image"
	"image/color"
	"testing"
)

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

func TestUnsupportedFormat(t *testing.T) {
	var buf bytes.Buffer
	err := New().Convert(bytes.NewReader(nil), &buf, Options{Format: "avif"})
	if err == nil {
		t.Fatal("expected error for unsupported format")
	}
}
