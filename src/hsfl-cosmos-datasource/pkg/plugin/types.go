package plugin

type queryModel struct {
	QueryText string `json:"queryText"`
}

// JSON model of Grafana Backend Datasource config
type datasourceConfig struct {
	UsingHostname bool   `json:"usingHostname"`
	Url           string `json:"url,omitempty"`
}

// JSON response from Cosmos Backend call
type jsonResponse struct {
	Message string         `json:"message"`
	Payload Cosmosresponse `json:"payload,omitempty"`
}

type Cosmosresponse struct {
	Avectors []avector `json:"avectors,omitempty"`
	Qvatts   []qvatt   `json:"qvatts,omitempty"`
	Qaatts   []qaatt   `json:"qaatts,omitempty"`
	Ecis     []eci     `json:"ecis,omitempty"`
	Batts    []batt    `json:"batts,omitempty"`
	Bcregs   []bcreg   `json:"bcregs,omitempty"`
	Tsens    []tsen    `json:"tsens,omitempty"`
	Cpus     []cpu     `json:"cpus,omitempty"`
	Events   []event   `json:"events,omitempty"`
	Mags     []mag     `json:"mags,omitempty"`
}

type avector struct {
	Time string
	H    float64 `json:"h,omitempty"`
	E    float64 `json:"e,omitempty"`
	B    float64 `json:"b,omitempty"`
}

type qvatt struct {
	Time string
	Qvx  float64 `json:"qvx"`
	Qvy  float64 `json:"qvy"`
	Qvz  float64 `json:"qvz"`
}

type qaatt struct {
	Time string
	Qax  float64 `json:"qax"`
	Qay  float64 `json:"qay"`
	Qaz  float64 `json:"qaz"`
}

type eci struct {
	Time string
	Sx   float64 `json:"sx"`
	Sy   float64 `json:"sy"`
	Sz   float64 `json:"sz"`
}

type batt struct {
	Time  string
	Node  string  `json:"node"`
	Amp   float64 `json:"amp"`
	Power float64 `json:"power"`
}

type bcreg struct {
	Time  string
	Node  string  `json:"node"`
	Amp   float64 `json:"amp"`
	Power float64 `json:"power"`
}

type tsen struct {
	Time      float64
	Node_name string  `json:"node_name,omitempty"`
	Didx      uint8   `json:"didx,omitempty"`
	Temp      float64 `json:"temp,omitempty"`
}

type cpu struct {
	Time    string
	Node    string  `json:"node"`
	Load    float64 `json:"load"`
	Gib     float64 `json:"gib"`
	Storage float64 `json:"storage"`
}

type event struct {
	Time       float64
	Node_name  string `json:"node_name,omitempty"`
	Duration   uint32 `json:"duration,omitempty"`
	Event_id   uint8  `json:"event_id,omitempty"`
	Event_name string `json:"event_name,omitempty"`
}

type mag struct {
	Time      float64
	Node_name string  `json:"node_name,omitempty"`
	Didx      uint8   `json:"didx,omitempty"`
	Mag_x     float64 `json:"mag_x,omitempty"`
	Mag_y     float64 `json:"mag_y,omitempty"`
	Mag_z     float64 `json:"mag_z,omitempty"`
}

type cosmostype interface {
	avector | qvatt | qaatt | eci | batt | bcreg | tsen | cpu | event | mag
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	url string
}
