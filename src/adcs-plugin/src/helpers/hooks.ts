import { useCallback, useEffect, useRef } from 'react';
import { EventBus, PanelData } from '@grafana/data';
import { RefDict, TimeEvent, TimeEventCallback } from '../types';
import * as THREE from 'three';

// Hook to listen to eventBus for cosmos timeevents, running animation callback when event fires
export const useCosmosTimeline = (data: PanelData, eventBus: EventBus, callback: TimeEventCallback) => {
  // const [entity, setEntity] = useState<TimeEvent>();
  // ---------------------------------------------------
  // Imperative animation controller
  // Unix seconds timestamp that denotes current time, obtained from cosmos-timeline event publisher
  useEffect(() => {
    const subscriber = eventBus.getStream(TimeEvent).subscribe({
      next: (event: TimeEvent) => {
        if (event.payload.time !== undefined) {
          callback(data, event);
        }
      },
    });
    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus, data, callback]);
};

// ---------------------------------------------------
type DomUpdateReturn = [
  refRenderer: React.MutableRefObject<THREE.WebGLRenderer | undefined>,
  refScene: React.MutableRefObject<THREE.Scene | undefined>,
  refCamera: React.MutableRefObject<THREE.OrthographicCamera | undefined>,
  refModel: React.MutableRefObject<THREE.Group | undefined>,
  refSun: React.MutableRefObject<THREE.ArrowHelper | undefined>,
  refNad: React.MutableRefObject<THREE.ArrowHelper | undefined>,
  refInputs: React.MutableRefObject<RefDict>,
  refDS: React.MutableRefObject<string | undefined>,
  refUS: React.MutableRefObject<string | undefined>,
  callback: (data: PanelData, event: TimeEvent) => void
];

