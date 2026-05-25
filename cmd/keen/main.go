package main

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/oreoluwa-bs/keen/internal/img"
	"github.com/spf13/cobra"
)

var Version = "dev"

func main() {
	var opts img.Options

	var rootCmd = &cobra.Command{
		Use:     "keen",
		Short:   "Image converter and compressor",
		Version: Version,
	}

	var convertCmd = &cobra.Command{
		Use:   "convert [src] [dst]",
		Short: "Convert an image to another format",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			src, dst := args[0], args[1]

			if opts.Format == "" {
				opts.Format = img.FormatFromExt(dst)
			} else if cmd.Flags().Changed("format") {
				if got := img.FormatFromExt(dst); got != "" && got != opts.Format {
					fmt.Fprintf(os.Stderr, "warning: output extension %q doesn't match format %q\n", filepath.Ext(dst), opts.Format)
				}
			}

			if cmd.Flags().Changed("quality") && opts.Format != "" && img.IsLossless(opts.Format) {
				fmt.Fprintf(os.Stderr, "warning: --quality is ignored for lossless format %q\n", opts.Format)
			}

			srcData, err := os.ReadFile(src)
			if err != nil {
				return fmt.Errorf("read src: %w", err)
			}

			if !opts.StripExif {
				opts.Orientation = img.ReadEXIFOrientation(srcData)
			}

			dstFile, err := os.Create(dst)
			if err != nil {
				return fmt.Errorf("create dst: %w", err)
			}
			defer dstFile.Close()

			return img.New().Convert(bytes.NewReader(srcData), dstFile, opts)
		},
	}

	var batchCmd = &cobra.Command{
		Use:   "batch [src-dir] [dst-dir]",
		Short: "Convert all images in a directory",
		Long:  "Batch converts all supported images in src-dir to dst-dir using the specified format.",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			src, dst := args[0], args[1]

			if opts.Format == "" {
				return fmt.Errorf("--format is required for batch conversion")
			}

			srcInfo, err := os.Stat(src)
			if err != nil {
				return fmt.Errorf("stat src: %w", err)
			}
			if !srcInfo.IsDir() {
				return fmt.Errorf("src must be a directory")
			}

			opts.Progress = func(current, total int, srcName, dstName string) {
				fmt.Fprintf(os.Stderr, "%s → %s [%d/%d]\n", srcName, dstName, current, total)
			}

			succeeded, total, err := img.ConvertDir(context.Background(), img.New(), src, dst, opts)
			if err != nil {
				return err
			}
			fmt.Fprintf(os.Stderr, "\n%d of %d files converted\n", succeeded, total)
			return nil
		},
	}

	convertCmd.Flags().StringVarP(&opts.Format, "format", "f", "", "Output format (png, jpeg, gif, bmp, tiff, webp)")
	convertCmd.Flags().IntVarP(&opts.Quality, "quality", "q", 85, "Output quality (1-100)")
	convertCmd.Flags().IntVar(&opts.Width, "width", 0, "Resize width (0 = keep original)")
	convertCmd.Flags().IntVar(&opts.Height, "height", 0, "Resize height (0 = keep original)")
	convertCmd.Flags().BoolVar(&opts.StripExif, "strip-exif", false, "Strip EXIF metadata (orientation preserved by default)")

	batchCmd.Flags().StringVarP(&opts.Format, "format", "f", "", "Output format (png, jpeg, gif, bmp, tiff, webp)")
	batchCmd.Flags().IntVarP(&opts.Quality, "quality", "q", 85, "Output quality (1-100)")
	batchCmd.Flags().IntVar(&opts.Width, "width", 0, "Resize width (0 = keep original)")
	batchCmd.Flags().IntVar(&opts.Height, "height", 0, "Resize height (0 = keep original)")
	batchCmd.Flags().BoolVar(&opts.StripExif, "strip-exif", false, "Strip EXIF metadata (orientation preserved by default)")
	batchCmd.Flags().IntVar(&opts.Workers, "workers", 4, "Number of concurrent workers")

	_ = batchCmd.MarkFlagRequired("format")

	rootCmd.AddCommand(convertCmd)
	rootCmd.AddCommand(batchCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
