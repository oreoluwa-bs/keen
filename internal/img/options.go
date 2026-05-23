package img

type ProgressFunc func(current, total int, srcName, dstName string)

type Options struct {
	Format      string
	Quality     int
	Width       int
	Height      int
	Strip       bool
	StripExif   bool
	Orientation int
	Workers     int
	Progress    ProgressFunc
}
