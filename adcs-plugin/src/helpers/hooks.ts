import { useCallback, useEffect, useRef } from 'react';
import { EventBus, PanelData } from '@grafana/data';
import { RefDict, TimeEvent, TimeEventCallback } from '../types';

// Hook to listen to eventBus for cosmos timeevents, running animation callback when event fires
export const useCosmosTimeline = (data: PanelData, eventBus: EventBus, callback: TimeEventCallback) => {
  // ---------------------------------------------------
  // Imperative animation controller
  // Unix seconds timestamp that denotes current time, obtained from cosmos-timeline event publisher
  useEffect(() => {
    const subscriber = eventBus.getStream(TimeEvent).subscribe(event => {
      if (event.payload.time !== undefined) {
        callback(data, event);
      }
    });
    return () => {
      subscriber.unsubscribe();
    }
  }, [eventBus, data, callback]);

};


// ---------------------------------------------------
type DomUpdateReturn = [
  refRenderer: React.MutableRefObject<THREE.WebGLRenderer | undefined>,
  refScene: React.MutableRefObject<THREE.Scene | undefined>,
  refCamera: React.MutableRefObject<THREE.OrthographicCamera | undefined>,
  refModel: React.MutableRefObject<THREE.Group | undefined>,
  refInputs: React.MutableRefObject<RefDict>,
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

  useEffect(() => {
    // Clean up renderer on unmount
    return () => {
      if (refRenderer.current !== undefined) {
        refRenderer.current.dispose();
        refRenderer.current = undefined;
      }
    }
  }, []);

  // Update refIdxs
  useEffect(() => {
    // Array of references
    // Number of columns is the total -1 to exclude the time column
    const numColumns = data.series[0].fields.length-1;
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
      data.series[0].fields.length < 2// || // Check if there are time and value columns in query
      //refIdx.current >= data.series[0].fields[0].values.length // Check if there are values in those columns
    ) {
      //refIdx.current = 0;
      return;
    }
    let yaw = 0;
    let pitch = 0;
    let roll = 0;

    // Update field values
    Object.entries(refInputs.current).forEach(([key, ref], i) => {
      if (ref !== null) {
        // Check that there are query results
        if (!data.series.length) {
          return;
        }
        // setState takes one rerender cycle to be reset to the correct value
        if (i+1 >= data.series[0].fields.length) {
          return;
        }
        // Query must have returned some values
        const timeValues = data.series[0].fields[0].values;
        if (timeValues.length === 0) {
          return;
        }
        // If index is out of bounds, set it back to the start
        if (refIdxs.current[i] >= timeValues.length-1) {
          refIdxs.current[i] = 0;
        }
        // If new timestamp is less than our current timestamp, then search from start
        // TODO: depending on circumstances, we could perhaps just search backwards, eg: if scrubbing is in event?
        let time = timeValues.get(refIdxs.current[i]);
        if (time > event.payload.time!) {
          refIdxs.current[i] = 0;
        }
        // Search through timestamps, and get the timestamp that is one before we go over the event timestamp
        for (; refIdxs.current[i] < timeValues.length-1; refIdxs.current[i]++) {
          time = timeValues.get(refIdxs.current[i]);
          if (time === event.payload.time!) {
            break;
          }
          if (time > event.payload.time!) {
            refIdxs.current[i] -= 1;
            break;
          }
        }
        const currentValue: number = (data.series[0].fields[i+1].values.get(refIdxs.current[i]) ?? 0);
        ref.value = currentValue.toString();
        switch(key)
        {
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
    });

    // Update threejs model rotation
    requestAnimationFrame(() => {
      if (refModel.current !== undefined && refRenderer.current !== undefined && refScene.current !== undefined && refCamera.current !== undefined)
      {
        refModel.current.rotation.set(yaw, pitch, roll);
        refRenderer.current.render(refScene.current, refCamera.current);
      }
    });
  }, []);

  return [refRenderer, refScene, refCamera, refModel, refInputs, updateDOMRefs];
};
