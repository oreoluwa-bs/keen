package img

import (
	"bytes"
	"testing"
)

func BenchmarkEncode(b *testing.B) {
	img := createTestImage()

	for name := range formats {
		name := name
		b.Run(name, func(b *testing.B) {
			var buf bytes.Buffer
			b.ResetTimer()

			for range b.N {
				buf.Reset()
				if err := formats[name](img, &buf, Options{Quality: 85}); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}

func BenchmarkConvert(b *testing.B) {
	var pngBuf bytes.Buffer
	if err := encodePNG(createTestImage(), &pngBuf, Options{}); err != nil {
		b.Fatal(err)
	}
	src := pngBuf.Bytes()
	conv := New()

	for name := range formats {
		name := name
		b.Run(name, func(b *testing.B) {
			var dst bytes.Buffer
			b.ResetTimer()

			for range b.N {
				dst.Reset()
				if err := conv.Convert(bytes.NewReader(src), &dst, Options{Format: name, Quality: 85}); err != nil {
					b.Fatal(err)
				}
			}
		})
	}
}
