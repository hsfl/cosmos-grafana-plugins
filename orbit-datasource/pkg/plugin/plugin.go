package plugin

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math"
	"math/rand"
	"net"
	"net/http"
	"time"

	"github.com/influxdata/influxdb-client-go/v2/api"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// Make sure SampleDatasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler, backend.StreamHandler interfaces. Plugin should not
// implement all these interfaces - only those which are required for a particular task.
// For example if plugin does not need streaming functionality then you are free to remove
// methods that implement backend.StreamHandler. Implementing instancemgmt.InstanceDisposer
// is useful to clean up resources used by previous datasource instance when a new datasource
// instance created upon datasource settings changed.
var (
	_ backend.QueryDataHandler      = (*SampleDatasource)(nil)
	_ backend.CallResourceHandler   = (*SampleDatasource)(nil)
	_ backend.CheckHealthHandler    = (*SampleDatasource)(nil)
	_ backend.StreamHandler         = (*SampleDatasource)(nil)
	_ instancemgmt.InstanceDisposer = (*SampleDatasource)(nil)
)

// NewSampleDatasource creates a new datasource instance.
func NewSampleDatasource(_ backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	return &SampleDatasource{}, nil
}

// SampleDatasource is an example datasource which can respond to data queries, reports
// its health and has streaming skills.
type SampleDatasource struct {
	backend.CallResourceHandler
}

// Support HTTP API for backend
func (d *SampleDatasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	switch req.Path {
	case "namespaces":
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusOK,
			Body:   []byte("Namespaces!"),
		})
	// Used by upload-json-telegraf plugin, req.Body is a JSON-encoded string in byte form
	case "jsonupload":
		err := SendToTelegraf(string(req.Body))
		if err != nil {
			return sender.Send(&backend.CallResourceResponse{
				Status: http.StatusInternalServerError,
				Body:   []byte("Encountered an error"),
			})
		}
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusOK,
			Body:   []byte("Successfully uploaded JSON to database!"),
		})
	case "propagator_db":
		response, err := SendToCOSMOSWeb(req.Body)
		if err != nil {
			return sender.Send(&backend.CallResourceResponse{
				Status: http.StatusInternalServerError,
				Body:   []byte("Encountered an error:" + err.Error()),
			})
		}
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusOK,
			Body:   []byte(response),
		})
	default:
		return sender.Send(&backend.CallResourceResponse{
			Status: http.StatusOK,
			Body:   []byte("Default!"),
		})
	}
}

// Send JSON to Telegraf endpoint
// msg: json encoded string
func SendToTelegraf(msg string) error {
	// This is the telegraf simdata port
	// Attempt tcp connection (UDP packets have a size limit)
	const TELEGRAF_PORT int = 10097
	url := "cosmos_telegraf:" + fmt.Sprint(TELEGRAF_PORT)
	conn, err := net.Dial("tcp", url)
	if err != nil {
		log.DefaultLogger.Error("TCP connect error", err.Error())
		return err
	}
	defer conn.Close()
	// Send message
	_, err = fmt.Fprintf(conn, msg)
	if err != nil {
		log.DefaultLogger.Error("TCP send error", err.Error())
		return err
	}

	return nil
}

// Send JSON to COSMOS Web backend api endpoint
// msg: json encoded string
func SendToCOSMOSWeb(data []byte) (string, error) {
	// This is the cosmos web api port
	const COSMOSWEBBACKEND_PORT int = 10090
	// Convert docker's network hostname to an actual ip address
	host := "cosmos_web_backend"
	addr, err := net.LookupIP(host)
	if err != nil {
		log.DefaultLogger.Error("Host to IP error", err.Error())
		return "", err
	}
	// use the ip instead of the hostname
	url := fmt.Sprintf("http://%s:%d/sim/propagator_db", fmt.Sprint(addr[0]), COSMOSWEBBACKEND_PORT)
	return APICall(data, url)
}

