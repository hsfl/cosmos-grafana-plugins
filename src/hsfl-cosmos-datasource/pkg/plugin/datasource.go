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
func (d *Datasource) GetEndpoint(queryText string, typeText string, timeRange backend.TimeRange) (string, error) {
	if queryText == "" {
		err := fmt.Errorf("queryText wrong")
		return "", err
	}
	typeAdd := ""
	// if typeText != "" {
	// 	typeAdd = "-" + typeText
	// }
	base := d.url + "/db/" + queryText + typeAdd + "?"
	req, err := http.NewRequest("GET", base, nil)
	if err != nil {
		log.DefaultLogger.Error("Error in http.NewRequest", err.Error())
		return "", err
	}
	q := req.URL.Query()
	// q.Add("from", timeRange.From.Format(59874.83333333))
	// q.Add("to", timeRange.To.Format(59874.87500000))
	from_str := fmt.Sprintf("%f", time_to_mjd(timeRange.From))
	to_str := fmt.Sprintf("%f", time_to_mjd(timeRange.To))
	q.Add("from", from_str)
	q.Add("to", to_str)
	if typeText != "" {
		q.Add("type", typeText)
	}

	req.URL.RawQuery = q.Encode()

	log.DefaultLogger.Info("curl url test", "url", req.URL.String())
	// fmt.Printf(req.URL.String())

	return req.URL.String(), nil
}

// msg: json encoded string
// url: URL or Hostname of API endpoint
func (d *Datasource) CosmosBackendCall(queryText string, typeText string, timeRange backend.TimeRange, j *jsonResponse) error {
	endpoint, err := d.GetEndpoint(queryText, typeText, timeRange)
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

	// frame := data.NewFrame("response")
	qm.QueryText = strings.TrimSpace(qm.QueryText)
	qm.QueryText = strings.ReplaceAll(qm.QueryText, " ", "")
	queryTexts := strings.Split(qm.QueryText, ",")

	qm.TypeText = strings.TrimSpace(qm.TypeText)
	qm.TypeText = strings.ReplaceAll(qm.TypeText, " ", "")
	units := (qm.TypeText)

	for _, v := range queryTexts {
		var j jsonResponse
		err := d.CosmosBackendCall(v, units, query.TimeRange, &j)
		if err != nil {
			log.DefaultLogger.Error("Error in Cosmos Backend call", err.Error())
			response.Error = err
			return response
		}

		// Convert sql json to timeseries dataframe
		frame1 := ConvertToFrame(&j.Payload.Avectors)
		frame2 := ConvertToFrame(&j.Payload.Qvatts)
		frame3 := ConvertToFrame(&j.Payload.Qaatts)
		frame4 := ConvertToFrame(&j.Payload.Ecis)
		frame5 := ConvertToFrame(&j.Payload.Batts)
		frame6 := ConvertToFrame(&j.Payload.Bcregs)
		frame7 := ConvertToFrame(&j.Payload.Tsens)
		frame8 := ConvertToFrame(&j.Payload.Cpus)
		frame9 := ConvertToFrame(&j.Payload.Events)
		frame10 := ConvertToFrame(&j.Payload.Mags)
		frame11 := ConvertToFrame(&j.Payload.Geods)
		frame12 := ConvertToFrame(&j.Payload.Geoss)
		frame13 := ConvertToFrame(&j.Payload.Lvlhs)
		frame14 := ConvertToFrame(&j.Payload.Geoidposs)
		frame15 := ConvertToFrame(&j.Payload.Spherposs)
		frame16 := ConvertToFrame(&j.Payload.Qatts)

		// add the frames to the response.
		if frame1 != nil {
			frame1.RefID = "avector"
			response.Frames = append(response.Frames, frame1)
		}
		if frame2 != nil {
			frame2.RefID = "qvatt"
			response.Frames = append(response.Frames, frame2)
		}
		if frame3 != nil {
			frame3.RefID = "qaatt"
			response.Frames = append(response.Frames, frame3)
		}
		if frame4 != nil {
			frame4.RefID = "eci"
			response.Frames = append(response.Frames, frame4)
		}
		if frame5 != nil {
			frame5.RefID = "batt"
			response.Frames = append(response.Frames, frame5)
		}
		if frame6 != nil {
			frame6.RefID = "bcreg"
			response.Frames = append(response.Frames, frame6)
		}
		if frame7 != nil {
			frame7.RefID = "tsen"
			response.Frames = append(response.Frames, frame7)
		}
		if frame8 != nil {
			frame8.RefID = "cpu"
			response.Frames = append(response.Frames, frame8)
		}
		if frame9 != nil {
			frame9.RefID = "event"
			response.Frames = append(response.Frames, frame9)
		}
		if frame10 != nil {
			frame10.RefID = "mag"
			response.Frames = append(response.Frames, frame10)
		}
		if frame11 != nil {
			frame11.RefID = "geod"
			response.Frames = append(response.Frames, frame11)
		}
		if frame12 != nil {
			frame12.RefID = "geos"
			response.Frames = append(response.Frames, frame12)
		}
		if frame13 != nil {
			frame13.RefID = "lvlh"
			response.Frames = append(response.Frames, frame13)
		}
		if frame14 != nil {
			frame14.RefID = "geoidpos"
			response.Frames = append(response.Frames, frame14)
		}
		if frame15 != nil {
			frame15.RefID = "spherpos"
			response.Frames = append(response.Frames, frame15)
		}
		if frame16 != nil {
			frame16.RefID = "qatt"
			response.Frames = append(response.Frames, frame16)
		}
	}

	return response
}

