package plugin

// Query sent from front end's Query Editor, mirror of the MyQuery interface in types.ts
type queryModel struct {
	Type       string          `json:"type"`
	Arg        string          `json:"arg"`
	LatestOnly bool            `json:"latestOnly"`
	Filters    []queryFilter   `json:"filters"`
	Functions  []queryFunction `json:"functions"`
}

// From types.ts
type queryFilter struct {
	FilterType  string `json:"filterType"`
	CompareType string `json:"compareType"`
	FilterValue string `json:"filterValue"`
}

// From types.ts
type queryFunction struct {
	FunctionType string   `json:"functionType"`
	Args         []string `json:"args"`
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
	Adcsstrucs  []adcsstruc  `json:"adcsstrucs,omitempty"`
	Ladcsstrucs  []ladcsstruc  `json:"lvlhadcsstrucs,omitempty"`
	Gadcsstrucs  []gadcsstruc  `json:"geocadcsstrucs,omitempty"`
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
	Svectors  []svector  `json:"svectors,omitempty"`
	Qatts     []qatt     `json:"qatts,omitempty"`
	CommandHistory []command_history `json:"command_history,omitempty"`
}

// TODO delete this type, determine all panels that use it, update to real struc
type avector struct {
	Time      float64
	Node_name string
	Node_type float64
	H         float64 `json:"h,omitempty"`
	E         float64 `json:"e,omitempty"`
	B         float64 `json:"b,omitempty"`
}

type real_avector struct {
	H float64 `json:"h,omitempty"`
	E float64 `json:"e,omitempty"`
	B float64 `json:"b,omitempty"`
}

type adcsstruc struct {
	Time      float64
	Node_name string
	Node_type float64
	S         real_avector `json:"s,omitempty"`
	V         rvector `json:"v,omitempty"`
	A         rvector `json:"a,omitempty"`
	Sun 	  rvector `json:"sun,omitempty"`
	Nad 	  rvector `json:"nad,omitempty"`
}

type ladcsstruc struct {
	Time      float64
	Node_name string
	Node_type float64
	ICRF_S    real_avector `json:"icrfs,omitempty"`
	S         real_avector `json:"s,omitempty"`
	V         rvector `json:"v,omitempty"`
	A         rvector `json:"a,omitempty"`
	Sun 	  rvector `json:"sun,omitempty"`
	Nad 	  rvector `json:"nad,omitempty"`
	Sqatt 	  quaternion `json:"sqatt,omitempty"`
}

type gadcsstruc struct {
	Time      float64
	Node_name string
	Node_type float64
	ICRF_S    real_avector `json:"icrfs,omitempty"`
	S         real_avector `json:"s,omitempty"`
	V         rvector `json:"v,omitempty"`
	A         rvector `json:"a,omitempty"`
	Sun 	  rvector `json:"sun,omitempty"`
	Nad 	  rvector `json:"nad,omitempty"`
	Sqatt 	  quaternion `json:"sqatt,omitempty"`
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
	Time      float64
	Node_name string
	Node_type float64
	S_x       float64 `json:"s_x"`
	S_y       float64 `json:"s_y"`
	S_z       float64 `json:"s_z"`
	V_x       float64 `json:"v_x"`
	V_y       float64 `json:"v_y"`
	V_z       float64 `json:"v_z"`
	A_x       float64 `json:"a_x"`
	A_y       float64 `json:"a_y"`
	A_z       float64 `json:"a_z"`
}

type batt struct {
	Time       float64
	Node_name  string  `json:"node_name"`
	Name       string  `json:"name"`
	Amp        float64 `json:"amp,omitempty"`
	Volt       float64 `json:"volt,omitempty"`
	Power      float64 `json:"power,omitempty"`
	Temp       float64 `json:"temp,omitempty"`
	Percentage float64 `json:"percentage,omitempty"`
}

type bcreg struct {
	Time         float64
	Node_name    string  `json:"node_name"`
	Name         string  `json:"name"`
	Amp          float64 `json:"amp,omitempty"`
	Volt         float64 `json:"volt,omitempty"`
	Power        float64 `json:"power,omitempty"`
	Temp         float64 `json:"temp,omitempty"`
	Mpptin_amp   float64 `json:"mpptin_amp,omitempty"`
	Mpptin_volt  float64 `json:"mpptin_volt,omitempty"`
	Mpptout_amp  float64 `json:"mpptout_amp,omitempty"`
	Mpptout_volt float64 `json:"mpptout_volt,omitempty"`
}

type cpu struct {
	Time       float64
	Node_name  string  `json:"node_name"`
	Name       string  `json:"name"`
	Temp       float64 `json:"temp"`
	Uptime     float64 `json:"uptime"`
	Load       float64 `json:"load"`
	Gib        float64 `json:"gib"`
	Boot_count float64 `json:"boot_count"`
	Storage    float64 `json:"storage"`
}

type tsen struct {
	Time      float64
	Node_name string  `json:"node_name"`
	Name      string  `json:"name"`
	Temp      float64 `json:"temp,omitempty"`
}

type event struct {
	Time       float64
	Node_name  string `json:"node_name,omitempty"`
	Duration   float64 `json:"duration,omitempty"`
	Event_id   uint8  `json:"event_id,omitempty"`
	Type       uint32 `json:"type,omitempty"`
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
	Time      float64
	Node_name string
	Node_type float64
	S         gvector `json:"s,omitempty"`
	V         gvector `json:"v,omitempty"`
	A         gvector `json:"a,omitempty"`
}

type svector struct {
	Time      float64 `json:"Time,omitempty"` // TODO: consider nested structs better?
	Node_name string  `json:"Node_name,omitempty"`
	Node_type float64 `json:"Node_type,omitempty"`
	Phi       float64 `json:"phi,omitempty"`
	Lambda    float64 `json:"lambda,omitempty"`
	R         float64 `json:"r,omitempty"`
}

type spherpos struct {
	Time      float64
	Node_name string
	Node_type float64
	S         svector `json:"s,omitempty"`
	V         svector `json:"v,omitempty"`
	A         svector `json:"a,omitempty"`
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
	Time      float64
	Node_name string
	Node_type float64
	S         quaternion `json:"s,omitempty"`
	V         rvector    `json:"v,omitempty"`
	A         rvector    `json:"a,omitempty"`
}

type command_history struct {
	Time    float64
	Id      uint32 `json:"id"`
	Command string `json:"command,omitempty"`
}

type cosmostype interface {
	avector | real_avector | adcsstruc | ladcsstruc | gadcsstruc | qvatt | qaatt | eci | batt | bcreg | tsen | cpu | event | mag | geod | geos | lvlh | gvector | geoidpos | svector | spherpos | rvector | cvector | quaternion | qatt | command_history
}

// Datasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type Datasource struct {
	url string
}

// JSON response from Cosmos Backend call
type AgentRequestPayload struct {
	Request string `json:"request"`
	Node    string `json:"node"`
	Agent   string `json:"agent"`
}

type BackendAPIResponse struct {
	Message string `json:"message"`
}