// msg: json encoded string
// endpoint: URL of API endpoint
func APICall(data []byte, endpoint string) (string, error) {
	// Attempt tcp connection (UDP packets have a size limit)
	buf := bytes.NewBuffer(data)
	resp, err := http.Post(endpoint, "application/json", buf)
	// POST
	if err != nil {
		log.DefaultLogger.Error("Error in POST", err.Error())
		return "", err
	}
	defer resp.Body.Close()
	// Read response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.DefaultLogger.Error("Error reading body of POST response", err.Error())
	}

	return string(body), nil
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *SampleDatasource) Dispose() {
	// Clean up datasource instance resources.
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *SampleDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	log.DefaultLogger.Info("QueryData called", "request", req)

	// create response struct
	response := backend.NewQueryDataResponse()

	// Create new influxdb client
	//var client influxdb2.Options
	client := influxdb2.NewClient("http://influxdb:8086", "INFLUXDBINITADMINTOKEN")
	queryAPI := client.QueryAPI("hsfl")

	// loop over queries and execute them individually.
	for _, q := range req.Queries {
		res := d.query(ctx, queryAPI, req.PluginContext, q)

		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	client.Close()

	return response, nil
}

type queryModel struct {
	// WithStreaming bool `json:"withStreaming"`
	IsSimMode   bool               `json:"isSimMode"`
	SimNodeList []propagator_args  `json:"simNodeList"`
	OpNodeList  []operational_args `json:"opNodeList"`
}

// Send an array of these to the propagator
type propagator_args struct {
	Name  string `json:"name"`
	Frame string `json:"frame"`
}

// Use with query to Influxdb
type operational_args struct {
	Name      string `json:"name"`
	Tag_name  string `json:"tag_name"`
	Tag_value string `json:"tag_value"`
	Px        string `json:"px"`
	Py        string `json:"py"`
	Pz        string `json:"pz"`
	Vx        string `json:"vx"`
	Vy        string `json:"vy"`
	Vz        string `json:"vz"`
}

var buffer = make([]byte, 60000)

type czmlPosition struct {
	Interval       string        `json:"interval,omitempty"`
	Epoch          string        `json:"epoch,omitempty"`
	Cartesian      []interface{} `json:"cartesian"`
	ReferenceFrame string        `json:"referenceFrame,omitempty"`
}

type czmlColor struct {
	Rgba [4]int32 `json:"rgba"`
}
type czmlPoint struct {
	Color        czmlColor  `json:"color"`
	OutlineColor *czmlColor `json:"outlineColor,omitempty"`
	OutlineWidth float64    `json:"outlineWidth,omitempty"`
	PixelSize    float64    `json:"pixelSize"`
}

type czmlModel struct {
	Gltf             string  `json:"gltf"`
	Scale            float64 `json:"scale"`
	MinimumPixelSize float64 `json:"minimumPixelSize,omitempty"`
}

type czmlPolylineOutline struct {
	Color        czmlColor  `json:"color"`
	OutlineColor *czmlColor `json:"outlineColor,omitempty"`
	OutlineWidth float64    `json:"outlineWidth,omitempty"`
}

type czmlMaterial struct {
	PolylineOutline czmlPolylineOutline `json:"polylineOutline"`
}
type czmlPath struct {
	Material   czmlMaterial `json:"material"`
	Width      float64      `json:"width"`
	LeadTime   float64      `json:"leadTime,omitempty"`
	TrailTime  float64      `json:"trailTime,omitempty"`
	Resolution float64      `json:"resolution,omitempty"`
}

type czmlClock struct {
	Interval    string `json:"interval,omitempty"`
	CurrentTime string `json:"currentTime,omitempty"`
	Multiplier  int32  `json:"multiplier,omitempty"`
	Range       string `json:"range,omitempty"`
	Step        string `json:"step,omitempty"`
}

type czmlStruct struct {
	Id           string        `json:"id"`
	Name         string        `json:"name,omitempty"`
	Version      string        `json:"version,omitempty"`
	Availability string        `json:"availability,omitempty"`
	Position     *czmlPosition `json:"position,omitempty"`
	Point        *czmlPoint    `json:"point,omitempty"`
	Model        *czmlModel    `json:"model,omitempty"`
	Path         *czmlPath     `json:"path,omitempty"`
	Clock        *czmlClock    `json:"clock,omitempty"` // For the document packet to define clock settings for the whole dataset
	// This is not marshalled into json, it is only for holding velocity values for the latest timestamp
	vel [3]float64
}

func (d *SampleDatasource) query(_ context.Context, queryAPI api.QueryAPI, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	response := backend.DataResponse{}

	// Unmarshal the front-end query option JSON into our queryModel.
	var qm queryModel

	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}
	log.DefaultLogger.Info("queryModel", "qm", qm)

	// Perform different tasks depending on run mode: simulation or non-simulation
	if qm.IsSimMode {
		response = d.SimMode(qm, queryAPI, pCtx)
	} else {
		response = d.OperationalMode(qm, queryAPI, pCtx)
	}

	return response
}

