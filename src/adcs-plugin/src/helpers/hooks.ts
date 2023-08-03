import { useCallback, useEffect, useRef } from 'react';
import { EventBus, PanelData } from '@grafana/data';
import { RefDict, TimeEvent, TimeEventCallback } from '../types';
import * as THREE from 'three';

// Hook to listen to eventBus for cosmos timeevents, running animation callback when event fires
export const useCosmosTimeline = (data: PanelData, eventBus: EventBus, callback: TimeEventCallback) => {
  // console.log('enter Cosmos Timeline');
  // const [entity, setEntity] = useState<TimeEvent>();
  // ---------------------------------------------------
  // Imperative animation controller
  // Unix seconds timestamp that denotes current time, obtained from cosmos-timeline event publisher
  useEffect(() => {
    // console.log('useEffect Cosmos Timeline ');
    const subscriber = eventBus.getStream(TimeEvent).subscribe({
      next: (event: TimeEvent) => {
        // console.log('subscribe Cosmos Timeline');
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
    // console.log('updateDOMRefs use callback function in hooks');
    // console.log('Data State ref', refDS.current);

    if (
      !data.series.length || // Check if there is valid query result
      data.series[0].fields.length < 2 // || // Check if there are time and value columns in query
      //refIdx.current >= data.series[0].fields[0].values.length // Check if there are values in those columns
    ) {
      // console.log('no data updateDOMRefs in hooks');
      //refIdx.current = 0;
      return;
    }
    // console.log('start of updateDOMRefs in hooks');

    // filter data based on current data series type;
    // live data .... where data.meta.custom = eci || qatt for map to refDS.current = LVLH || ICRF ....  TODO
    // let live_data = data.series.map(filter: )
    const DataMap: Object = {
      ICRF: 'adcsstruc',
      LVLH: 'ladcsstruc',
      GEOC: 'gadcsstruc',
    };
    // let data_type: string;
    // if (refDS.current) {
    //   const key: string = refDS.current;
    //   // data_type = DataMap[key];
    //   DataMap[key as keyof DataMap]
    // }
    let live_data = data.series.filter((row) => row.meta?.custom?.type === DataMap[refDS.current as keyof Object]);
    // console.log('Live filtered data: ', live_data);

    // converts radians to degrees: 1rad x (180/PI) = DEGREE
    const rad2deg: number = 180 / Math.PI;
    // console.log('rad 2 deg: ', rad2deg);
    // result: rad 2 deg:  57.29577951308232
    // let units: string = 'radians'; // radians // degrees
    let units: string = refUS.current!; // radians // degrees

    let yaw = 0;
    let pitch = 0;
    let roll = 0;
    // sun vector
    let sunx = live_data[0].fields.find((field) => field.name === 'sun_x');
    let suny = live_data[0].fields.find((field) => field.name === 'sun_y');
    let sunz = live_data[0].fields.find((field) => field.name === 'sun_z');
    let new_sundir: THREE.Vector3;
    // nadir vector
    let nadx = live_data[0].fields.find((field) => field.name === 'nad_x');
    let nady = live_data[0].fields.find((field) => field.name === 'nad_y');
    let nadz = live_data[0].fields.find((field) => field.name === 'nad_z');
    let new_naddir: THREE.Vector3;
    let sunx_d = 0;
    let suny_d = 0;
    let sunz_d = 0;
    let nadx_d = 0;
    let nady_d = 0;
    let nadz_d = 0;

    let icrf_s_h = 0;
    let icrf_s_e = 0;
    let icrf_s_b = 0;

    // console.log('update DOM refInputs.current: ', refInputs.current);

    let last_time = 0;
    if (refInputs.current.TIME) {
      last_time = parseFloat(refInputs.current.TIME.value);
    }
    // console.log('last time', last_time);
    let pl_time = 0;
    if (refInputs.current.PLTIME) {
      pl_time = parseFloat(refInputs.current.PLTIME.value);
    }

    // Update field values
    Object.entries(refInputs.current).forEach(([key, ref], i) => {
      // console.log('object refInputs.current iterator: key, ref', key, ref);
      // console.log('data series live_data view in iterator: ', live_data);

      if (ref !== null) {
        // Check that there are query results
        //  should be checking if greater than default length [0] so not  (!data.series.length) as it was instead  (data.series.length <=1)

        if (live_data.length < 1) {
          console.log('EMPTY QUERY');
          return;
        }
        // 0th, 1st, and 2nd derivatives have been separated into separate series
        // for first data element always
        // let seriesIdx = 0;
        // TODO remove archaic data reference
        // switch (key) {
        //   case 'VYAW':
        //   case 'VPITCH':
        //   case 'VROLL':
        //     seriesIdx = 1;
        //     break;
        //   case 'AYAW':
        //   case 'APITCH':
        //   case 'AROLL':
        //     seriesIdx = 2;
        //     break;
        //   default:
        //     break;
        // }
        // setState takes one rerender cycle to be reset to the correct value
        // TODO: make this a better check?
        // const boundCheck = (i % 3) + 1;
        // why is this looping over a different node row return from the query for each iteration of location part X derivative level ?
        // should this be instead looping over every node row, data.series[node_row] , then selecting the appropriate location part X derivative level i.e. AYAW
        // console.log('bound check function, data series for idX [0]: ', seriesIdx, live_data[seriesIdx]);
        // console.log('event time check: event payload ', event.payload);

        // console.log('bound check function, data series fields[0] values for first row: ', seriesIdx, data.series[seriesIdx].fields[3].values);
        // for (let i = 0; i < data.series[0].fields.length; i++) {
        //   console.log('iterator data series[0] field[i] value[0]: ', data.series[seriesIdx].fields[i].name, ': ', data.series[seriesIdx].fields[i].values.get(0));

        // }

        // TODO redefine bound check for new data series type
        // if (boundCheck >= data.series[seriesIdx].fields.length) {
        //   return;
        // }
        // Query must have returned some values; select array of beacon time stamps
        const timeValues = live_data[0].fields[0].values;
        // console.log('timeValues: ', timeValues);
        // console.log('i; refIdxs.current[i] ', i, '; ', refIdxs.current[i]);

        if (timeValues.length === 0) {
          return;
        }

        // // If index is out of bounds, set it back to the start
        // if (refIdxs.current[i] >= timeValues.length - 1) {
        //   refIdxs.current[i] = 0;
        // }

        // If new timestamp is less than our current timestamp, then search from start
        // TODO: depending on circumstances, we could perhaps just search backwards, eg: if scrubbing is in event?

        let time = timeValues.get(0);
        // console.log('timeValues get first row time', time);

        // if (time > event.payload.time!) {
        //   refIdxs.current[i] = 0;
        // }

        // // Search through timestamps, and get the timestamp that is one before we go over the event timestamp
        // for (; refIdxs.current[i] < timeValues.length - 1; refIdxs.current[i]++) {
        //   time = timeValues.get(refIdxs.current[i]);
        //   if (time === event.payload.time!) {
        //     break;
        //   }
        //   if (time > event.payload.time!) {
        //     refIdxs.current[i] += 1;
        //     break;
        //   }
        // }

        // add clause here to check   && (time > last_time)
        let array_pos = -1;
        for (let i = 0; i < timeValues.length; i++) {
          time = timeValues.get(i);
          // console.log('this time i ', time);
          if (time === event.payload.time! && (time > last_time || Number.isNaN(last_time))) {
            // console.log('EXACT Last time: ', last_time, '; time: ', time);
            const pltime = event.payload.time!;

            array_pos = i;
            if (key === 'TIME') {
              ref.value = time.toString();
              break;
            }
            if (key === 'PLTIME') {
              ref.value = pltime.toString();
              break;
            }
            break;
          }
          if (
            time > event.payload.time! &&
            // (time < last_time || Number.isNaN(last_time)) &&
            (event.payload.time! < pl_time || Number.isNaN(pl_time))
          ) {
            // console.log('INCREMENT Last time: ', last_time, '; time: ', time, '; payload time: ', event.payload.time);
            const pltime = event.payload.time!;
            array_pos = i;
            if (key === 'TIME') {
              ref.value = time.toString();
              break;
            }
            if (key === 'PLTIME') {
              ref.value = pltime.toString();
              break;
            }
            break;
          }
          if (
            time > event.payload.time! &&
            (time > last_time || Number.isNaN(last_time)) &&
            (event.payload.time! > pl_time || Number.isNaN(pl_time))
          ) {
            // console.log('INCREMENT Last time: ', last_time, '; time: ', time, '; payload time: ', event.payload.time);
            const pltime = event.payload.time!;
            array_pos = i;
            if (key === 'TIME') {
              ref.value = time.toString();
              break;
            }
            if (key === 'PLTIME') {
              ref.value = pltime.toString();
              break;
            }
            break;
          }
          // console.log('last time - time', last_time - time, 'last time - event time', last_time - event.payload.time!);
          // TODO need to update to account for instances where there was a gap in beacons greater than 1000... for rewind function

          // console.log('previous event time: ', pl_time, 'event time: ', event.payload.time!, 'delta event time: ', pl_time - event.payload.time!, 'pl_time - i time', pl_time - time);
          // if (
          //   (last_time - time === 1000 || last_time - time <= 1800 || last_time - time >= pl_time - event.payload.time!) &&
          //   pl_time < event.payload.time!
          // ) {
          //   //&& (last_time > time) && (time > event.payload.time!)
          //   array_pos = i;
          //   // console.log('DECREMENT Last time: ', last_time, '; time: ', time);
          //   const pltime = event.payload.time!;

          //   if (key === 'TIME') {
          //     ref.value = time.toString();
          //     break;
          //   }
          //   if (key === 'PLTIME') {
          //     ref.value = pltime.toString();
          //     break;
          //   }
          //   break;
          // }
        }
        if (array_pos === -1) {
          // console.log('SKIP Last time: ', last_time, '; time: ', time);
          return;
        }

        // TODO remove log of data series:
        // for (let i = 0; i < live_data[0].fields.length; i++) {
        //   console.log(
        //     'iterator data series[0] field[i] value[array_pos]: ',
        //     live_data[seriesIdx].fields[i].name,
        //     ': ',
        //     live_data[seriesIdx].fields[i].values.get(array_pos)
        //   );
        // }

        sunx_d = sunx!.values.get(array_pos) ?? 0;
        suny_d = suny!.values.get(array_pos) ?? 0;
        sunz_d = sunz!.values.get(array_pos) ?? 0;
        // console.log('sun v ', sunx_d, suny_d, sunz_d)
        // new_sundir = new THREE.Vector3(sunx_d / 10000000, suny_d / 10000000, sunz_d / 10000000);
        new_sundir = new THREE.Vector3(sunx_d, suny_d, sunz_d);
        new_sundir.normalize();
        // console.log('new sun vector', new_sundir)
        // new_sundir = new THREE.Vector3(1, 20000, 0);
        nadx_d = nadx!.values.get(array_pos) ?? 0;
        nady_d = nady!.values.get(array_pos) ?? 0;
        nadz_d = nadz!.values.get(array_pos) ?? 0;
        // new_naddir = new THREE.Vector3(nadx_d / 10000000, nady_d / 10000000, nadz_d / 10000000);
        new_naddir = new THREE.Vector3(nadx_d, nady_d, nadz_d);
        new_naddir.normalize();
        refSun.current!.setDirection(new_sundir);
        refNad.current!.setDirection(new_naddir);

        // Grab appropriate column
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
        // console.log('update display latest value: refIdxs: ', refIdxs);

        // const currentValue: number = field.values.get(refIdxs.current[i]) ?? 0;
        // console.log('refIdxs.current[i] ', refIdxs.current[i]);

        // define index based on timestamp map to time column
        let currentValue: number = field.values.get(array_pos) ?? 0;
        //
        switch (key) {
          case 'YAW':
            // z axis || Heading || Yaw
            yaw = currentValue;
            break;
          case 'PITCH':
            // y axis || Elevation || Pitch
            pitch = currentValue;
            break;
          case 'ROLL':
            // x axis || Bank || Roll
            roll = currentValue;
            break;
        }

        // set icrf_s base rotation values for LVLH or GEOC frames
        if (key === 'YAW' && (refDS.current === 'GEOC' || refDS.current === 'LVLH')) {
          const icrf_h = live_data[0].fields.find((field) => field.name === 'icrf_s_h');
          const icrf_e = live_data[0].fields.find((field) => field.name === 'icrf_s_e');
          const icrf_b = live_data[0].fields.find((field) => field.name === 'icrf_s_b');
          if (icrf_h === undefined || icrf_e === undefined || icrf_b === undefined) {
            return;
          }
          let currentValue_icrf_h: number = icrf_h.values.get(array_pos) ?? 0;
          let currentValue_icrf_e: number = icrf_e.values.get(array_pos) ?? 0;
          let currentValue_icrf_b: number = icrf_b.values.get(array_pos) ?? 0;
          icrf_s_h = currentValue_icrf_h;
          icrf_s_e = currentValue_icrf_e;
          icrf_s_b = currentValue_icrf_b;
        }
        // round the 9 telem data points to sci notation 5 places
        // translate display units to Degrees when set; 3D display always in radians
        if (['YAW', 'VYAW', 'AYAW', 'PITCH', 'VPITCH', 'APITCH', 'ROLL', 'VROLL', 'AROLL'].some((x) => x === key)) {
          if (units === 'Degrees') {
            currentValue = currentValue * rad2deg;
            // console.log('translated rad 2 deg: ', currentValue);
          }
          ref.value = currentValue.toExponential(5).toString();
        } else {
          ref.value = currentValue.toString();
        }
        // currentValue.toExponential(4);
        // ref.value = currentValue.toString();
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
        refModel.current.rotation.set(roll, pitch, yaw);
        // TODO
        // rotate the nad and sun vectors by the qaternion HEB for LVLH and GEOC data frames
        // rotate camera angle to show z up, x right, y left
        // rotate the model and reference coord for lvlh and geoc
        // fix time scrubbing for larger time increments

        if (refDS.current === 'GEOC') {
          // let base = new THREE.Vector3(roll, pitch, yaw);
          // base.normalize()
          // // new_sundir = new THREE.Vector3((sunx_d - roll) * roll, (suny_d - pitch) * pitch, (sunz_d - yaw) * yaw);
          // new_sundir = new THREE.Vector3((sunx_d), (suny_d), (sunz_d));
          // // new_sundir = new THREE.Vector3(sunx_d + (roll * 1000000000000), suny_d + (pitch * 1000000000000), sunz_d + (yaw * 1000000000000));
          // new_sundir.normalize();
          // let adj_sundir = new_sundir.add(base)
          // // new_naddir = new THREE.Vector3(nadx_d * roll, nady_d * pitch, nadz_d * yaw);
          // new_naddir = new THREE.Vector3(nadx_d, nady_d, nadz_d);
          // new_naddir.normalize();
          // let adj_naddir = new_naddir.add(base)
          // // adj_sundir.normalize()
          // // adj_naddir.normalize()
          // refSun.current!.setDirection(adj_sundir)
          // refNad.current!.setDirection(adj_naddir)
          //first rotate by euler icrf
          refSun.current.rotateX(icrf_s_b);
          refSun.current.rotateY(icrf_s_e);
          refSun.current.rotateZ(icrf_s_h);
          refNad.current.rotateX(icrf_s_b);
          refNad.current.rotateY(icrf_s_e);
          refNad.current.rotateZ(icrf_s_h);
          // then rotate by euler geoc'
          refSun.current.rotateX(roll);
          refSun.current.rotateY(pitch);
          refSun.current.rotateZ(yaw);
          refNad.current.rotateX(roll);
          refNad.current.rotateY(pitch);
          refNad.current.rotateZ(yaw);

          // refNad.current.rotation.set(yaw, pitch, roll, 'ZYX');
          // refSun.current.rotation.set(yaw, pitch, roll, 'ZYX');

          // refNad.current.rotation.set(nadz_d + yaw, nady_d + pitch, nadx_d + roll, 'ZYX');
          // refSun.current.rotation.set(sunz_d + yaw, suny_d + pitch, sunx_d + roll, 'ZYX');
        } else if (refDS.current === 'LVLH') {
          //first rotate by euler icrf
          refSun.current.rotateX(icrf_s_b);
          refSun.current.rotateY(icrf_s_e);
          refSun.current.rotateZ(icrf_s_h);
          refNad.current.rotateX(icrf_s_b);
          refNad.current.rotateY(icrf_s_e);
          refNad.current.rotateZ(icrf_s_h);
          // then rotate by euler geoc'
          refSun.current.rotateX(roll);
          refSun.current.rotateY(pitch);
          refSun.current.rotateZ(yaw);
          refNad.current.rotateX(roll);
          refNad.current.rotateY(pitch);
          refNad.current.rotateZ(yaw);
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
