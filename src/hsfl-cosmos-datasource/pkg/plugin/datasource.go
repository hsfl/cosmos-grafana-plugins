package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

// Make sure Datasource implements required interfaces. This is important to do
// since otherwise we will only get a not implemented error response from plugin in
// runtime. In this example datasource instance implements backend.QueryDataHandler,
// backend.CheckHealthHandler interfaces. Plugin should not implement all these
// interfaces- only those which are required for a particular task.
var (
	_ backend.QueryDataHandler      = (*Datasource)(nil)
	_ backend.CheckHealthHandler    = (*Datasource)(nil)
	_ instancemgmt.InstanceDisposer = (*Datasource)(nil)
)

// NewDatasource creates a new datasource instance.
func NewDatasource(instanceSettings backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	var config datasourceConfig
	err := json.Unmarshal(instanceSettings.JSONData, &config)
	if err != nil {
		log.DefaultLogger.Error("Error in unmarshal", "error", err)
	}
	url := config.Url
	usingHostname := config.UsingHostname

	// This is the cosmos web api port
	const COSMOSWEBBACKEND_PORT int = 10090

	if usingHostname {
		// Convert docker's network hostname to an actual ip address
		addr, err := net.LookupIP(url)
		if err != nil {
			log.DefaultLogger.Error("Host to IP error", err.Error())
			return nil, err
		}
		// use the ip instead of the hostname
		url = fmt.Sprintf("http://%s:%d", fmt.Sprint(addr[0]), COSMOSWEBBACKEND_PORT)
	} else {
		url = strings.TrimSuffix(url, "/")
		url = url + ":" + fmt.Sprint(COSMOSWEBBACKEND_PORT)
	}

	return &Datasource{url: url}, nil
}

// COSMOS Web backend api endpoint call
// msg: json encoded string
func (d *Datasource) GetEndpoint(qm queryModel, timeRange backend.TimeRange) (string, error) {
	if qm.Type == "" {
		err := fmt.Errorf("error in query type selection")
		log.DefaultLogger.Error("error in query type selection", "err", err.Error(), "type", qm.Type)
		return "", err
	}

	base := d.url + "/db/" + qm.Type + "?"
	req, err := http.NewRequest("GET", base, nil)
	if err != nil {
		log.DefaultLogger.Error("Error in http.NewRequest", err.Error())
		return "", err
	}
	q := req.URL.Query()
	from_str := fmt.Sprintf("%f", time_to_mjd(timeRange.From))
	to_str := fmt.Sprintf("%f", time_to_mjd(timeRange.To))
	q.Add("from", from_str)
	q.Add("to", to_str)

	// Kind of redundant to re-marshall it, but think about it later
	qstr, err := json.Marshal(qm)
	if err != nil {
		log.DefaultLogger.Error("Error in json.Marshall() for qm", err.Error())
		return "", err
	}
	q.Add("query", string(qstr))

	req.URL.RawQuery = q.Encode()

	log.DefaultLogger.Info("curl url test", "url", req.URL.String())
	// fmt.Printf(req.URL.String())

	return req.URL.String(), nil
}

// msg: json encoded string
// url: URL or Hostname of API endpoint
func (d *Datasource) CosmosBackendCall(qm queryModel, timeRange backend.TimeRange, j *jsonResponse) error {
	endpoint, err := d.GetEndpoint(qm, timeRange)
	if err != nil {
		return err
	}

	// Attempt tcp connection (UDP packets have a size limit)
	// buf := bytes.NewBuffer(nil)
	// resp, err := http.Get(endpoint, "application/json", buf)
	resp, err := http.Get(endpoint)
	// POST
	if err != nil {
		log.DefaultLogger.Error("Error in POST", err.Error())
		return err
	}
	defer resp.Body.Close()
	// Read response body
	err = json.NewDecoder(resp.Body).Decode(&j)
	if err != nil {
		log.DefaultLogger.Error("Error reading body of POST response", err.Error())
	}

	return nil
}

