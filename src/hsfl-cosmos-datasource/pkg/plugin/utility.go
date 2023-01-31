package plugin

import "time"

func time_to_mjd(t time.Time) float64 {
	unix_time := float64(t.UnixMilli())
	return (unix_time/(86400.*1000.) + 40587.)
}