// Imperative animation manager
export const useDomUpdate = (data: PanelData): DomUpdateReturn => {
  //const refId = useRef<number>(0);
  //const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
  const refRenderer = useRef<THREE.WebGLRenderer>();
  const refScene = useRef<THREE.Scene>();
  const refCamera = useRef<THREE.OrthographicCamera>();
  const refModel = useRef<THREE.Group>();
  const refSun = useRef<THREE.ArrowHelper>();
  const refNad = useRef<THREE.ArrowHelper>();
  // An array of references to the text boxes
  const refInputs = useRef<RefDict>({});
  // The index into the data array
  const refIdxs = useRef<number[]>([]);
  // the data state from selection: {LVLH: qatt, ICRF: eci}
  // to reference & filter query data.meta.custom == qatt || eci
  const refDS = useRef<string>();
  // the units string RAD||DEG
  const refUS = useRef<string>();
  // console.log('useDomUpdate');
  // console.log('update DOM refInputs.current: ', refInputs.current);
  useEffect(() => {
    // Clean up renderer on unmount
    return () => {
      if (refRenderer.current !== undefined) {
        refRenderer.current.dispose();
        refRenderer.current = undefined;
      }
    };
  }, []);

  // Update refIdxs
  useEffect(() => {
    // console.log('Update refIdxs');

    // Array of references
    // Number of columns is the total -1 to exclude the time column
    // - 2 for node name, node type
    let numColumns = 0;
    for (let i = 0; i < data.series.length; i++) {
      numColumns += data.series[i].fields.length - 3;
    }
    // Array of indices
    if (refIdxs.current.length < numColumns) {
      for (let i = refIdxs.current.length; i < numColumns; i++) {
        refIdxs.current.push(0);
      }
    } else {
      refIdxs.current = refIdxs.current.slice(0, numColumns);
    }
  }, [data]);

  // ---------------------------------------------------
  // Imperative animation update call
  const updateDOMRefs = useCallback((data: PanelData, event: TimeEvent) => {
    if (
      !data.series.length || // Check if there is valid query result
      data.series[0].fields.length < 2 // || // Check if there are time and value columns in query
      //refIdx.current >= data.series[0].fields[0].values.length // Check if there are values in those columns
    ) {
      // console.log('no data updateDOMRefs in hooks');
      return;
    }

    // filter data based on current data series type;
    const DataMap: Object = {
      ICRF: 'adcsstruc',
      LVLH: 'ladcsstruc',
      GEOC: 'gadcsstruc',
    };
    // set default dataframe
    if (refDS.current === undefined) {
      refDS.current = 'ICRF';
    }
    // filter multi-query for data frame selected
    let live_data = data.series.filter((row) => row.meta?.custom?.type === DataMap[refDS.current as keyof Object]);
    // Keep a reference to the ICRF query results,
    // since the ICRF quaternions will be reused for every coordinate frame selection.
    // The sun and nadir info in the ICRF query results will also be found in the ICRF query results.
    let icrf_data = data.series.filter((row) => row.meta?.custom?.type === 'adcsstruc');
    if (live_data === undefined || icrf_data === undefined)
    {
      return;
    }
    // console.log('Live filtered data: ', live_data);
    // console.log('refds current: ', refDS.current);
    // console.log('refUS current: ', refUS.current);

    // converts radians to degrees: 1rad x (180/PI) = DEGREE
    const rad2deg: number = 180 / Math.PI;
    // console.log('rad 2 deg: ', rad2deg);
    // result: rad 2 deg:  57.29577951308232
    // let units: string = 'radians'; // radians // degrees
    let units: string = refUS.current!; // radians // degrees

    // let yaw = 0;
    // let pitch = 0;
    // let roll = 0;
    // sun vector
    let sunx = icrf_data[0].fields.find((field) => field.name === 'sun_x');
    let suny = icrf_data[0].fields.find((field) => field.name === 'sun_y');
    let sunz = icrf_data[0].fields.find((field) => field.name === 'sun_z');
    let new_sundir: THREE.Vector3;
    // nadir vector
    let nadx = icrf_data[0].fields.find((field) => field.name === 'nad_x');
    let nady = icrf_data[0].fields.find((field) => field.name === 'nad_y');
    let nadz = icrf_data[0].fields.find((field) => field.name === 'nad_z');
    let new_naddir: THREE.Vector3;
    let sunx_d = 0;
    let suny_d = 0;
    let sunz_d = 0;
    let nadx_d = 0;
    let nady_d = 0;
    let nadz_d = 0;

    // the ATT ICRF S quaternion
    let icrf_s_q_x = icrf_data[0].fields.find((field) => field.name === 'q_s_x');
    let icrf_s_q_y = icrf_data[0].fields.find((field) => field.name === 'q_s_y');
    let icrf_s_q_z = icrf_data[0].fields.find((field) => field.name === 'q_s_z');
    let icrf_s_q_w = icrf_data[0].fields.find((field) => field.name === 'q_s_w');
    let icrf_s_q_x_d = 0;
    let icrf_s_q_y_d = 0;
    let icrf_s_q_z_d = 0;
    let icrf_s_q_w_d = 0;
    let icrf_s_quaternion = new THREE.Quaternion();

    // the ATT LVLH/ GEOC S quaternion
    let sqatt_x = live_data[0].fields.find((field) => field.name === 'sqatt_x');
    let sqatt_y = live_data[0].fields.find((field) => field.name === 'sqatt_y');
    let sqatt_z = live_data[0].fields.find((field) => field.name === 'sqatt_z');
    let sqatt_w = live_data[0].fields.find((field) => field.name === 'sqatt_w');
    let sqatt_x_d = 0;
    let sqatt_y_d = 0;
    let sqatt_z_d = 0;
    let sqatt_w_d = 0;
    let s_quaternion = new THREE.Quaternion();

    // console.log('update DOM refInputs.current: ', refInputs.current);

    // let last_time = 0;
    // if (refInputs.current.TIME) {
    //   last_time = parseFloat(refInputs.current.TIME.value);
    // }
    // // console.log('last time', last_time);
    // let pl_time = 0;
    // if (refInputs.current.PLTIME) {
    //   pl_time = parseFloat(refInputs.current.PLTIME.value);
    // }

    // Update field values
    Object.entries(refInputs.current).forEach(([key, ref], i) => {
      if (ref !== null) {
        // Check that there are query results
        if (live_data.length < 1) {
          console.log('EMPTY QUERY');
          return;
        }

        // Query must have returned some values; select array of beacon time stamps
        const timeValues = live_data[0].fields[0].values;
        if (timeValues.length === 0) {
          return;
        }

        // // If index is out of bounds, set it back to the start
        // if (refIdxs.current[i] >= timeValues.length - 1) {
        //   refIdxs.current[i] = 0;
        // }

        // let time = timeValues.get(0);

        // add clause here to check   && (time > last_time)
        let array_pos = -1;

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
            array_pos = max_index;
          } else {
            // the inner case for payload within data range below
            // iterate over data array for best fit timestamp
            for (let t_index = 0; t_index < timeValues.length - 1; t_index++) {
              // time = timeValues[refIdxs.current[input_field_key]!];
              let t_time = timeValues.get(t_index);
              // console.log('timevalues', timeValues, 't time', t_time, 'time diff', event.payload.time! - t_time);
              if (t_time === event.payload.time!) {
                array_pos = t_index;
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
                        array_pos = t_index_minus;
                        // console.log('backwards scrub done', t_index);
                        break;
                      }
                    }
                    break;
                  } else {
                    // this is the one
                    array_pos = t_index - 1;
                    // console.log("t_time_minus < event.payload.time! index zero, return", t_index - 1);
                    break;
                  }
                } else {
                  array_pos = 0;
                  // console.log("t_time > event.payload.time! index zero, return", t_index);
                  return;
                }
              } else if (t_time < event.payload.time!) {
                if (t_index === timeValues.length - 1) {
                  // console.log("t_time < event.payload.time! max index", t_index);
                  array_pos = t_index;
                  break;
                }
                let t_time_plus = timeValues.get(t_index + 1);
                if (t_time_plus > event.payload.time!) {
                  array_pos = t_index;
                  // console.log("t_time < event.payload.time!", t_index);
                  break;
                }
              }
            }
          }
        }

        if (key === 'TIME') {
          ref.value = timeValues.get(array_pos).toString();
        }

        if (array_pos === -1) {
          return;
        }

        sunx_d = sunx!.values.get(array_pos) ?? 0;
        suny_d = suny!.values.get(array_pos) ?? 0;
        sunz_d = sunz!.values.get(array_pos) ?? 0;
        new_sundir = new THREE.Vector3(sunx_d, suny_d, sunz_d);
        new_sundir.normalize();
        nadx_d = nadx!.values.get(array_pos) ?? 0;
        nady_d = nady!.values.get(array_pos) ?? 0;
        nadz_d = nadz!.values.get(array_pos) ?? 0;
        new_naddir = new THREE.Vector3(nadx_d, nady_d, nadz_d);
        new_naddir.normalize();
        refSun.current!.setDirection(new_sundir);
        refNad.current!.setDirection(new_naddir);

        // Map appropriate columns for data frame
        // redefine new column names as map
        const keyMap: Object = {
          ICRF: {
            NODE: 'node_name',
            YAW: 's_h',
            PITCH: 's_e',
            ROLL: 's_b',
            VYAW: 'v_z',
            VPITCH: 'v_y',
            VROLL: 'v_x',
            AYAW: 'a_z',
            APITCH: 'a_y',
            AROLL: 'a_x',
          },
          LVLH: {
            NODE: 'node_name',
            YAW: 's_h',
            PITCH: 's_e',
            ROLL: 's_b',
            VYAW: 'v_z',
            VPITCH: 'v_y',
            VROLL: 'v_x',
            AYAW: 'a_z',
            APITCH: 'a_y',
            AROLL: 'a_x',
          },
          GEOC: {
            NODE: 'node_name',
            YAW: 's_h',
            PITCH: 's_e',
            ROLL: 's_b',
            VYAW: 'v_z',
            VPITCH: 'v_y',
            VROLL: 'v_x',
            AYAW: 'a_z',
            APITCH: 'a_y',
            AROLL: 'a_x',
          },
        };
        let thisField: string;
        for (const [KMkey, KMvalue] of Object.entries(keyMap[refDS.current as keyof Object])) {
          if (KMkey === key) {
            thisField = KMvalue;
          }
        }
        const field = live_data[0].fields.find((field) => field.name === thisField);
        if (field === undefined) {
          return;
        }
        // Finally, update display with most up-to-date values
        // define index based on timestamp map to time column
        let currentValue: number = field.values.get(array_pos) ?? 0;
        // define variables for 3D model
        // switch (key) {
        //   case 'YAW':
        //     // z axis || Heading || Yaw
        //     yaw = currentValue;
        //     break;
        //   case 'PITCH':
        //     // y axis || Elevation || Pitch
        //     pitch = currentValue;
        //     break;
        //   case 'ROLL':
        //     // x axis || Bank || Roll
        //     roll = currentValue;
        //     break;
        // }

        // set icrf_s base rotation values for LVLH or GEOC frames
        if (key === 'YAW' && (refDS.current === 'GEOC' || refDS.current === 'LVLH')) {
          // set the s quaternion data values
          if (
            sqatt_x === undefined ||
            sqatt_y === undefined ||
            sqatt_z === undefined ||
            sqatt_w === undefined ||
            icrf_s_q_x === undefined ||
            icrf_s_q_y === undefined ||
            icrf_s_q_z === undefined ||
            icrf_s_q_w === undefined
          ) {
            return;
          }
          // ICRF
          icrf_s_q_x_d = icrf_s_q_x.values.get(array_pos) ?? 0;
          icrf_s_q_y_d = icrf_s_q_y.values.get(array_pos) ?? 0;
          icrf_s_q_z_d = icrf_s_q_z.values.get(array_pos) ?? 0;
          icrf_s_q_w_d = icrf_s_q_w.values.get(array_pos) ?? 0;
          icrf_s_quaternion = new THREE.Quaternion(icrf_s_q_x_d, icrf_s_q_y_d, icrf_s_q_z_d, icrf_s_q_w_d);
          // LVLH or GEOC
          sqatt_x_d = sqatt_x.values.get(array_pos) ?? 0;
          sqatt_y_d = sqatt_y.values.get(array_pos) ?? 0;
          sqatt_z_d = sqatt_z.values.get(array_pos) ?? 0;
          sqatt_w_d = sqatt_w.values.get(array_pos) ?? 0;
          s_quaternion = new THREE.Quaternion(sqatt_x_d, sqatt_y_d, sqatt_z_d, sqatt_w_d);
        } else if (key === 'YAW' && refDS.current === 'ICRF') {
          if (
            icrf_s_q_x === undefined ||
            icrf_s_q_y === undefined ||
            icrf_s_q_z === undefined ||
            icrf_s_q_w === undefined
          ) {
            return;
          }
          // ICRF
          icrf_s_q_x_d = icrf_s_q_x.values.get(array_pos) ?? 0;
          icrf_s_q_y_d = icrf_s_q_y.values.get(array_pos) ?? 0;
          icrf_s_q_z_d = icrf_s_q_z.values.get(array_pos) ?? 0;
          icrf_s_q_w_d = icrf_s_q_w.values.get(array_pos) ?? 0;
          icrf_s_quaternion = new THREE.Quaternion(icrf_s_q_x_d, icrf_s_q_y_d, icrf_s_q_z_d, icrf_s_q_w_d);
        }
        // round the 9 telem data points to sci notation 5 places
        // translate display ref.value units to Degrees when set; 3D display always in radians
        if (['YAW', 'VYAW', 'AYAW', 'PITCH', 'VPITCH', 'APITCH', 'ROLL', 'VROLL', 'AROLL'].some((x) => x === key)) {
          if (units === 'Degrees') {
            currentValue = currentValue * rad2deg;
          }
          // ref.value = currentValue.toExponential(5).toString();
          ref.value = currentValue.toFixed(5).toString();
        } else {
          ref.value = currentValue.toString();
        }
      }
      return;
    });

    // Update threejs model rotation
    requestAnimationFrame(() => {
      if (
        refModel.current !== undefined &&
        refSun.current !== undefined &&
        refNad.current !== undefined &&
        refRenderer.current !== undefined &&
        refScene.current !== undefined &&
        refCamera.current !== undefined
      ) {
        if (refDS.current === 'ICRF') {
          refModel.current.setRotationFromQuaternion(icrf_s_quaternion);
          // Both sun vector and nadir vector are already in ECI,
          // so no further rotations are necessary for them

          const camera_distance = 1.5;
          refCamera.current.position.set(0, 1, 0);
          refCamera.current.position.normalize().multiplyScalar(camera_distance);
          refCamera.current.lookAt(new THREE.Vector3(0, 0, 0));
        }
        // TODO
        // rotate the nad and sun vectors by the qaternion HEB for LVLH and GEOC data frames
        // rotate camera angle to show z up, x right, y left
        // rotate the model and reference coord for lvlh and geoc
        // fix time scrubbing for larger time increments
        else if (refDS.current === 'GEOC') {
          refModel.current.setRotationFromQuaternion(s_quaternion);
          const icrf_s_quaternion_inverse: THREE.Quaternion = icrf_s_quaternion.clone().invert();
          // Rotate sun vector from ICRF to Body
          refSun.current.applyQuaternion(icrf_s_quaternion_inverse);
          // Rotate sun vector from Body to LVLH
          refSun.current.applyQuaternion(s_quaternion);
          // Rotate nadir vector from ICRF to Body
          refNad.current.applyQuaternion(icrf_s_quaternion_inverse);
          // Rotate nadir vector from Body to LVLH
          refNad.current.applyQuaternion(s_quaternion);
          const camera_distance = 1.5;
          refCamera.current.position.set(1, 1, 1);
          refCamera.current.position.normalize().multiplyScalar(camera_distance);
          refCamera.current.lookAt(new THREE.Vector3(0, 0, 0));

        } else if (refDS.current === 'LVLH') {
          refModel.current.setRotationFromQuaternion(s_quaternion);
  
          const icrf_s_quaternion_inverse: THREE.Quaternion = icrf_s_quaternion.clone().invert();
          // Rotate sun vector from ICRF to Body
          refSun.current.applyQuaternion(icrf_s_quaternion_inverse);
          // Rotate sun vector from Body to LVLH
          refSun.current.applyQuaternion(s_quaternion);
          // Rotate nadir vector from ICRF to Body
          refNad.current.applyQuaternion(icrf_s_quaternion_inverse);
          // Rotate nadir vector from Body to LVLH
          refNad.current.applyQuaternion(s_quaternion);
          const camera_distance = 1.5;
          refCamera.current.position.set(0, 1, 0);
          refCamera.current.position.normalize().multiplyScalar(camera_distance);
          refCamera.current.lookAt(new THREE.Vector3(0, 0, 0));
        }
        // refNad.current.rotation.set(yaw, pitch, roll, 'ZYX');
        // refSun.current.rotation.set(yaw, pitch, roll, 'ZYX');
        // refSun.current.setDirection(new_sundir)
        // refNad.current.setDirection(new_naddir)
        // refScene.current.rotation.set(yaw, pitch, roll, 'ZYX');
        // load model origin coords as unique object to pair and shift with model...
        refRenderer.current.render(refScene.current, refCamera.current);
      }
    });
  }, []);

  return [refRenderer, refScene, refCamera, refModel, refSun, refNad, refInputs, refDS, refUS, updateDOMRefs];
};