// Dispose here tells plugin SDK that plugin wants to clean up resources when a new instance
// created. As soon as datasource settings change detected by SDK old datasource instance will
// be disposed and a new one will be created using NewSampleDatasource factory function.
func (d *Datasource) Dispose() {
	// Clean up datasource instance resources.
}

// QueryData handles multiple queries and returns multiple responses.
// req contains the queries []DataQuery (where each query contains RefID as a unique identifier).
// The QueryDataResponse contains a map of RefID to the response for each query, and each response
// contains Frames ([]*Frame).
func (d *Datasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	log.DefaultLogger.Info("QueryData called", "request", req)

	// create response struct
	response := backend.NewQueryDataResponse()

	// loop over queries and execute them individually.
	for _, q := range req.Queries {
		res := d.query(ctx, req.PluginContext, q)

		// save the response in a hashmap
		// based on with RefID as identifier
		response.Responses[q.RefID] = res
	}

	return response, nil
}

func (d *Datasource) query(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	response := backend.DataResponse{}

	// Unmarshal the JSON into our queryModel.
	var qm queryModel

	response.Error = json.Unmarshal(query.JSON, &qm)
	if response.Error != nil {
		return response
	}

	var j jsonResponse
	err := d.CosmosBackendCall(qm, query.TimeRange, &j)
	if err != nil {
		log.DefaultLogger.Error("Error in Cosmos Backend call", err.Error())
		response.Error = err
		return response
	}

	// Convert sql json to timeseries dataframe
	ConvertToFrame(&response.Frames, &j.Payload.Avectors)
	ConvertToFrame(&response.Frames, &j.Payload.Qvatts)
	ConvertToFrame(&response.Frames, &j.Payload.Qaatts)
	ConvertToFrame(&response.Frames, &j.Payload.Ecis)
	ConvertToFrame(&response.Frames, &j.Payload.Batts)
	ConvertToFrame(&response.Frames, &j.Payload.Bcregs)
	ConvertToFrame(&response.Frames, &j.Payload.Tsens)
	ConvertToFrame(&response.Frames, &j.Payload.Cpus)
	ConvertToFrame(&response.Frames, &j.Payload.Events)
	ConvertToFrame(&response.Frames, &j.Payload.Mags)
	ConvertToFrame(&response.Frames, &j.Payload.Geods)
	ConvertToFrame(&response.Frames, &j.Payload.Geoss)
	ConvertToFrame(&response.Frames, &j.Payload.Lvlhs)
	ConvertToFrame(&response.Frames, &j.Payload.Geoidposs)
	ConvertToFrame(&response.Frames, &j.Payload.Spherposs)
	ConvertToFrame(&response.Frames, &j.Payload.Svectors)
	ConvertToFrame(&response.Frames, &j.Payload.Qatts)

	return response
}

// Returns frame fields with appropriate types given a slice of names
func CreateFields(names []string) data.Fields {
	fields := make(data.Fields, len(names))
	for i, v := range names {
		switch v {
		case "time":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeNullableTime, 0)
		case "name":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeNullableString, 0)
		case "node":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeNullableString, 0)
		case "node:device":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeNullableString, 0)
		case "node_name":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeNullableString, 0)
		case "Node_name":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeNullableString, 0)
		case "event_name":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeNullableString, 0)
		case "event_id":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeUint8, 0)
		case "didx":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeUint8, 0)
		case "duration":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeUint32, 0)
		default:
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeFloat64, 0)
		}
		fields[i].Name = names[i]
	}
	return fields
}

