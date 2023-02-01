package plugin

import (
	"time"
)

func time_to_mjd(t time.Time) float64 {
	unix_time := float64(t.UnixMilli())
	return (unix_time/(86400.*1000.) + 40587.)
}

func mjd_to_time(mjd float64) time.Time {
	unix_time := time.UnixMilli(int64((mjd - 40587.) * (86400. * 1000.)))
	return (unix_time)
}
