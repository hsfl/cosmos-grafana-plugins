package plugin

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

type cosmostype interface {
	avector | qvatt | qaatt
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	url string
}
