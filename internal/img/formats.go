package img

import (
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"io"
	"strings"

	"github.com/HugoSmits86/nativewebp"
	"golang.org/x/image/bmp"
	"golang.org/x/image/tiff"
)

type Encoder func(image.Image, io.Writer, Options) error

var formats map[string]Encoder

func init() {
	formats = map[string]Encoder{
		"png":  encodePNG,
		"jpeg": encodeJPEG,
		"gif":  encodeGIF,
		"bmp":  encodeBMP,
		"tiff": encodeTIFF,
		"webp": encodeWebP,
	}
}

var formatToExt = map[string]string{
	"png":  ".png",
	"jpeg": ".jpg",
	"gif":  ".gif",
	"bmp":  ".bmp",
	"tiff": ".tiff",
	"webp": ".webp",
}

var extToFormat = map[string]string{
	".png":  "png",
	".jpg":  "jpeg",
	".jpeg": "jpeg",
	".gif":  "gif",
	".bmp":  "bmp",
	".tiff": "tiff",
	".tif":  "tiff",
	".webp": "webp",
}

func IsLossless(format string) bool {
	switch format {
	case "png", "gif", "bmp", "tiff", "webp":
		return true
	default:
		return false
	}
}

func FormatFromExt(path string) string {
	ext := strings.ToLower(path)
	i := strings.LastIndexByte(ext, '.')
	if i < 0 {
		return ""
	}
	return extToFormat[ext[i:]]
}

func encodePNG(img image.Image, w io.Writer, _ Options) error {
	return png.Encode(w, img)
}

func encodeJPEG(img image.Image, w io.Writer, opts Options) error {
	return jpeg.Encode(w, img, &jpeg.Options{Quality: opts.Quality})
}

func encodeGIF(img image.Image, w io.Writer, _ Options) error {
	return gif.Encode(w, img, &gif.Options{})
}

func encodeBMP(img image.Image, w io.Writer, _ Options) error {
	return bmp.Encode(w, img)
}

func encodeTIFF(img image.Image, w io.Writer, _ Options) error {
	return tiff.Encode(w, img, &tiff.Options{Compression: tiff.Deflate})
}

func encodeWebP(img image.Image, w io.Writer, _ Options) error {
	return nativewebp.Encode(w, img, nil)
}
