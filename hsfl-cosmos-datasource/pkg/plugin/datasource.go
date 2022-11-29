package plugin

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
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
func (d *Datasource) GetEndpoint(timeRange backend.TimeRange) (string, error) {
	base := d.url + "/db/attitude/"
	req, err := http.NewRequest("GET", base, nil)
	if err != nil {
		log.DefaultLogger.Error("Error in http.NewRequest", err.Error())
		return "", err
	}
	q := req.URL.Query()
	q.Add("from", timeRange.From.Format("2006-01-02 15:04:05.9"))
	q.Add("to", timeRange.To.Format("2006-01-02 15:04:05.9"))
	req.URL.RawQuery = q.Encode()

	return req.URL.String(), nil
}

// msg: json encoded string
// url: URL or Hostname of API endpoint
func (d *Datasource) CosmosBackendCall(timeRange backend.TimeRange) ([]byte, error) {
	endpoint, err := d.GetEndpoint(timeRange)
	if err != nil {
		return nil, err
	}

	// Attempt tcp connection (UDP packets have a size limit)
	// buf := bytes.NewBuffer(nil)
	// resp, err := http.Get(endpoint, "application/json", buf)
	resp, err := http.Get(endpoint)
	// POST
	if err != nil {
		log.DefaultLogger.Error("Error in POST", err.Error())
		return nil, err
	}
	defer resp.Body.Close()
	// Read response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.DefaultLogger.Error("Error reading body of POST response", err.Error())
	}

	return body, nil
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

type queryModel struct {
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

	bytes, err := d.CosmosBackendCall(query.TimeRange)
	if err != nil {
		log.DefaultLogger.Error("Error in Cosmos Backend call", err.Error())
		response.Error = err
		return response
	}
	var j jsonResponse
	err = json.Unmarshal(bytes, &j)
	//err = json.Unmarshal(bytes, &j)
	if err != nil {
		log.DefaultLogger.Error("Error in query JSON unmarshal", err.Error())
		response.Error = err
		return response
	}

	// Convert sql json to timeseries dataframe
	frame1 := ConvertToFrame(&j.Payload.Avectors)
	frame2 := ConvertToFrame(&j.Payload.Qvatts)
	frame3 := ConvertToFrame(&j.Payload.Qaatts)

	// add the frames to the response.
	response.Frames = append(response.Frames, frame1, frame2, frame3)

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
		names = []string{"Time", "YAW", "PITCH", "ROLL"}
	case qvatt:
		names = []string{"Time", "VYAW", "VPITCH", "VROLL"}
	case qaatt:
		names = []string{"Time", "AYAW", "APITCH", "AROLL"}
	default:
		return nil
	}

	// ---- FrameFromRows
	// Create response frame
	// Based on sqlutil NewFrame
	//names := []string{"Time", "b", "e", "h"}
	fields := make(data.Fields, len(names))
	for i, v := range names {
		if v == "Time" {
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeNullableTime, 0)
		} else {
			fields[i] = data.NewFieldFromFieldType(data.FieldTypeFloat64, 0)
		}
		fields[i].Name = names[i]
	}
	frame := data.NewFrame("", fields...)

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
			timestamp, err := time.Parse(time.RFC3339, j.Time)
			if err != nil {
				log.DefaultLogger.Error("Error in timestamp conversion", err.Error())
				return nil
			}
			row := make([]interface{}, 4)
			row[0] = &timestamp
			row[1] = j.B
			row[2] = j.E
			row[3] = j.H
			frame.AppendRow(row...)
		case qvatt:
			timestamp, err := time.Parse(time.RFC3339, j.Time)
			if err != nil {
				log.DefaultLogger.Error("Error in timestamp conversion", err.Error())
				return nil
			}
			row := make([]interface{}, 4)
			row[0] = &timestamp
			row[1] = j.Qvx
			row[2] = j.Qvy
			row[3] = j.Qvz
			frame.AppendRow(row...)
		case qaatt:
			timestamp, err := time.Parse(time.RFC3339, j.Time)
			if err != nil {
				log.DefaultLogger.Error("Error in timestamp conversion", err.Error())
				return nil
			}
			row := make([]interface{}, 4)
			row[0] = &timestamp
			row[1] = j.Qax
			row[2] = j.Qay
			row[3] = j.Qaz
			frame.AppendRow(row...)
		}
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

	_, err := d.CosmosBackendCall(timeRange)
	if err != nil {
		status = backend.HealthStatusError
		message = err.Error()
	}

	return &backend.CheckHealthResult{
		Status:  status,
		Message: message,
	}, nil
}