// Simulation takes a set of initial conditions and propagates a full orbit with the orbital propagator
func (d *SampleDatasource) SimMode(qm queryModel, queryAPI api.QueryAPI, pCtx backend.PluginContext) backend.DataResponse {
	response := backend.DataResponse{}

	// create data frame response.
	frame := data.NewFrame("response")

	nameList := ""
	for idx, elem := range qm.SimNodeList {
		nameList += elem.Name
		if idx < len(qm.SimNodeList)-1 {
			nameList += "|"
		}
	}

	// TODO: make smarter
	fieldList := fmt.Sprintf(`%s|%s|%s|%s|%s|%s|%s`,
		"utc",
		"eci.px",
		"eci.py",
		"eci.pz",
		"eci.vx",
		"eci.vy",
		"eci.vz",
	)

	simQuery := fmt.Sprintf(
		`bucket = "%s"
measurement = "%s"
latest = from(bucket: bucket)
	|> range(start: -3d)
	|> filter(fn: (r) => r["_measurement"] == measurement)
	|> keep(columns: ["_time"])
	|> sort(columns: ["_time"], desc: false)
	|> last(column: "_time")
	|> findColumn(fn: (key) => true, column: "_time")
starttime = time(v: uint(v: latest[0])-uint(v: %d))
from(bucket: "Simulator_Data")
	|> range(start: starttime)
	|> filter(fn: (r) => r["_measurement"] == measurement)
	|> filter(fn: (r) => r["%s"] =~ /(%s)/)
	|> filter(fn: (r) => r["_field"] =~ /(%s)/)
	|> keep(columns: ["%s", "_time", "_value", "_field"])
	|> group(columns: ["%s", "_time"])`,
		"Simulator_Data",
		"simdata",
		// Note: 1274 records (two nodes at runcount=90, simdt=60) were stored in .004 seconds
		// So ten times that number, .04 seconds "should" be fine
		40000000,
		"name", // should be tagname?
		nameList,
		fieldList,
		"name",
		"name", // should be tagname?
	)
	// log.DefaultLogger.Error("simQuery", "simQuery", simQuery)

	// Get flux query result
	result, err := queryAPI.Query(context.Background(), simQuery)
	if err != nil {
		log.DefaultLogger.Error("query error", err.Error())
		err = fmt.Errorf("Query returned no results.")
		response.Error = err
		return response
	}

	czmlresp, err := toCzml(result)
	if err != nil {
		log.DefaultLogger.Error("Error in toCzml", err.Error())
		response.Error = err
		return response
	}

	frame.Fields = append(frame.Fields,
		data.NewField("historical", nil, []string{""}),
		// TODO: fix this
		data.NewField("predicted", nil, []string{czmlresp.historical}),
	)

	// add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
}

