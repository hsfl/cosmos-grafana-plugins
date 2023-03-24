package plugin

type queryModel struct {
	QueryText string `json:"queryText"`
	TypeText  string `json:"typeText"`
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
	Avectors  []avector  `json:"avectors,omitempty"`
	Qvatts    []qvatt    `json:"qvatts,omitempty"`
	Qaatts    []qaatt    `json:"qaatts,omitempty"`
	Ecis      []eci      `json:"ecis,omitempty"`
	Batts     []batt     `json:"batts,omitempty"`
	Bcregs    []bcreg    `json:"bcregs,omitempty"`
	Tsens     []tsen     `json:"tsens,omitempty"`
	Cpus      []cpu      `json:"cpus,omitempty"`
	Events    []event    `json:"events,omitempty"`
	Mags      []mag      `json:"mags,omitempty"`
	Geods     []geod     `json:"geods,omitempty"`
	Geoss     []geos     `json:"geoss,omitempty"`
	Lvlhs     []lvlh     `json:"lvlhs,omitempty"`
	Geoidposs []geoidpos `json:"geoidposs,omitempty"`
	Spherposs []spherpos `json:"spherposs,omitempty"`
	Qatts     []qatt     `json:"qatts,omitempty"`
}

type avector struct {
	Time float64
	H    float64 `json:"h,omitempty"`
	E    float64 `json:"e,omitempty"`
	B    float64 `json:"b,omitempty"`
}

type qvatt struct {
	Time float64
	Qvx  float64 `json:"qvx"`
	Qvy  float64 `json:"qvy"`
	Qvz  float64 `json:"qvz"`
}

type qaatt struct {
	Time float64
	Qax  float64 `json:"qax"`
	Qay  float64 `json:"qay"`
	Qaz  float64 `json:"qaz"`
}

type eci struct {
	Time float64
	S_x  float64 `json:"s_x"`
	S_y  float64 `json:"s_y"`
	S_z  float64 `json:"s_z"`
	V_x  float64 `json:"v_x"`
	V_y  float64 `json:"v_y"`
	V_z  float64 `json:"v_z"`
	A_x  float64 `json:"a_x"`
	A_y  float64 `json:"a_y"`
	A_z  float64 `json:"a_z"`
}

type batt struct {
	Time  float64
	Node  string  `json:"node"`
	Amp   float64 `json:"amp"`
	Power float64 `json:"power"`
}

type bcreg struct {
	Time  float64
	Node  string  `json:"node"`
	Amp   float64 `json:"amp"`
	Power float64 `json:"power"`
}

type tsen struct {
	Time        float64
	Node_Device string  `json:"node:device,omitempty"`
	Temp        float64 `json:"temp,omitempty"`
}

type cpu struct {
	Time    float64
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

type geod struct {
	Time  float64
	S_lat float64 `json:"s_lat,omitempty"`
	S_lon float64 `json:"s_lon,omitempty"`
	S_h   float64 `json:"s_h,omitempty"`
	V_lat float64 `json:"v_lat,omitempty"`
	V_lon float64 `json:"v_lon,omitempty"`
	V_h   float64 `json:"v_h,omitempty"`
	A_lat float64 `json:"a_lat,omitempty"`
	A_lon float64 `json:"a_lon,omitempty"`
	A_h   float64 `json:"a_h,omitempty"`
}

type geos struct {
	Time     float64
	S_phi    float64 `json:"s_phi,omitempty"`
	S_lambda float64 `json:"s_lambda,omitempty"`
	S_r      float64 `json:"s_r,omitempty"`
	V_phi    float64 `json:"v_phi,omitempty"`
	V_lambda float64 `json:"v_lambda,omitempty"`
	V_r      float64 `json:"v_r,omitempty"`
	A_phi    float64 `json:"a_phi,omitempty"`
	A_lambda float64 `json:"a_lambda,omitempty"`
	A_r      float64 `json:"a_r,omitempty"`
}

type lvlh struct {
	Time  float64
	S_d_x float64 `json:"s_d_x,omitempty"`
	S_d_y float64 `json:"s_d_y,omitempty"`
	S_d_z float64 `json:"s_d_z,omitempty"`
	S_w   float64 `json:"s_w,omitempty"`
	V_x   float64 `json:"v_x,omitempty"`
	V_y   float64 `json:"v_y,omitempty"`
	V_z   float64 `json:"v_z,omitempty"`
	A_x   float64 `json:"a_x,omitempty"`
	A_y   float64 `json:"a_y,omitempty"`
	A_z   float64 `json:"a_z,omitempty"`
}

type gvector struct {
	Lat float64 `json:"lat,omitempty"`
	Lon float64 `json:"lon,omitempty"`
	H   float64 `json:"h,omitempty"`
}

type geoidpos struct {
	Time float64
	S    gvector `json:"s,omitempty"`
	V    gvector `json:"v,omitempty"`
	A    gvector `json:"a,omitempty"`
}

type svector struct {
	Phi    float64 `json:"phi,omitempty"`
	Lambda float64 `json:"lambda,omitempty"`
	R      float64 `json:"r,omitempty"`
}

type spherpos struct {
	Time float64
	S    svector `json:"s,omitempty"`
	V    svector `json:"v,omitempty"`
	A    svector `json:"a,omitempty"`
}

type rvector struct {
	Col [3]float64 `json:"col,omitempty"`
}

type cvector struct {
	X float64 `json:"x,omitempty"`
	Y float64 `json:"y,omitempty"`
	Z float64 `json:"z,omitempty"`
}

type quaternion struct {
	D cvector `json:"d,omitempty"`
	W float64 `json:"w,omitempty"`
}

type qatt struct {
	Time float64
	S    quaternion `json:"s,omitempty"`
	V    rvector    `json:"v,omitempty"`
	A    rvector    `json:"a,omitempty"`
}

type cosmostype interface {
	avector | qvatt | qaatt | eci | batt | bcreg | tsen | cpu | event | mag | geod | geos | lvlh | gvector | geoidpos | svector | spherpos | rvector | cvector | quaternion | qatt
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	url string
}
