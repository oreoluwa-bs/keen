package img

type ProgressFunc func(current, total int, srcName, dstName string)

type Options struct {
	Format   string
	Quality  int
	Width    int
	Height   int
	Strip    bool
	Workers  int
	Progress ProgressFunc
}