func (d *SampleDatasource) OperationalMode(qm queryModel, queryAPI api.QueryAPI, pCtx backend.PluginContext) backend.DataResponse {
	response := backend.DataResponse{}

	// create data frame response.
	frame := data.NewFrame("response")

	// Not used for now. This is for actual data, but I'm currently just testing simdata
	// operationalQuery := fmt.Sprintf(
	// 	`from(bucket: "SOH_Bucket")
	// 		|> range(start: -2y)
	// 		|> filter(fn: (r) => r["_measurement"] == "%s"
	// 		or r["_measurement"] == "%s"
	// 		or r["_measurement"] == "%s"
	// 		or r["_measurement"] == "%s"
	// 		or r["_measurement"] == "%s")
	// 		|> filter(fn: (r) => r["%s"] == "%s")
	// 		|> filter(fn: (r) => r["_field"] == "%s"
	// 					or r["_field"] == "%s"
	// 					or r["_field"] == "%s"
	// 					or r["_field"] == "%s"
	// 					or r["_field"] == "%s"
	// 					or r["_field"] == "%s")
	// 		|> group(columns: ["_measurement", "_time"])
	// 		//|> last()`,
	// 	qm.OpNodeList[0].Name,
	// 	qm.OpNodeList[1].Name,
	// 	qm.OpNodeList[2].Name,
	// 	qm.OpNodeList[3].Name,
	// 	qm.OpNodeList[4].Name,
	// 	qm.OpNodeList[0].Tag_name,
	// 	qm.OpNodeList[0].Tag_value,
	// 	qm.OpNodeList[0].Px,
	// 	qm.OpNodeList[0].Py,
	// 	qm.OpNodeList[0].Pz,
	// 	qm.OpNodeList[0].Vx,
	// 	qm.OpNodeList[0].Vy,
	// 	qm.OpNodeList[0].Vz)

	nameList := ""
	for idx, elem := range qm.OpNodeList {
		nameList += elem.Name
		if idx < len(qm.OpNodeList)-1 {
			nameList += "|"
		}
	}

	fieldList := fmt.Sprintf(`%s|%s|%s|%s|%s|%s|%s`,
		"utc",
		qm.OpNodeList[0].Px,
		qm.OpNodeList[0].Py,
		qm.OpNodeList[0].Pz,
		qm.OpNodeList[0].Vx,
		qm.OpNodeList[0].Vy,
		qm.OpNodeList[0].Vz,
	)

	simQuery := fmt.Sprintf(
		`bucket = "%s"
measurement = "%s"
latest = from(bucket: bucket)
	|> range(start: -3d)
	|> filter(fn: (r) => r["_measurement"] == measurement)
	|> keep(columns: ["_time"])
	|> sort(columns: ["_time"], desc: false)
	|> last(column: "_time")
	|> findColumn(fn: (key) => true, column: "_time")
starttime = time(v: uint(v: latest[0])-uint(v: %d))
from(bucket: "Simulator_Data")
	|> range(start: starttime)
	|> filter(fn: (r) => r["_measurement"] == measurement)
	|> filter(fn: (r) => r["%s"] =~ /(%s)/)
	|> filter(fn: (r) => r["_field"] =~ /(%s)/)
	|> keep(columns: ["%s", "_time", "_value", "_field"])
	|> group(columns: ["%s", "_time"])`,
		"Simulator_Data",
		"simdata",
		// Note: 1274 records (two nodes at runcount=90, simdt=60) were stored in .004 seconds
		// So ten times that number, .04 seconds "should" be fine
		40000000,
		"name", // should be tagname?
		nameList,
		fieldList,
		"name",
		"name", // should be tagname?
	)
	// log.DefaultLogger.Error("simQuery", "simQuery", simQuery)

	// Get flux query result
	result, err := queryAPI.Query(context.Background(), simQuery)
	if err != nil {
		log.DefaultLogger.Error("query error", err.Error())
		err = fmt.Errorf("Query returned no results.")
		response.Error = err
		return response
	}

	czmlresp, err := toCzml(result)
	if err != nil {
		log.DefaultLogger.Error("Error in toCzml", err.Error())
		response.Error = err
		return response
	}
	//log.DefaultLogger.Info("json string", "historical", czmlresp.historical, "predicted", czmlresp.predicted)

	// log.DefaultLogger.Info("UDP RECEIVE", n, s)
	frame.Fields = append(frame.Fields,
		data.NewField("historical", nil, []string{czmlresp.historical}),
		data.NewField("predicted", nil, []string{czmlresp.predicted}),
	)
	// log.DefaultLogger.Info("UDP RECEIVE", "n", n, "len(s)", len(czml_response))

	// If query called with streaming on then return a channel
	// to subscribe on a client-side and consume updates from a plugin.
	// Feel free to remove this if you don't need streaming for your datasource.
	//log.DefaultLogger.Info("qm", "qm", qm)
	// if qm.WithStreaming {
	// 	channel := live.Channel{
	// 		Scope:     live.ScopeDatasource,
	// 		Namespace: pCtx.DataSourceInstanceSettings.UID,
	// 		Path:      "stream",
	// 	}
	// 	frame.SetMeta(&data.FrameMeta{Channel: channel.String()})
	// }

	// add the frames to the response.
	response.Frames = append(response.Frames, frame)

	return response
}

