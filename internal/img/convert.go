package img

import (
	"context"
	"errors"
	"fmt"
	"image"
	"io"
	"os"
	"path/filepath"
	"runtime"
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

type job struct {
	src, dst, srcName, dstName string
}

type result struct {
	srcName, dstName string
	err              error
}

func ConvertDir(ctx context.Context, conv Converter, srcDir, dstDir string, opts Options) (succeeded int, total int, err error) {
	if opts.Format == "" {
		return 0, 0, fmt.Errorf("format is required")
	}
	if _, ok := formats[opts.Format]; !ok {
		return 0, 0, fmt.Errorf("unsupported format: %s", opts.Format)
	}

	entries, err := os.ReadDir(srcDir)
	if err != nil {
		return 0, 0, fmt.Errorf("read src dir: %w", err)
	}

	ext := formatToExt[opts.Format]
	var jobs []job
	dstNames := make(map[string]int)

	for _, entry := range entries {
		if entry.IsDir() || FormatFromExt(entry.Name()) == "" {
			continue
		}
		dstName := strings.TrimSuffix(entry.Name(), filepath.Ext(entry.Name())) + ext
		jobs = append(jobs, job{
			src:     filepath.Join(srcDir, entry.Name()),
			dst:     filepath.Join(dstDir, dstName),
			srcName: entry.Name(),
			dstName: dstName,
		})
		dstNames[dstName]++
	}

	for name, count := range dstNames {
		if count > 1 {
			return 0, 0, fmt.Errorf("output name collision: %d source files would produce %q", count, name)
		}
	}

	total = len(jobs)
	if total == 0 {
		return 0, 0, nil
	}

	if err := os.MkdirAll(dstDir, 0755); err != nil {
		return 0, 0, fmt.Errorf("create dst dir: %w", err)
	}

	numWorkers := opts.Workers
	if numWorkers < 1 {
		numWorkers = runtime.NumCPU() // or 1, depending on your policy
	}

	jobCh := make(chan job, numWorkers)
	resultCh := make(chan result, numWorkers)

	for range numWorkers {
		go func() {
			for j := range jobCh {
				select {
				case <-ctx.Done():
					resultCh <- result{j.srcName, j.dstName, ctx.Err()}
					return
				default:
				}
				resultCh <- result{j.srcName, j.dstName, convertFile(conv, j.src, j.dst, opts)}
			}
		}()
	}

	// Send jobs (respects backpressure due to smaller buffer)
	for _, j := range jobs {
		select {
		case jobCh <- j:
		case <-ctx.Done():
			close(jobCh)
			return 0, total, ctx.Err()
		}
	}
	close(jobCh)

	var (
		succ int
		errs []error
	)
	for i := 0; i < total; i++ {
		r := <-resultCh
		if r.err != nil {
			errs = append(errs, fmt.Errorf("%s: %w", r.srcName, r.err))
		} else {
			succ++
		}
		if opts.Progress != nil {
			opts.Progress(i+1, total, r.srcName, r.dstName)
		}
	}

	if len(errs) > 0 {
		if len(errs) > 1 {
			return succ, total, errors.Join(errs...)
		}
		return succ, total, errs[0]
	}
	return succ, total, nil
}

func convertFile(conv Converter, srcPath, dstPath string, opts Options) error {
	src, err := os.Open(srcPath)
	if err != nil {
		return fmt.Errorf("open source %q: %w", srcPath, err)
	}
	defer src.Close()

	dst, err := os.Create(dstPath)
	if err != nil {
		return fmt.Errorf("create destination %q: %w", dstPath, err)
	}

	// Convert using streams
	err = conv.Convert(src, dst, opts)

	// Check close error (catches flush/sync failures)
	if closeErr := dst.Close(); err == nil && closeErr != nil {
		err = closeErr
	}

	// Clean up partial/corrupt output on failure
	if err != nil {
		os.Remove(dstPath)
		return fmt.Errorf("convert %q: %w", srcPath, err)
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