// Convert a json of mysql col/rows into a grafana timeseries data frame
// Heavily references (and abbreviates) executeQuery in grafana/pkg/tsdb/sqleng/sql_engine.go
func ConvertToFrame[T cosmostype](jarg *[]T) *data.Frame {
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
		names = []string{"time", "YAW", "PITCH", "ROLL"}
	case qvatt:
		names = []string{"time", "VYAW", "VPITCH", "VROLL"}
	case qaatt:
		names = []string{"time", "AYAW", "APITCH", "AROLL"}
	case eci:
		names = []string{"time", "s_x", "s_y", "s_z", "v_x", "v_y", "v_z", "a_x", "a_y", "a_z"}
	case batt:
		names = []string{"time", "node", "amp", "power"}
	case bcreg:
		names = []string{"time", "node", "amp", "power"}
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
		names = []string{"time", "s_lat", "s_lon", "s_h", "v_lat", "v_lon", "v_h", "a_lat", "a_lon", "a_h"}
	case geos:
		names = []string{"time", "s_phi", "s_lambda", "s_r", "v_phi", "v_lambda", "v_r", "a_phi", "a_lambda", "a_r"}
	case spherpos:
		names = []string{"time", "s_phi", "s_lambda", "s_r", "v_phi", "v_lambda", "v_r", "a_phi", "a_lambda", "a_r"}
	case lvlh:
		names = []string{"time", "s_d_x", "s_d_y", "s_d_z", "s_w", "v_x", "v_y", "v_z", "a_x", "a_y", "a_z"}
	case qatt:
		names = []string{"time", "s_d_x", "s_d_y", "s_d_z", "s_w", "v_x", "v_y", "v_z", "a_x", "a_y", "a_z"}
	default:
		return nil
	}

	log.DefaultLogger.Error("Checking backend return", "return", (*jarg)[0])

	// ---- FrameFromRows
	// Create response frame
	// Based on sqlutil NewFrame
	//names := []string{"Time", "b", "e", "h"}
	fields := make(data.Fields, len(names))
	for i, v := range names {
		switch v {
		case "time":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeNullableTime, 0)
		case "node":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeNullableString, 0)
		case "node:device":
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeNullableString, 0)
		case "node_name":
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
	frame := data.NewFrame("", fields...)
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
			row[1] = j.B
			row[2] = j.E
			row[3] = j.H
			frame.AppendRow(row...)
		case qvatt:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = j.Qvx
			row[2] = j.Qvy
			row[3] = j.Qvz
			frame.AppendRow(row...)
		case qaatt:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = j.Qax
			row[2] = j.Qay
			row[3] = j.Qaz
			frame.AppendRow(row...)
		case eci:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = j.S_x
			row[2] = j.S_y
			row[3] = j.S_z
			row[4] = j.V_x
			row[5] = j.V_y
			row[6] = j.V_z
			row[7] = j.A_x
			row[8] = j.A_y
			row[9] = j.A_z
			frame.AppendRow(row...)
		case batt:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node
			row[2] = j.Amp
			row[3] = j.Power
			frame.AppendRow(row...)
		case bcreg:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node
			row[2] = j.Amp
			row[3] = j.Power
			frame.AppendRow(row...)
		case tsen:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_Device
			row[2] = j.Temp
			frame.AppendRow(row...)
		case cpu:
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node
			row[2] = j.Load
			row[3] = j.Gib
			row[4] = j.Storage
			frame.AppendRow(row...)
		case event:
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = &j.Node_name
			row[2] = j.Duration
			row[3] = j.Event_id
			row[4] = &j.Event_name
			frame.AppendRow(row...)
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
			frame.AppendRow(row...)
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
			frame.AppendRow(row...)
		case geoidpos:
			log.DefaultLogger.Info("geoidpos test", "s obj Lat ~", j.S.Lat)
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = j.S.Lat
			row[2] = j.S.Lon
			row[3] = j.S.H
			row[4] = j.V.Lat
			row[5] = j.V.Lon
			row[6] = j.V.H
			row[7] = j.A.Lat
			row[8] = j.A.Lon
			row[9] = j.A.H
			frame.AppendRow(row...)
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
			frame.AppendRow(row...)
		case spherpos:
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = j.S.Phi
			row[2] = j.S.Lambda
			row[3] = j.S.R
			row[4] = j.V.Phi
			row[5] = j.V.Lambda
			row[6] = j.V.R
			row[7] = j.A.Phi
			row[8] = j.A.Lambda
			row[9] = j.A.R
			frame.AppendRow(row...)
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
			frame.AppendRow(row...)
		case qatt:
			transform_to_timeseries = false
			timestamp := mjd_to_time(j.Time)
			row := make([]interface{}, len(names))
			row[0] = &timestamp
			row[1] = j.S.D.X
			row[2] = j.S.D.Y
			row[3] = j.S.D.Z
			row[4] = j.S.W
			row[5] = j.V.Col[0]
			row[6] = j.V.Col[1]
			row[7] = j.V.Col[2]
			row[8] = j.A.Col[0]
			row[9] = j.A.Col[1]
			row[10] = j.A.Col[2]
			frame.AppendRow(row...)
		}
	}
	if !transform_to_timeseries {
		return frame
	}
	// ---- end FrameFromRows
	// ---- Format to timeseries
	tsSchema := frame.TimeSeriesSchema()
	if tsSchema.Type == data.TimeSeriesTypeLong {
		var err error
		originalData := frame
		frame, err = data.LongToWide(frame, &data.FillMissing{Mode: data.FillModeNull})
		if err != nil {
			log.DefaultLogger.Error("Error in Cosmos Backend call", err.Error())
			return nil
		}

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

	return frame
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

	var j jsonResponse
	err := d.CosmosBackendCall("Attitude", "", timeRange, &j)
	if err != nil {
		status = backend.HealthStatusError
		message = err.Error()
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}