// Return value of toCzml() that will be the response from this backend datasource
type czml_response struct {
	historical string
	predicted  string
}

func mjdToTime(mjd float64) time.Time {
	unix := (mjd - 40587) * 86400
	unixs := math.Floor(unix)
	unixns := (unix - unixs) * 1000000000
	timestamp := time.Unix(int64(unixs), int64(unixns))
	return timestamp
}

// Take query result and convert to czml format
func toCzml(result *api.QueryTableResult) (czml_response, error) {
	// Start czml response construction
	var czmlPacket []czmlStruct
	// Store node names here to convert to an index into czmlPacket
	var nodeNameIdx = make(map[string]int)
	czmlPacket = append(czmlPacket, czmlStruct{})
	var idx int = 0
	czmlPacket[0].Id = "document"
	czmlPacket[0].Name = "OrbitDatasourceResponse-Historical"
	czmlPacket[0].Version = "1.0"

	// Reusable arrays for positional data
	// TODO: make dynamic
	px_name := "eci.px"
	py_name := "eci.py"
	pz_name := "eci.pz"
	vx_name := "eci.vx"
	vy_name := "eci.vy"
	vz_name := "eci.vz"

	// For determining if orbital propagator needs to be called
	//targetTime := time.Now()
	var latestTime float64 = 0
	var earliestTime float64 = 2547239.50000000 // Dec 31, 2261

	// New table number is new point
	var tableNum int = -1
	// Iterate over query result lines
	for result.Next() {
		if result.Err() != nil {
			log.DefaultLogger.Error("Query error:", result.Err().Error())
			break
		}
		// Observe when there is new grouping key producing new table
		// Since we've grouped query results by the timestamp, it should be
		// the case that each table contains one set of the values.
		// (e.g., table 0 should contain pxyz & vxyz, then table 1 for the next timestamp, etc.)
		if result.TableChanged() {
			//log.DefaultLogger.Info("Table: ", result.TableMetadata().String())
			tableNum = -1
		}
		// Check if we're still handling the same node
		nodeName := result.Record().ValueByKey("name").(string)
		if nodeName != czmlPacket[idx].Id {
			// Attempt to fetch idx of node name
			nodeIdx, exists := nodeNameIdx[nodeName]
			if exists {
				// Use existing entry in czmlPacket
				idx = nodeIdx
			} else {
				// Create a new entry in czmlPacket for new node and a new entry in nodeNameIdx as well
				czmlPacket = append(czmlPacket, czmlStruct{})
				idx = len(czmlPacket) - 1
				nodeNameIdx[nodeName] = idx
				czmlPacket[idx].Id = nodeName
				czmlPacket[idx].Position = &czmlPosition{}
				// czmlPacket[idx].Position.Interval = ...
				// czmlPacket[idx].Position.Epoch = "1858-11-17T00:00:00Z" // MJD epoch, but I probably end up losing some precision?
				czmlPacket[idx].Position.ReferenceFrame = "INERTIAL"
				czmlPacket[idx].Model = &czmlModel{}
				czmlPacket[idx].Model.Gltf = "./public/plugins/hsfl-orbit-display/img/HyTI.glb"
				czmlPacket[idx].Model.Scale = 4.0
				czmlPacket[idx].Model.MinimumPixelSize = 50
				czmlPacket[idx].Path = &czmlPath{}
				czmlPacket[idx].Path.Material.PolylineOutline.Color.Rgba = [4]int32{255, 255, 255, 128}
				czmlPacket[idx].Path.LeadTime = 5400
				czmlPacket[idx].Path.TrailTime = 5400
				czmlPacket[idx].Path.Width = 5
				czmlPacket[idx].Path.Resolution = 1
			}
		}
		// New point, add timestamp and append positional arrays
		if tableNum != result.Record().Table() {
			tableNum = result.Record().Table()
			// Save latest time to determine whether we need to call orbital predictor or not
			czmlPacket[idx].Position.Cartesian = append(czmlPacket[idx].Position.Cartesian, 0, 0, 0, 0)
		}
		// Populate positional fields
		switch result.Record().Field() {
		case "utc":
			// Convert mjd to time.Time and RFC3339 string format
			mjd := result.Record().Value().(float64)
			timestamp := mjdToTime(mjd)
			czmlPacket[idx].Position.Cartesian[len(czmlPacket[idx].Position.Cartesian)-4] = timestamp.Format(time.RFC3339)
			if mjd > latestTime {
				latestTime = mjd
			}
			if mjd < earliestTime {
				earliestTime = mjd
			}
		case px_name:
			czmlPacket[idx].Position.Cartesian[len(czmlPacket[idx].Position.Cartesian)-3] = result.Record().Value().(float64)
		case py_name:
			czmlPacket[idx].Position.Cartesian[len(czmlPacket[idx].Position.Cartesian)-2] = result.Record().Value().(float64)
		case pz_name:
			czmlPacket[idx].Position.Cartesian[len(czmlPacket[idx].Position.Cartesian)-1] = result.Record().Value().(float64)
		case vx_name:
			czmlPacket[idx].vel[0] = result.Record().Value().(float64)
		case vy_name:
			czmlPacket[idx].vel[1] = result.Record().Value().(float64)
		case vz_name:
			czmlPacket[idx].vel[2] = result.Record().Value().(float64)
		default:
			continue
		}
		//log.DefaultLogger.Info("Row: ", "Time", result.Record().Time(), result.Record().Field(), result.Record().Value(), "Table", result.Record().Table(), "Measurement", result.Record().Measurement())
	}
	// Complete Availability string, setting it on the document object means it defines the availability for the entire data set, not for the individual entities (node0, node1, etc.)
	earliestrfc := mjdToTime(earliestTime).Format(time.RFC3339)
	czmlPacket[0].Clock = &czmlClock{}
	czmlPacket[0].Clock.CurrentTime = earliestrfc
	czmlPacket[0].Clock.Interval = earliestrfc + "/" + mjdToTime(latestTime).Format(time.RFC3339)
	czmlPacket[0].Clock.Range = "LOOP_STOP"
	// if len(czmlPacket) > 1 {
	// 	czmlPacket[1].Availability = czmlPacket[0].Clock.Interval
	// }

	czmlbytes, err := json.Marshal(czmlPacket)
	if err != nil {
		log.DefaultLogger.Error("json.Marshal error", err.Error())
		return czml_response{}, err
	}

	//dt := math.Abs(latestTime.Sub(targetTime).Minutes())
	// Need to call orbital propagator to generate remainder of ~90min orbit
	predicted_orbit := ""
	/*if dt < 50 {
		var pargs []propagator_args
		for i := range czmlPacket {
			if i == 0 {
				continue
			}
			utc, err := time.Parse(time.RFC3339, czmlPacket[i].Position.Cartesian[len(czmlPacket[i].Position.Cartesian)-3].(string))
			if err != nil {
				log.DefaultLogger.Error("Error in time parse", err.Error())
				return czml_response{}, err
			}
			unixut := utc.UnixMicro()
			// 40587 is day offset between unix time and MJD
			mjdt := 40587 + (float64(unixut)/1000000)/86400
			pargs = append(pargs, propagator_args{
				Name: czmlPacket[i].Id,
				Utc:       mjdt,
				Px:        czmlPacket[i].Position.Cartesian[len(czmlPacket[i].Position.Cartesian)-3].(float64),
				Py:        czmlPacket[i].Position.Cartesian[len(czmlPacket[i].Position.Cartesian)-2].(float64),
				Pz:        czmlPacket[i].Position.Cartesian[len(czmlPacket[i].Position.Cartesian)-1].(float64),
				Vx:        czmlPacket[i].vel[0],
				Vy:        czmlPacket[i].vel[1],
				Vz:        czmlPacket[i].vel[2],
			})
		}
		predicted_orbit, err = orbitalPropagatorCall(pargs)
		if err != nil {
			log.DefaultLogger.Error("Error in orbitalPropagatorCall", err.Error())
			return czml_response{}, err
		}
	}*/

	// return czml_response{historical: string(czmlbytes), predicted: predicted_orbit}, nil
	return czml_response{historical: string(czmlbytes), predicted: predicted_orbit}, nil
}

