package img

import (
	"fmt"
	"image"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"

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

func ConvertDir(conv Converter, srcDir, dstDir string, opts Options) (succeeded int, total int, err error) {
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

	if err := os.MkdirAll(dstDir, 0755); err != nil {
		return 0, 0, fmt.Errorf("create dst dir: %w", err)
	}

	type job struct {
		src     string
		dst     string
		srcName string
		dstName string
	}

	var jobs []job
	dstNames := make(map[string]int)

	ext := formatToExt[opts.Format]
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		srcPath := filepath.Join(srcDir, entry.Name())
		if FormatFromExt(srcPath) == "" {
			continue
		}
		dstName := strings.TrimSuffix(entry.Name(), filepath.Ext(entry.Name())) + ext
		dstPath := filepath.Join(dstDir, dstName)
		jobs = append(jobs, job{srcPath, dstPath, entry.Name(), dstName})
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

	numWorkers := opts.Workers
	if numWorkers < 1 {
		numWorkers = 1
	}

	type result struct {
		srcName string
		dstName string
		err     error
	}

	jobCh := make(chan job, total)
	resultCh := make(chan result, total)

	for range numWorkers {
		go func() {
			for j := range jobCh {
				err := convertFile(conv, j.src, j.dst, opts)
				resultCh <- result{j.srcName, j.dstName, err}
			}
		}()
	}

	for _, j := range jobs {
		jobCh <- j
	}
	close(jobCh)

	var (
		mu        sync.Mutex
		processed int
		succ      int
		errs      []error
	)

	for range total {
		r := <-resultCh
		mu.Lock()
		processed++
		if r.err != nil {
			errs = append(errs, fmt.Errorf("%s: %w", r.srcName, r.err))
		} else {
			succ++
		}
		if opts.Progress != nil {
			opts.Progress(processed, total, r.srcName, r.dstName)
		}
		mu.Unlock()
	}

	if len(errs) > 0 {
		return succ, total, fmt.Errorf("%d of %d files failed; first error: %w", len(errs), total, errs[0])
	}

	return succ, total, nil
}

func convertFile(conv Converter, srcPath, dstPath string, opts Options) error {
	srcFile, err := os.Open(srcPath)
	if err != nil {
		return fmt.Errorf("open: %w", err)
	}
	defer srcFile.Close()

	dstDir := filepath.Dir(dstPath)
	tmpFile, err := os.CreateTemp(dstDir, "*.tmp")
	if err != nil {
		return fmt.Errorf("create temp: %w", err)
	}
	tmpPath := tmpFile.Name()

	err = conv.Convert(srcFile, tmpFile, opts)
	tmpFile.Close()
	if err != nil {
		os.Remove(tmpPath)
		return fmt.Errorf("convert: %w", err)
	}

	if err := os.Rename(tmpPath, dstPath); err != nil {
		os.Remove(tmpPath)
		return fmt.Errorf("rename: %w", err)
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
