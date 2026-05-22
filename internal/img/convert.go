package img

import (
	"fmt"
	"image"
	"io"

	"golang.org/x/image/draw"
)

type Converter interface {
	Convert(src io.Reader, dst io.Writer, opts Options) error
}

type converter struct{}

func New() Converter {
	return &converter{}
}

func (c *converter) Convert(src io.Reader, dst io.Writer, opts Options) error {
	if opts.Quality < 1 {
		opts.Quality = 1
	}
	if opts.Quality > 100 {
		opts.Quality = 100
	}

	srcImg, _, err := image.Decode(src)
	if err != nil {
		return fmt.Errorf("decode: %w", err)
	}

	if opts.Width > 0 || opts.Height > 0 {
		srcImg = resize(srcImg, opts.Width, opts.Height)
	}

	enc, ok := formats[opts.Format]
	if !ok {
		return fmt.Errorf("unsupported format: %s", opts.Format)
	}

	if err := enc(srcImg, dst, opts); err != nil {
		return fmt.Errorf("encode: %w", err)
	}

	return nil
}

func resize(src image.Image, width, height int) image.Image {
	bounds := src.Bounds()
	srcW := bounds.Dx()
	srcH := bounds.Dy()

	if srcW <= 0 || srcH <= 0 || (width <= 0 && height <= 0) {
		return src
	}

	// Preserve aspect ratio using floating-point math to avoid truncation/overflow
	if width == 0 {
		width = int(float64(srcW) * float64(height) / float64(srcH))
	}
	if height == 0 {
		height = int(float64(srcH) * float64(width) / float64(srcW))
	}

	dst := image.NewRGBA(image.Rect(0, 0, width, height))
	draw.ApproxBiLinear.Scale(dst, dst.Rect, src, bounds, draw.Over, nil)
	return dst
}
