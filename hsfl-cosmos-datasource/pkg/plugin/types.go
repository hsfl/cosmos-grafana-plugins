package plugin

// JSON model of Grafana Backend Datasource config
type datasourceConfig struct {
	UsingHostname bool   `json:"usingHostname"`
	Url           string `json:"url,omitempty"`
}

// JSON response from Cosmos Backend call
type jsonResponse struct {
	Message string    `json:"message"`
	Payload []avector `json:"payload,omitempty"`
}

type avector struct {
	Time string
	H    float64 `json:"h"`
	E    float64 `json:"e"`
	B    float64 `json:"b"`
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	url string
}
