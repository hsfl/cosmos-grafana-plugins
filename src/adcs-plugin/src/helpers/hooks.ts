import { useCallback, useEffect, useRef } from 'react';
import { EventBus, PanelData } from '@grafana/data';
import { RefDict, TimeEvent, TimeEventCallback } from '../types';

// Hook to listen to eventBus for cosmos timeevents, running animation callback when event fires
export const useCosmosTimeline = (data: PanelData, eventBus: EventBus, callback: TimeEventCallback) => {
  console.log('enter Cosmos Timeline');
  // const [entity, setEntity] = useState<TimeEvent>();
  // ---------------------------------------------------
  // Imperative animation controller
  // Unix seconds timestamp that denotes current time, obtained from cosmos-timeline event publisher
  useEffect(() => {
    console.log('useEffect Cosmos Timeline ');
    const subscriber = eventBus.getStream(TimeEvent).subscribe({
      next: (event: TimeEvent) => {
        console.log('subscribe Cosmos Timeline');
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
  refInputs: React.MutableRefObject<RefDict>,
  refDS: React.MutableRefObject<string | undefined>,
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
  // An array of references to the text boxes
  const refInputs = useRef<RefDict>({});
  // The index into the data array
  const refIdxs = useRef<number[]>([]);
  // the data state from selection: {LVLH: qatt, ICRF: eci} 
  // to reference & filter query data.meta.custom == qatt || eci
  const refDS = useRef<string>();
  console.log("useDomUpdate");
  console.log("update DOM refInputs.current: ", refInputs.current);
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
    console.log('Update refIdxs');

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
    console.log('updateDOMRefs use callback function in hooks');
    console.log('Data State ref', refDS.current);

    if (
      !data.series.length || // Check if there is valid query result
      data.series[0].fields.length < 2 // || // Check if there are time and value columns in query
      //refIdx.current >= data.series[0].fields[0].values.length // Check if there are values in those columns
    ) {
      console.log('no data updateDOMRefs in hooks');
      //refIdx.current = 0;
      return;
    }
    console.log('start of updateDOMRefs in hooks');

    // filter data based on current data series type; 
    // live data .... where data.meta.custom = eci || qatt for map to refDS.current = LVLH || ICRF ....  TODO
    // let live_data = data.series.map(filter: )
    const DataMap: Object = {
      "ICRF": "eci",
      "LVLH": "qatt"
    }
    // let data_type: string;
    // if (refDS.current) {
    //   const key: string = refDS.current;
    //   // data_type = DataMap[key];
    //   DataMap[key as keyof DataMap]
    // }
    let live_data = data.series.filter(row => row.meta?.custom === DataMap[refDS.current as keyof Object]);
    console.log("Live filtered data: ", live_data);


    let yaw = 0;
    let pitch = 0;
    let roll = 0;

    console.log('update DOM refInputs.current: ', refInputs.current);

    let last_time = 0;
    if (refInputs.current.TIME) {
      last_time = parseFloat(refInputs.current.TIME.value);
    }
    console.log('last time', last_time);
    let pl_time: number = 0;
    if (refInputs.current.PLTIME) {
      pl_time = parseFloat(refInputs.current.PLTIME.value);
    }

    // Update field values
    Object.entries(refInputs.current).forEach(([key, ref], i) => {
      console.log('object refInputs.current iterator: key, ref', key, ref);
      console.log('data series live_data view in iterator: ', live_data);

      if (ref !== null) {
        // Check that there are query results
        //  should be checking if greater than default length [0] so not  (!data.series.length) as it was instead  (data.series.length <=1)
        if (live_data.length <= 1) {
          console.log('EMPTY QUERY');
          return;
        }
        // 0th, 1st, and 2nd derivatives have been separated into separate series
        // for first data element always
        let seriesIdx = 0;
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
        console.log('bound check function, data series for idX [0]: ', seriesIdx, live_data[seriesIdx]);
        console.log('event time check: event payload ', event.payload);

        // console.log('bound check function, data series fields[0] values for first row: ', seriesIdx, data.series[seriesIdx].fields[3].values);
        // for (let i = 0; i < data.series[0].fields.length; i++) {
        //   console.log('iterator data series[0] field[i] value[0]: ', data.series[seriesIdx].fields[i].name, ': ', data.series[seriesIdx].fields[i].values.get(0));

        // }

        // TODO redefine bound check for new data series type
        // if (boundCheck >= data.series[seriesIdx].fields.length) {
        //   return;
        // }
        // Query must have returned some values; select array of beacon time stamps
        const timeValues = live_data[seriesIdx].fields[0].values;
        console.log('timeValues: ', timeValues);
        console.log('i; refIdxs.current[i] ', i, '; ', refIdxs.current[i]);

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
        console.log('timeValues get first row time', time);

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
          if ((time === event.payload.time!) && (time > last_time || Number.isNaN(last_time))) {
            console.log('EXACT Last time: ', last_time, '; time: ', time);
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
          if ((time < event.payload.time!) && (time > last_time || Number.isNaN(last_time)) && (event.payload.time! > pl_time || Number.isNaN(pl_time))) {
            console.log('INCREMENT Last time: ', last_time, '; time: ', time, '; payload time: ', event.payload.time);
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
          console.log('last time - time', (last_time - time), 'last time - event time', (last_time - event.payload.time!));
          // TODO need to update to account for instances where there was a gap in beacons greater than 1000... for rewind function
          if (((last_time - time) === 1000) && ((pl_time > event.payload.time!))) {
            //&& (last_time > time) && (time > event.payload.time!)
            array_pos = i;
            console.log('DECREMENT Last time: ', last_time, '; time: ', time);
            const pltime = event.payload.time!;

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
        }
        if (array_pos === -1) {
          console.log('SKIP Last time: ', last_time, '; time: ', time);
          return;
        }

        // TODO remove log of data series:
        for (let i = 0; i < live_data[0].fields.length; i++) {
          console.log('iterator data series[0] field[i] value[array_pos]: ', live_data[seriesIdx].fields[i].name, ': ', live_data[seriesIdx].fields[i].values.get(array_pos));
        }

        // Grab appropriate column
        // redefine new column names as map
        const keyMap: Object = {
          "ICRF": {
            "YAW": "s_z",
            "PITCH": "s_y",
            "ROLL": "s_x",
            "VYAW": "v_z",
            "VPITCH": "v_y",
            "VROLL": "v_x",
            "AYAW": "a_z",
            "APITCH": "a_y",
            "AROLL": "a_x"
          },
          "LVLH": {
            "YAW": "s_d_z",
            "PITCH": "s_d_y",
            "ROLL": "s_d_x",
            "VYAW": "v_z",
            "VPITCH": "v_y",
            "VROLL": "v_x",
            "AYAW": "a_z",
            "APITCH": "a_y",
            "AROLL": "a_x"
          }
        }
        let thisField: string;
        for (const [KMkey, KMvalue] of Object.entries(keyMap[refDS.current as keyof Object])) {
          if (KMkey == key) {
            thisField = KMvalue;
          }
        }
        const field = live_data[seriesIdx].fields.find((field) => field.name === thisField);
        if (field === undefined) {
          return;
        }
        // Finally, update display with most up-to-date values
        console.log('update display latest value: refIdxs: ', refIdxs);

        // const currentValue: number = field.values.get(refIdxs.current[i]) ?? 0;
        console.log('refIdxs.current[i] ', refIdxs.current[i]);

        // define index based on timestamp map to time column
        const currentValue: number = field.values.get(array_pos) ?? 0;
        ref.value = currentValue.toString();
        switch (key) {
          case 'YAW':
            yaw = currentValue;
            break;
          case 'PITCH':
            pitch = currentValue;
            break;
          case 'ROLL':
            roll = currentValue;
            break;
        }
      }
      return;
    });

    // Update threejs model rotation
    requestAnimationFrame(() => {
      if (
        refModel.current !== undefined &&
        refRenderer.current !== undefined &&
        refScene.current !== undefined &&
        refCamera.current !== undefined
      ) {
        refModel.current.rotation.set(yaw, pitch, roll);
        refRenderer.current.render(refScene.current, refCamera.current);
      }
    });
  }, []);

  return [refRenderer, refScene, refCamera, refModel, refInputs, refDS, updateDOMRefs];
};