// Checks if the frame_map contains an entry for the given frame_name, and if not, creates a new entry for it
// using the names slice.
// Appends the row to the specified Frame in the map.
// frame_map: Map of data.Frame, used to collect all telem for a given node to a separate Frame
// frame_name: Name of the fram
// row: Row to append to the node's Frame
// names: Column names for the Frame
// tag: The name of the query type, additional info to append to the Frame as custom meta info
func AppendRowtoMap(frame_map map[string]*data.Frame, frame_name string, row []interface{}, names []string, tag string) {
	_, ok := frame_map[frame_name]
	if !ok {
		frame_map[frame_name] = data.NewFrame(frame_name, CreateFields(names)...)
		custom_tag := map[string]string{"type": tag}
		frame_map[frame_name].SetMeta(&data.FrameMeta{Custom: custom_tag})
	}
	frame_map[frame_name].AppendRow(row...)
}

// Convert a json of mysql col/rows into a grafana timeseries data frame
// Heavily references (and abbreviates) executeQuery in grafana/pkg/tsdb/sqleng/sql_engine.go
func ConvertToFrame[T cosmostype](frames *data.Frames, jarg *[]T) error {
	// reflection setup, get field names
	if len(*jarg) < 1 {
		return nil
	}

	var names []string

	// jtype := reflect.TypeOf((*j)[0])
	// for i := 0; i < jtype.NumField(); i++ {
	// 	names = append(names, jtype.Field(i).Name)
	// }

	// Create column names
	switch any((*jarg)[0]).(type) {
	case avector:
		names = []string{"time", "node_name", "node_type", "yaw", "pitch", "roll"}
	case qvatt:
		names = []string{"time", "vyaw", "vpitch", "vroll"}
	case qaatt:
		names = []string{"time", "ayaw", "apitch", "aroll"}
	case eci:
		names = []string{"time", "node_name", "node_type", "s_x", "s_y", "s_z", "v_x", "v_y", "v_z", "a_x", "a_y", "a_z"}
	case batt:
		names = []string{"time", "node_name", "name", "amp", "volt", "power", "temp", "percentage"}
	case bcreg:
		names = []string{"time", "node_name", "name", "amp", "volt", "power", "temp", "mpptin_amp", "mpptin_volt", "mpptout_amp", "mpptout_volt"}
	case tsen:
		names = []string{"time", "node:device", "temp"}
	case cpu:
		names = []string{"time", "node", "load", "gib", "storage"}
	case event:
		names = []string{"time", "node_name", "duration", "event_id", "event_name"}
	case mag:
		names = []string{"time", "node_name", "didx", "mag_x", "mag_y", "mag_z"}
	case geod:
		names = []string{"time", "s_lat", "s_lon", "s_h", "v_lat", "v_lon", "v_h", "a_lat", "a_lon", "a_h"}
	case geoidpos:
		names = []string{"time", "node_name", "node_type", "s_lat", "s_lon", "s_h", "v_lat", "v_lon", "v_h", "a_lat", "a_lon", "a_h"}
	case geos:
		names = []string{"time", "s_phi", "s_lambda", "s_r", "v_phi", "v_lambda", "v_r", "a_phi", "a_lambda", "a_r"}
	case spherpos:
		names = []string{"time", "node_name", "node_type", "s_phi", "s_lambda", "s_r", "v_phi", "v_lambda", "v_r", "a_phi", "a_lambda", "a_r"}
	case svector:
		names = []string{"time", "node_name", "node_type", "phi", "lambda", "r"}
	case lvlh:
		names = []string{"time", "s_d_x", "s_d_y", "s_d_z", "s_w", "v_x", "v_y", "v_z", "a_x", "a_y", "a_z"}
	case qatt:
		names = []string{"time", "node_name", "node_type", "s_d_x", "s_d_y", "s_d_z", "s_w", "v_x", "v_y", "v_z", "a_x", "a_y", "a_z"}
	default:
		return nil
	}

	log.DefaultLogger.Error("Checking backend return", "return", (*jarg)[0])

	// ---- FrameFromRows
	// Create response frame
	// Based on sqlutil NewFrame
	// Separate out nodes into a new series
	frame_map := make(map[string]*data.Frame)
	transform_to_timeseries := true
	for _, v := range *jarg {
		// vtype := reflect.ValueOf((*j)[0])
		// row := make([]interface{}, len(names))
		// for i := 0; i < vtype.NumField(); i++ {
		// 	field := vtype.Field(i).Name
		// 	switch field {
		// 	case "Time":
		// 		row[0] = v.Time
		// 	default:
		// 		row[i] = vtype.Field(i).Interface
		// 	}
		// }
		switch j := any(v).(type) {
		case avector:
			// Time must be in unix milliseconds
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_name
			row[2] = j.Node_type
			row[3] = j.B
			row[4] = j.E
			row[5] = j.H
			AppendRowtoMap(frame_map, j.Node_name, row, names, "avector")
		case qvatt:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = j.Qvx
			row[2] = j.Qvy
			row[3] = j.Qvz
			AppendRowtoMap(frame_map, "node", row, names, "qvatt")
		case qaatt:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = j.Qax
			row[2] = j.Qay
			row[3] = j.Qaz
			AppendRowtoMap(frame_map, "node", row, names, "qaatt")
		case eci:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_name
			row[2] = j.Node_type
			row[3] = j.S_x
			row[4] = j.S_y
			row[5] = j.S_z
			row[6] = j.V_x
			row[7] = j.V_y
			row[8] = j.V_z
			row[9] = j.A_x
			row[10] = j.A_y
			row[11] = j.A_z
			AppendRowtoMap(frame_map, j.Node_name, row, names, "eci")
		case batt:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_name
			row[2] = &j.Name
			row[3] = j.Amp
			row[4] = j.Volt
			row[5] = j.Power
			row[6] = j.Temp
			row[7] = j.Percentage
			AppendRowtoMap(frame_map, j.Node_name, row, names, "batt")
		case bcreg:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_name
			row[2] = &j.Name
			row[3] = j.Amp
			row[4] = j.Volt
			row[5] = j.Power
			row[6] = j.Temp
			row[7] = j.Mpptin_amp
			row[8] = j.Mpptin_volt
			row[9] = j.Mpptout_amp
			row[10] = j.Mpptout_volt
			AppendRowtoMap(frame_map, j.Node_name, row, names, "bcreg")
		case tsen:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_Device
			row[2] = j.Temp
			AppendRowtoMap(frame_map, j.Node_Device, row, names, "tsen")
		case cpu:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node
			row[2] = j.Load
			row[3] = j.Gib
			row[4] = j.Storage
			AppendRowtoMap(frame_map, j.Node, row, names, "cpu")
		case event:
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_name
			row[2] = j.Duration
			row[3] = j.Event_id
			row[4] = &j.Event_name
			AppendRowtoMap(frame_map, j.Node_name, row, names, "event")
		case mag:
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_name
			row[2] = j.Didx
			row[3] = j.Mag_x
			row[4] = j.Mag_y
			row[5] = j.Mag_z
			AppendRowtoMap(frame_map, j.Node_name, row, names, "mag")
		case geod:
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = j.S_lat
			row[2] = j.S_lon
			row[3] = j.S_h
			row[4] = j.V_lat
			row[5] = j.V_lon
			row[6] = j.V_h
			row[7] = j.A_lat
			row[8] = j.A_lon
			row[9] = j.A_h
			AppendRowtoMap(frame_map, "node", row, names, "geod")
		case geoidpos:
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_name
			row[2] = j.Node_type
			row[3] = j.S.Lat
			row[4] = j.S.Lon
			row[5] = j.S.H
			row[6] = j.V.Lat
			row[7] = j.V.Lon
			row[8] = j.V.H
			row[9] = j.A.Lat
			row[10] = j.A.Lon
			row[11] = j.A.H
			AppendRowtoMap(frame_map, j.Node_name, row, names, "geoidpos")
		case geos:
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = j.S_phi
			row[2] = j.S_lambda
			row[3] = j.S_r
			row[4] = j.V_phi
			row[5] = j.V_lambda
			row[6] = j.V_r
			row[7] = j.A_phi
			row[8] = j.A_lambda
			row[9] = j.A_r
			AppendRowtoMap(frame_map, "node", row, names, "geos")
		case spherpos:
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_name
			row[2] = j.Node_type
			row[3] = j.S.Phi
			row[4] = j.S.Lambda
			row[5] = j.S.R
			row[6] = j.V.Phi
			row[7] = j.V.Lambda
			row[8] = j.V.R
			row[9] = j.A.Phi
			row[10] = j.A.Lambda
			row[11] = j.A.R
			AppendRowtoMap(frame_map, j.Node_name, row, names, "spherepos")
		case svector:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_name
			row[2] = j.Node_type
			row[3] = j.Phi
			row[4] = j.Lambda
			row[5] = j.R
			AppendRowtoMap(frame_map, j.Node_name, row, names, "svector")
		case lvlh:
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = j.S_d_x
			row[2] = j.S_d_y
			row[3] = j.S_d_z
			row[4] = j.S_w
			row[5] = j.V_x
			row[6] = j.V_y
			row[7] = j.V_z
			row[8] = j.A_x
			row[9] = j.A_y
			row[10] = j.A_z
			AppendRowtoMap(frame_map, "node", row, names, "lvlh")
		case qatt:
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_name
			row[2] = j.Node_type
			row[3] = j.S.D.X
			row[4] = j.S.D.Y
			row[5] = j.S.D.Z
			row[6] = j.S.W
			row[7] = j.V.Col[0]
			row[8] = j.V.Col[1]
			row[9] = j.V.Col[2]
			row[10] = j.A.Col[0]
			row[11] = j.A.Col[1]
			row[12] = j.A.Col[2]
			AppendRowtoMap(frame_map, j.Node_name, row, names, "qatt")
		}
	}
	if !transform_to_timeseries {
		for _, frame := range frame_map {
			*frames = append(*frames, frame)
		}
		return nil
	}
	// ---- end FrameFromRows
	// ---- Format to timeseries
	for _, frame := range frame_map {
		tsSchema := frame.TimeSeriesSchema()
		if tsSchema.Type == data.TimeSeriesTypeLong {
			var err error
			originalData := frame
			frame, err = data.LongToWide(frame, &data.FillMissing{Mode: data.FillModeNull})
			if err != nil {
				log.DefaultLogger.Error("Error in Cosmos Backend call", err.Error())
				return nil
			}
			// log.DefaultLogger.Info("field data labels test", "og data field count: ", len(originalData.Fields))

			// Before 8x, a special metric column was used to name time series. The LongToWide transforms that into a metric label on the value field.
			// But that makes series name have both the value column name AND the metric name. So here we are removing the metric label here and moving it to the
			// field name to get the same naming for the series as pre v8
			if len(originalData.Fields) == 3 {
				for _, field := range frame.Fields {
					if len(field.Labels) == 1 { // 7x only supported one label
						name, ok := field.Labels["metric"]
						if ok {
							field.Name = name
							field.Labels = nil
						}
					}
				}
			}
		}
		// ---- end format to timeseries

		*frames = append(*frames, frame)
	}
	return nil
}

// CheckHealth handles health checks sent from Grafana to the plugin.
// The main use case for these health checks is the test button on the
// datasource configuration page which allows users to verify that
// a datasource is working as expected.
func (d *Datasource) CheckHealth(_ context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	log.DefaultLogger.Info("CheckHealth called", "request", req)

	var status = backend.HealthStatusOk
	var message = "Data source is working"

	timeRange := backend.TimeRange{From: time.Now(), To: time.Now()}
	var qm queryModel
	qm.Type = "Attitude"
	var j jsonResponse
	err := d.CosmosBackendCall(qm, timeRange, &j)
	if err != nil {
		status = backend.HealthStatusError
		message = err.Error()
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}
