import React, { useCallback, useEffect, useRef } from 'react';
import { EventBus, PanelData } from '@grafana/data';
import { IdxDict, RefDict, RefMtr, RefRw, RefImu, RefSsen, RefGps, RefAdcstot, TimeEvent, TimeEventCallback, input_field } from '../types';

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
  refInputs: React.MutableRefObject<RefDict>,
  mtrList: React.MutableRefObject<RefMtr[]>,
  rwList: React.MutableRefObject<RefRw[]>,
  imuList: React.MutableRefObject<RefImu[]>,
  ssenList: React.MutableRefObject<RefSsen[]>,
  gpsList: React.MutableRefObject<RefGps[]>,
  adcstotList: React.MutableRefObject<RefAdcstot[]>,
  callback: (data: PanelData, event: TimeEvent) => void
];
// Imperative animation manager
// removed panelSelected: SelectableValue<string> | undefined
export const useDomUpdate = (data: PanelData): DomUpdateReturn => {
  // An array of references to the text boxes
  const refInputs = useRef<RefDict>({});
  // The index into the data array
  const refIdxs = useRef<IdxDict>({});
  // dynamic array of mtr device elements
  const mtrList = useRef<RefMtr[]>([{}]);
  // dynamic array of rw device elements
  const rwList = useRef<RefRw[]>([{}]);
  const imuList = useRef<RefImu[]>([{}]);
  const ssenList = useRef<RefSsen[]>([{}]);
  const gpsList = useRef<RefGps[]>([{}]);
  const adcstotList = useRef<RefAdcstot[]>([{}]);

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
      const rad2deg: number = 180 / Math.PI;
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
        // let focusPanel = data.series[0].meta?.custom?.type;
        let focusPanel = query.meta?.custom?.type;
        if (['mtr', 'rw'].some((x) => x === focusPanel)) {
          // filter for mtr/ rw, iterate over variable ref lists...
          // FOR BOTH queries 
          // let panel = query.meta?.custom?.type
          if ('mtr' === focusPanel) {
            time_scrub('mtr_torq');
            // mtr case

            // const timeValues = query.fields[0].values;
            // // console.log('time values: ', timeValues);
            // // console.log('time values length: ', timeValues.length);
            // if (timeValues.length === 0) {
            //   return;
            // }
            // // If index is out of bounds, set it back to the start
            // if (
            //   refIdxs.current['mtr_torq'] === undefined ||
            //   // refIdxs.current[input_field_key]! >= timeValues.length - 1 ||
            //   refIdxs.current['mtr_torq']! < 0

            // ) {
            //   refIdxs.current['mtr_torq'] = 0;
            // }
            // // find time values minimum bound
            // const time_min_bound = timeValues.get(0);
            // if (time_min_bound > event.payload.time!) {
            //   // filter out payload preceeding data range
            //   // console.log('time min bound', time_min_bound);
            //   return;
            // } else {
            //   // check max bound
            //   const max_index = timeValues.length - 1;
            //   const time_max_bound = timeValues.get(max_index);
            //   if (time_max_bound < event.payload.time!) {
            //     // filter out payload after data range
            //     // console.log('time max bound', time_max_bound);
            //     refIdxs.current['mtr_torq'] = max_index;
            //   } else {
            //     // the inner case for payload within data range
            //     // iterate over data array for best fit timestamp
            //     for (let t_index = 0; t_index < timeValues.length - 1; t_index++) {
            //       // time = timeValues[refIdxs.current[input_field_key]!];
            //       let t_time = timeValues.get(t_index);
            //       // console.log('timevalues', timeValues, 't time', t_time, 'time diff', event.payload.time! - t_time);
            //       if (t_time === event.payload.time!) {
            //         refIdxs.current['mtr_torq']! = t_index;
            //         // console.log("t_time === event.payload.time!", t_index);
            //         break;
            //       }
            //       if (t_time > event.payload.time!) {
            //         if (t_index > 0) {
            //           let t_time_minus = timeValues.get(t_index - 1);
            //           if (t_time_minus > event.payload.time!) {
            //             for (let t_index_minus = t_index - 1; t_time_minus < event.payload.time!; t_time_minus--) {
            //               // console.log('backwards scrub', t_index);
            //               let t_time_minus_minus = timeValues.get(t_index_minus);
            //               if (t_time_minus_minus < event.payload.time!) {
            //                 refIdxs.current['mtr_torq']! = t_index_minus;
            //                 // console.log('backwards scrub done', t_index);
            //                 break;
            //               }
            //             }
            //             break;
            //           } else {
            //             // this is the one
            //             refIdxs.current['mtr_torq']! = t_index - 1;
            //             // console.log("t_time_minus < event.payload.time! index zero, return", t_index - 1);
            //             break;
            //           }
            //         } else {
            //           refIdxs.current['mtr_torq']! = 0;
            //           // console.log("t_time > event.payload.time! index zero, return", t_index);
            //           return;
            //         }
            //       } else if (t_time < event.payload.time!) {
            //         if (t_index === timeValues.length - 1) {
            //           // console.log("t_time < event.payload.time! max index", t_index);
            //           refIdxs.current['mtr_torq']! = t_index;
            //           break;
            //         }
            //         let t_time_plus = timeValues.get(t_index + 1);
            //         if (t_time_plus > event.payload.time!) {
            //           refIdxs.current['mtr_torq']! = t_index;
            //           // console.log("t_time < event.payload.time!", t_index);
            //           break;
            //         }
            //       }
            //     }
            //   }
            // }
            //
            // set mtr values
            // match unique device by filtering columns on fields.labels.name === refmtr.device_name
            Object.entries(mtrList).forEach(([index, Mtr_Object]) => {
              Mtr_Object.forEach((mtr: RefMtr) => {
                // console.log("inside the mtr", mtr);
                // query.fields.filter((field) => field.labels?.name === mtr.mtr_name!.value);
                // let mtr_name_field = query.fields?.find((field) => field.name === 'name' && field.labels?.name === mtr.mtr_name!.value);
                // mtr.mtr_name!.value = mtr_name_field?.labels?.name ?? '';
                // console.log("mtr name", mtr.mtr_name!.value);
                let mtr_torq_field = query.fields?.find((field) => field.name === 'mtr_torq' && field.labels?.name === mtr.mtr_name!.value);
                mtr.mtr_torq!.value = mtr_torq_field?.values.get(refIdxs.current['mtr_torq']!) ?? 0;
                let mtr_a_field = query.fields?.find((field) => field.name === 'mtr_a' && field.labels?.name === mtr.mtr_name!.value);
                mtr.mtr_a!.value = mtr_a_field?.values.get(refIdxs.current['mtr_torq']!) ?? 0;
              });
            });
          } else if ('rw' === focusPanel) {
            time_scrub('rw_torq');
            // rw case

            // const timeValues = query.fields[0].values;
            // // console.log('time values: ', timeValues);
            // // console.log('time values length: ', timeValues.length);
            // if (timeValues.length === 0) {
            //   return;
            // }
            // // If index is out of bounds, set it back to the start
            // if (
            //   refIdxs.current['rw_torq'] === undefined ||
            //   // refIdxs.current[input_field_key]! >= timeValues.length - 1 ||
            //   refIdxs.current['rw_torq']! < 0

            // ) {
            //   refIdxs.current['rw_torq'] = 0;
            // }
            // // find time values minimum bound
            // const time_min_bound = timeValues.get(0);
            // if (time_min_bound > event.payload.time!) {
            //   // filter out payload preceeding data range
            //   // console.log('time min bound', time_min_bound);
            //   return;
            // } else {
            //   // check max bound
            //   const max_index = timeValues.length - 1;
            //   const time_max_bound = timeValues.get(max_index);
            //   if (time_max_bound < event.payload.time!) {
            //     // filter out payload after data range
            //     // console.log('time max bound', time_max_bound);
            //     refIdxs.current['rw_torq'] = max_index;
            //   } else {
            //     // the inner case for payload within data range
            //     // iterate over data array for best fit timestamp
            //     for (let t_index = 0; t_index < timeValues.length - 1; t_index++) {
            //       // time = timeValues[refIdxs.current[input_field_key]!];
            //       let t_time = timeValues.get(t_index);
            //       // console.log('timevalues', timeValues, 't time', t_time, 'time diff', event.payload.time! - t_time);
            //       if (t_time === event.payload.time!) {
            //         refIdxs.current['rw_torq']! = t_index;
            //         // console.log("t_time === event.payload.time!", t_index);
            //         break;
            //       }
            //       if (t_time > event.payload.time!) {
            //         if (t_index > 0) {
            //           let t_time_minus = timeValues.get(t_index - 1);
            //           if (t_time_minus > event.payload.time!) {
            //             for (let t_index_minus = t_index - 1; t_time_minus < event.payload.time!; t_time_minus--) {
            //               // console.log('backwards scrub', t_index);
            //               let t_time_minus_minus = timeValues.get(t_index_minus);
            //               if (t_time_minus_minus < event.payload.time!) {
            //                 refIdxs.current['rw_torq']! = t_index_minus;
            //                 // console.log('backwards scrub done', t_index);
            //                 break;
            //               }
            //             }
            //             break;
            //           } else {
            //             // this is the one
            //             refIdxs.current['rw_torq']! = t_index - 1;
            //             // console.log("t_time_minus < event.payload.time! index zero, return", t_index - 1);
            //             break;
            //           }
            //         } else {
            //           refIdxs.current['rw_torq']! = 0;
            //           // console.log("t_time > event.payload.time! index zero, return", t_index);
            //           return;
            //         }
            //       } else if (t_time < event.payload.time!) {
            //         if (t_index === timeValues.length - 1) {
            //           // console.log("t_time < event.payload.time! max index", t_index);
            //           refIdxs.current['rw_torq']! = t_index;
            //           break;
            //         }
            //         let t_time_plus = timeValues.get(t_index + 1);
            //         if (t_time_plus > event.payload.time!) {
            //           refIdxs.current['rw_torq']! = t_index;
            //           // console.log("t_time < event.payload.time!", t_index);
            //           break;
            //         }
            //       }
            //     }
            //   }
            // }

            // set rw values
            // match unique device by filtering columns on fields.labels.name === refrw.device_name
            Object.entries(rwList).forEach(([index, Rw_Object]) => {
              Rw_Object.forEach((rw: RefRw) => {
                // console.log("inside the mtr", mtr);
                // query.fields.filter((field) => field.labels?.name === rw.rw_name!.value);
                let rw_torq_field = query.fields?.find((field) => field.name === 'rw_torq' && field.labels?.name === rw.rw_name!.value);
                rw.rw_torq!.value = rw_torq_field?.values.get(refIdxs.current['rw_torq']!) ?? 0;
                let rw_rpm_field = query.fields?.find((field) => field.name === 'rw_rpm' && field.labels?.name === rw.rw_name!.value);
                rw.rw_rpm!.value = rw_rpm_field?.values.get(refIdxs.current['rw_torq']!) ?? 0;
              });
            });
            // console.log("rw list", rwList);
          }
        } else if (['imu'].some((x) => x === focusPanel)) {
          // imu case
          time_scrub('theta_x');
          Object.entries(imuList).forEach(([index, Imu_Object]) => {
            Imu_Object.forEach((imu: RefImu) => {
              let theta_x_field = query.fields?.find((field) => field.name === 'theta_x' && field.labels?.name === imu.imu_name!.value);
              imu.theta_x!.value = theta_x_field?.values.get(refIdxs.current['theta_x']!) ?? 0;
              let theta_y_field = query.fields?.find((field) => field.name === 'theta_y' && field.labels?.name === imu.imu_name!.value);
              imu.theta_y!.value = theta_y_field?.values.get(refIdxs.current['theta_x']!) ?? 0;
              let theta_z_field = query.fields?.find((field) => field.name === 'theta_z' && field.labels?.name === imu.imu_name!.value);
              imu.theta_z!.value = theta_z_field?.values.get(refIdxs.current['theta_x']!) ?? 0;
              let theta_w_field = query.fields?.find((field) => field.name === 'theta_w' && field.labels?.name === imu.imu_name!.value);
              imu.theta_w!.value = theta_w_field?.values.get(refIdxs.current['theta_x']!) ?? 0;
              let omega_x_field = query.fields?.find((field) => field.name === 'omega_x' && field.labels?.name === imu.imu_name!.value);
              imu.omega_x!.value = omega_x_field?.values.get(refIdxs.current['theta_x']!) ?? 0;
              let omega_y_field = query.fields?.find((field) => field.name === 'omega_y' && field.labels?.name === imu.imu_name!.value);
              imu.omega_y!.value = omega_y_field?.values.get(refIdxs.current['theta_x']!) ?? 0;
              let omega_z_field = query.fields?.find((field) => field.name === 'omega_z' && field.labels?.name === imu.imu_name!.value);
              imu.omega_z!.value = omega_z_field?.values.get(refIdxs.current['theta_x']!) ?? 0;
              let mag_x_field = query.fields?.find((field) => field.name === 'mag_x' && field.labels?.name === imu.imu_name!.value);
              imu.mag_x!.value = mag_x_field?.values.get(refIdxs.current['theta_x']!) ?? 0;
              let mag_y_field = query.fields?.find((field) => field.name === 'mag_y' && field.labels?.name === imu.imu_name!.value);
              imu.mag_y!.value = mag_y_field?.values.get(refIdxs.current['theta_x']!) ?? 0;
              let mag_z_field = query.fields?.find((field) => field.name === 'mag_z' && field.labels?.name === imu.imu_name!.value);
              imu.mag_z!.value = mag_z_field?.values.get(refIdxs.current['theta_x']!) ?? 0;
            });
          });
        } else if (['ssen'].some((x) => x === focusPanel)) {
          // ssen case
          time_scrub('qva');
          Object.entries(ssenList).forEach(([index, Ssen_Object]) => {
            Ssen_Object.forEach((ssen: RefSsen) => {
              let qva_field = query.fields?.find((field) => field.name === 'qva' && field.labels?.name === ssen.ssen_name!.value);
              ssen.qva!.value = qva_field?.values.get(refIdxs.current['qva']!) ?? 0;
              let qvb_field = query.fields?.find((field) => field.name === 'qvb' && field.labels?.name === ssen.ssen_name!.value);
              ssen.qvb!.value = qvb_field?.values.get(refIdxs.current['qva']!) ?? 0;
              let qvc_field = query.fields?.find((field) => field.name === 'qvc' && field.labels?.name === ssen.ssen_name!.value);
              ssen.qvc!.value = qvc_field?.values.get(refIdxs.current['qva']!) ?? 0;
              let qvd_field = query.fields?.find((field) => field.name === 'qvd' && field.labels?.name === ssen.ssen_name!.value);
              ssen.qvd!.value = qvd_field?.values.get(refIdxs.current['qva']!) ?? 0;
              let azi_field = query.fields?.find((field) => field.name === 'azi' && field.labels?.name === ssen.ssen_name!.value);
              ssen.azi!.value = (azi_field?.values.get(refIdxs.current['qva']!) * rad2deg).toFixed(5).toString() ?? 0;
              let elev_field = query.fields?.find((field) => field.name === 'elev' && field.labels?.name === ssen.ssen_name!.value);
              ssen.elev!.value = (elev_field?.values.get(refIdxs.current['qva']!) * rad2deg).toFixed(5).toString() ?? 0;
            });
          });
        } else if (['gps'].some((x) => x === focusPanel)) {
          // gps case
          time_scrub('geoc_s_x');
          Object.entries(gpsList).forEach(([index, Gps_Object]) => {
            Gps_Object.forEach((gps: RefGps) => {
              let geoc_s_x_field = query.fields?.find((field) => field.name === 'geoc_s_x' && field.labels?.name === gps.gps_name!.value);
              gps.geoc_s_x!.value = geoc_s_x_field?.values.get(refIdxs.current['geoc_s_x']!) ?? 0;
              let geoc_s_y_field = query.fields?.find((field) => field.name === 'geoc_s_y' && field.labels?.name === gps.gps_name!.value);
              gps.geoc_s_y!.value = geoc_s_y_field?.values.get(refIdxs.current['geoc_s_x']!) ?? 0;
              let geoc_s_z_field = query.fields?.find((field) => field.name === 'geoc_s_z' && field.labels?.name === gps.gps_name!.value);
              gps.geoc_s_z!.value = geoc_s_z_field?.values.get(refIdxs.current['geoc_s_x']!) ?? 0;
              let geod_s_lat_field = query.fields?.find((field) => field.name === 'geod_s_lat' && field.labels?.name === gps.gps_name!.value);
              gps.geod_s_lat!.value = geod_s_lat_field?.values.get(refIdxs.current['geoc_s_x']!) ?? 0;
              let geod_s_lon_field = query.fields?.find((field) => field.name === 'geod_s_lon' && field.labels?.name === gps.gps_name!.value);
              gps.geod_s_lon!.value = (geod_s_lon_field?.values.get(refIdxs.current['geoc_s_x']!) * rad2deg).toFixed(5).toString() ?? 0;
              let geod_s_alt_field = query.fields?.find((field) => field.name === 'geod_s_alt' && field.labels?.name === gps.gps_name!.value);
              gps.geod_s_alt!.value = (geod_s_alt_field?.values.get(refIdxs.current['geoc_s_x']!) * rad2deg).toFixed(5).toString() ?? 0;
            });
          });
        } else {
          // proceed to the object iteration of refInputs for all other panels
          // Update field values
          Object.entries(refInputs.current).forEach(([key, ref]) => {
            if (ref !== null) {
              // Note, this type cast does NOT ensure that key is in input_field
              const input_field_key = key as input_field;
              if (!data.series.length) {
                return;
              }

              let live_data = data.series.filter((row) => row.meta?.custom?.type === focusPanel);
              // console.log("adcs subsystem all data", data);
              const field = live_data[0].fields?.find((field) => field.name === key);
              // select for device name.... with fields.labels.name ... for field didx in data frame... 
              // console.log("select filtered field: ", field);
              if (field === undefined) {
                return;
              }
              // Query must have returned some values
              const timeValues = live_data[0].fields[0].values;
              // console.log('time values: ', timeValues);
              // console.log('time values length: ', timeValues.length);
              if (timeValues.length === 0) {
                return;
              }
              // If index is out of bounds, set it back to the start
              if (
                refIdxs.current[input_field_key] === undefined ||
                // refIdxs.current[input_field_key]! >= timeValues.length - 1 ||
                refIdxs.current[input_field_key]! < 0

              ) {
                refIdxs.current[input_field_key] = 0;
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
                  refIdxs.current[input_field_key] = max_index;
                } else {
                  // the inner case for payload within data range
                  // iterate over data array for best fit timestamp
                  for (let t_index = 0; t_index < timeValues.length - 1; t_index++) {
                    // time = timeValues[refIdxs.current[input_field_key]!];
                    let t_time = timeValues.get(t_index);
                    // console.log('timevalues', timeValues, 't time', t_time, 'time diff', event.payload.time! - t_time);
                    if (t_time === event.payload.time!) {
                      refIdxs.current[input_field_key]! = t_index;
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
                              refIdxs.current[input_field_key]! = t_index_minus;
                              // console.log('backwards scrub done', t_index);
                              break;
                            }
                          }
                          break;
                        } else {
                          // this is the one
                          refIdxs.current[input_field_key]! = t_index - 1;
                          // console.log("t_time_minus < event.payload.time! index zero, return", t_index - 1);
                          break;
                        }
                      } else {
                        refIdxs.current[input_field_key]! = 0;
                        // console.log("t_time > event.payload.time! index zero, return", t_index);
                        return;
                      }
                    } else if (t_time < event.payload.time!) {
                      if (t_index === timeValues.length - 1) {
                        // console.log("t_time < event.payload.time! max index", t_index);
                        refIdxs.current[input_field_key]! = t_index;
                        break;
                      }
                      let t_time_plus = timeValues.get(t_index + 1);
                      if (t_time_plus > event.payload.time!) {
                        refIdxs.current[input_field_key]! = t_index;
                        // console.log("t_time < event.payload.time!", t_index);
                        break;
                      }
                    }
                  }
                }
              }
              // Finally, update display with most up-to-date values
              const currentValue: number = field.values.get(refIdxs.current[input_field_key]!) ?? 0;
              if (['azi', 'elev'].some((x) => x === key)) {
                let newValue = currentValue * rad2deg;
                ref.value = newValue.toFixed(5).toString();
              } else {
                let newValue = currentValue.toFixed(2).toString();
                ref.value = newValue;
              }
            }
          }); // end general object ref parse
        }
      }
    }, // end update dom ref
    [] // panelSelected removed
  );

  return [refInputs, mtrList, rwList, imuList, ssenList, gpsList, adcstotList, updateDOMRefs];
};