func orbitalPropagatorCall(pargs []propagator_args) (string, error) {
	// Create arg array
	pargs_bytes, err := json.Marshal(pargs)
	if err != nil {
		log.DefaultLogger.Error("json.Marshal error", err.Error())
		return "", err
	}
	log.DefaultLogger.Info("pargs json marshal", string(pargs_bytes))

	// Attempt propagator_web call
	const PROPAGATOR_WEB_PORT int = 10092
	raddr, err := net.ResolveUDPAddr("udp", "cosmos:"+fmt.Sprint(PROPAGATOR_WEB_PORT))
	if err != nil {
		return "", err
	}
	conn, err := net.DialUDP("udp", nil, raddr)
	if err != nil {
		return "", err
	}
	defer conn.Close()
	// Send message
	//n, addr, err := conn.ReadFrom(buffer)
	n, err := fmt.Fprintf(conn, string(pargs_bytes))
	if err != nil {
		log.DefaultLogger.Error("UDP SEND ERROR", err.Error())
		return "", err
	}
	// TODO: add read timeout
	// Receive response
	n, err = conn.Read(buffer)
	if err != nil {
		err = fmt.Errorf("%w. Is propagator_web running?", err)
		log.DefaultLogger.Error("UDP RECV ERROR", err.Error())
		return "", err
	}
	czml_predicted_orbit := string(buffer[0:n])

	return czml_predicted_orbit, nil
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *SampleDatasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	log.DefaultLogger.Info("CheckHealth called", "request", req)

	var status = backend.HealthStatusOk
	var message = "Data source is working"

	if rand.Int()%2 == 0 {
		status = backend.HealthStatusError
		message = "randomized error"
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}

// SubscribeStream is called when a client wants to connect to a stream. This callback
// allows sending the first message.
func (d *SampleDatasource) SubscribeStream(_ context.Context, req *backend.SubscribeStreamRequest) (*backend.SubscribeStreamResponse, error) {
	log.DefaultLogger.Info("SubscribeStream called", "request", req)

	status := backend.SubscribeStreamStatusPermissionDenied
	if req.Path == "stream" {
		// Allow subscribing only on expected path.
		status = backend.SubscribeStreamStatusOK
	}
	return &backend.SubscribeStreamResponse{
		Status: status,
	}, nil
}

// RunStream is called once for any open channel.  Results are shared with everyone
// subscribed to the same channel.
func (d *SampleDatasource) RunStream(ctx context.Context, req *backend.RunStreamRequest, sender *backend.StreamSender) error {
	log.DefaultLogger.Info("RunStream called", "request", req)

	// Create the same data frame as for query data.
	frame := data.NewFrame("response")

	// Add fields (matching the same schema used in QueryData).
	frame.Fields = append(frame.Fields,
		data.NewField("time", nil, make([]time.Time, 1)),
		data.NewField("values", nil, make([]int64, 1)),
	)

	counter := 0

	// Stream data frames periodically till stream closed by Grafana.
	for {
		select {
		case <-ctx.Done():
			log.DefaultLogger.Info("Context done, finish streaming", "path", req.Path)
			return nil
		case <-time.After(time.Second):
			// Send new data periodically.
			frame.Fields[0].Set(0, time.Now())
			frame.Fields[1].Set(0, int64(rand.Intn(100)))

			counter++

			err := sender.SendFrame(frame, data.IncludeAll)
			if err != nil {
				log.DefaultLogger.Error("Error sending frame", "error", err)
				continue
			}
		}
	}
}

// PublishStream is called when a client sends a message to the stream.
func (d *SampleDatasource) PublishStream(_ context.Context, req *backend.PublishStreamRequest) (*backend.PublishStreamResponse, error) {
	log.DefaultLogger.Info("PublishStream called", "request", req)

	// Do not allow publishing at all.
	return &backend.PublishStreamResponse{
		Status: backend.PublishStreamStatusPermissionDenied,
	}, nil
}
