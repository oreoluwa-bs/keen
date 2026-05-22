package img

import (
	"fmt"
	"image"
	"io"
	"os"
	"path/filepath"
	"strings"

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

func ConvertDir(conv Converter, srcDir, dstDir string, opts Options) (int, error) {
	entries, err := os.ReadDir(srcDir)
	if err != nil {
		return 0, fmt.Errorf("read src dir: %w", err)
	}

	if err := os.MkdirAll(dstDir, 0755); err != nil {
		return 0, fmt.Errorf("create dst dir: %w", err)
	}

	type job struct {
		src     string
		dst     string
		srcName string
		dstName string
	}

	type result struct {
		srcName string
		dstName string
		err     error
	}

	var jobs []job
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		srcPath := filepath.Join(srcDir, entry.Name())
		if FormatFromExt(srcPath) == "" {
			continue
		}
		ext := formatToExt[opts.Format]
		dstName := strings.TrimSuffix(entry.Name(), filepath.Ext(entry.Name())) + ext
		dstPath := filepath.Join(dstDir, dstName)
		jobs = append(jobs, job{srcPath, dstPath, entry.Name(), dstName})
	}

	total := len(jobs)
	if total == 0 {
		return 0, nil
	}

	numWorkers := opts.Workers
	if numWorkers < 1 {
		numWorkers = 1
	}

	jobCh := make(chan job, total)
	resultCh := make(chan result, total)

	for range numWorkers {
		go func() {
			for j := range jobCh {
				srcFile, err := os.Open(j.src)
				if err != nil {
					resultCh <- result{j.srcName, j.dstName, fmt.Errorf("open: %w", err)}
					continue
				}

				dstFile, err := os.Create(j.dst)
				if err != nil {
					srcFile.Close()
					resultCh <- result{j.srcName, j.dstName, fmt.Errorf("create: %w", err)}
					continue
				}

				err = conv.Convert(srcFile, dstFile, opts)
				srcFile.Close()
				dstFile.Close()
				resultCh <- result{j.srcName, j.dstName, err}
			}
		}()
	}

	for _, j := range jobs {
		jobCh <- j
	}
	close(jobCh)

	var count int
	var errs []error
	for range total {
		r := <-resultCh
		if r.err != nil {
			errs = append(errs, fmt.Errorf("%s: %w", r.srcName, r.err))
		} else {
			count++
		}
		if opts.Progress != nil {
			opts.Progress(count, total, r.srcName, r.dstName)
		}
	}

	if len(errs) > 0 {
		return count, fmt.Errorf("%d of %d files failed; first error: %w", len(errs), total, errs[0])
	}

	return count, nil
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
