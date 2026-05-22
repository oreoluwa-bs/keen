package main

import (
	"fmt"
	"os"

	"github.com/oreoluwa-bs/keen/internal/img"
	"github.com/spf13/cobra"
)

func main() {
	var opts img.Options

	var rootCmd = &cobra.Command{
		Use:   "keen",
		Short: "Image converter and compressor",
	}

	var convertCmd = &cobra.Command{
		Use:   "convert [src] [dst]",
		Short: "Convert an image to another format",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			src, dst := args[0], args[1]

			if opts.Format == "" {
				opts.Format = img.FormatFromExt(dst)
			}

			srcFile, err := os.Open(src)
			if err != nil {
				return fmt.Errorf("open src: %w", err)
			}
			defer srcFile.Close()

			dstFile, err := os.Create(dst)
			if err != nil {
				return fmt.Errorf("create dst: %w", err)
			}
			defer dstFile.Close()

			return img.New().Convert(srcFile, dstFile, opts)
		},
	}

	convertCmd.Flags().StringVarP(&opts.Format, "format", "f", "", "Output format (png, jpeg, gif, bmp, tiff, webp)")
	convertCmd.Flags().IntVarP(&opts.Quality, "quality", "q", 85, "Output quality (1-100)")
	convertCmd.Flags().IntVar(&opts.Width, "width", 0, "Resize width (0 = keep original)")
	convertCmd.Flags().IntVar(&opts.Height, "height", 0, "Resize height (0 = keep original)")
	convertCmd.Flags().BoolVar(&opts.Strip, "strip", false, "Strip metadata")

	rootCmd.AddCommand(convertCmd)

	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
