import React, { useCallback, useEffect, useRef } from 'react';
import { EventBus, PanelData } from '@grafana/data';
import { IdxDict, RefBcreg, RefTsen, TimeEvent, TimeEventCallback } from '../types';

// Hook to listen to eventBus for cosmos timeevents, running animation callback when event fires
export const useCosmosTimeline = (data: PanelData, eventBus: EventBus, callback: TimeEventCallback) => {
  // ---------------------------------------------------
  // Imperative animation controller
  // Unix seconds timestamp that denotes current time, obtained from cosmos-timeline event publisher
  useEffect(() => {
    const subscriber = eventBus.getStream(TimeEvent).subscribe((event) => {
      if (event.payload.time !== undefined) {
        callback(data, event);
      }
    });
    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus, data, callback]);
};

// ---------------------------------------------------
type DomUpdateReturn = [
  bcregList: React.MutableRefObject<RefBcreg[]>,
  tsenList: React.MutableRefObject<RefTsen[]>,
  callback: (data: PanelData, event: TimeEvent) => void
];
// Imperative animation manager
// removed panelSelected: SelectableValue<string> | undefined
export const useDomUpdate = (data: PanelData): DomUpdateReturn => {
  // An array of references to the text boxes
  // const refInputs = useRef<RefDict>({});
  // The index into the data array
  const refIdxs = useRef<IdxDict>({});
  // dynamic array of mtr device elements
  const bcregList = useRef<RefBcreg[]>([{}]);
  const tsenList = useRef<RefTsen[]>([{}]);

  useEffect(() => {
    // Clean up renderer on unmount
    return () => {};
  }, []);

  // ---------------------------------------------------
  // Imperative animation update call
  const updateDOMRefs = useCallback(
    (data: PanelData, event: TimeEvent) => {
      if (
        !data.series.length || // Check if there is valid query result
        data.series[0].fields.length < 2 // || // Check if there are time and value columns in query
        //refIdx.current >= data.series[0].fields[0].values.length // Check if there are values in those columns
      ) {
        return;
      }
      // converts radians to degrees: 1rad x (180/PI) = DEGREE
      // const rad2deg: number = 180 / Math.PI;
      // console.log('rad 2 deg: ', rad2deg);
      // result: rad 2 deg:  57.29577951308232
      for (const query of data.series) {
        function time_scrub(panel: string) {
          const timeValues = query.fields[0].values;
          // console.log('time values: ', timeValues);
          // console.log('time values length: ', timeValues.length);
          if (timeValues.length === 0) {
            return;
          }
          // If index is out of bounds, set it back to the start
          if (
            refIdxs.current[panel as keyof IdxDict] === undefined ||
            // refIdxs.current[input_field_key]! >= timeValues.length - 1 ||
            refIdxs.current[panel as keyof IdxDict]! < 0
          ) {
            refIdxs.current[panel as keyof IdxDict] = undefined;
          }
          // find time values minimum bound
          const time_min_bound = timeValues.get(0);
          if (time_min_bound > event.payload.time!) {
            // filter out payload preceeding data range
            // console.log('time min bound', time_min_bound);
            return;
          } else {
            // check max bound
            const max_index = timeValues.length - 1;
            const time_max_bound = timeValues.get(max_index);
            if (time_max_bound < event.payload.time!) {
              // filter out payload after data range
              // console.log('time max bound', time_max_bound);
              refIdxs.current[panel as keyof IdxDict] = max_index;
            } else {
              // the inner case for payload within data range
              // iterate over data array for best fit timestamp
              for (let t_index = 0; t_index < timeValues.length - 1; t_index++) {
                // time = timeValues[refIdxs.current[input_field_key]!];
                let t_time = timeValues.get(t_index);
                // console.log('timevalues', timeValues, 't time', t_time, 'time diff', event.payload.time! - t_time);
                if (t_time === event.payload.time!) {
                  refIdxs.current[panel as keyof IdxDict]! = t_index;
                  // console.log("t_time === event.payload.time!", t_index);
                  break;
                }
                if (t_time > event.payload.time!) {
                  if (t_index > 0) {
                    let t_time_minus = timeValues.get(t_index - 1);
                    if (t_time_minus > event.payload.time!) {
                      for (let t_index_minus = t_index - 1; t_time_minus < event.payload.time!; t_time_minus--) {
                        // console.log('backwards scrub', t_index);
                        let t_time_minus_minus = timeValues.get(t_index_minus);
                        if (t_time_minus_minus < event.payload.time!) {
                          refIdxs.current[panel as keyof IdxDict]! = t_index_minus;
                          // console.log('backwards scrub done', t_index);
                          break;
                        }
                      }
                      break;
                    } else {
                      // this is the one
                      refIdxs.current[panel as keyof IdxDict]! = t_index - 1;
                      // console.log("t_time_minus < event.payload.time! index zero, return", t_index - 1);
                      break;
                    }
                  } else {
                    refIdxs.current[panel as keyof IdxDict]! = 0;
                    // console.log("t_time > event.payload.time! index zero, return", t_index);
                    return;
                  }
                } else if (t_time < event.payload.time!) {
                  if (t_index === timeValues.length - 1) {
                    // console.log("t_time < event.payload.time! max index", t_index);
                    refIdxs.current[panel as keyof IdxDict]! = t_index;
                    break;
                  }
                  let t_time_plus = timeValues.get(t_index + 1);
                  if (t_time_plus > event.payload.time!) {
                    refIdxs.current[panel as keyof IdxDict]! = t_index;
                    // console.log("t_time < event.payload.time!", t_index);
                    break;
                  }
                }
              }
            }
          }
        };
        // console.log('data ', data);
        let focusPanel = query.meta?.custom?.type;
        if (['bcreg'].some((x) => x === focusPanel)) {
          // let panel = query.meta?.custom?.type
          if ('bcreg' === focusPanel) {
            time_scrub('bcreg');
            // set values
            // match unique device by filtering columns on fields.labels.name === ref.device_name
            Object.entries(bcregList).forEach(([index, Bcreg_Object]) => {
              Bcreg_Object.forEach((bcreg: RefBcreg) => {
                let bcreg_temp_field = query.fields?.find((field) => field.name === 'temp' && field.labels?.name === bcreg.bcreg_name!.value);
                bcreg.temp!.value = (bcreg_temp_field?.values.get(refIdxs.current['bcreg']!)).toFixed(2).toString() ?? 0;
              });
            });
          }
        } // bcreg data mapping done
        else if (['tsen'].some((x) => x === focusPanel)) {
          // let panel = query.meta?.custom?.type
          if ('tsen' === focusPanel) {
            time_scrub('tsen');
            // set values
            // match unique device by filtering columns on fields.labels.name === ref.device_name
            Object.entries(tsenList).forEach(([index, Tsen_Object]) => {
              Tsen_Object.forEach((tsen: RefTsen) => {
                let tsen_temp_field = query.fields?.find((field) => field.name === 'temp' && field.labels?.name === tsen.tsen_name!.value);
                tsen.temp!.value = (tsen_temp_field?.values.get(refIdxs.current['tsen']!)).toFixed(2).toString() ?? 0;
              });
            });
          }
        } // tsen data mapping done
        //
      } // data series query loop
    },  // end update dom ref
    []  // panelSelected removed
  );

  return [bcregList, tsenList, updateDOMRefs];
};
