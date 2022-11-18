import { useCallback, useEffect, useRef } from 'react';
import { EventBus, PanelData } from '@grafana/data';
import { RefDict, TimeEvent, TimeEventCallback } from '../types';

export const useCosmosTimeline = (data: PanelData, eventBus: EventBus, callback: TimeEventCallback) => {
    // Imperative animation controller
  // Unix seconds timestamp that denotes current time, obtained from cosmos-timeline event publisher
  useEffect(() => {
    const subscriber = eventBus.getStream(TimeEvent).subscribe(event => {
      if (event.payload.time !== undefined) {
        callback(data, event);
        // requestAnimationFrame(() => {
        //   if (refModel.current !== undefined && refRenderer.current !== undefined && refScene.current !== undefined && refCamera.current !== undefined)
        //   {
        //     refModel.current.rotation.x += 0.1;
        //     refRenderer.current.render(refScene.current, refCamera.current);
        //   }
        // });
        console.log('event fired');
      }
    });
    return () => {
      console.log('usecosmostimeline return');
      subscriber.unsubscribe();
    }
  }, [eventBus, data, callback]);

};

type DomUpdateReturn = [React.MutableRefObject<RefDict>, (data: PanelData, event: TimeEvent) => void];

// Imperative animation call
export const useDomUpdate = (data: PanelData): DomUpdateReturn => {
  // const refWebGLContainer = useRef<HTMLDivElement>(null);
  // //const refId = useRef<number>(0);
  // //const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
  // const refRenderer = useRef<THREE.WebGLRenderer>();
  // const refScene = useRef<THREE.Scene>();
  // const refCamera = useRef<THREE.OrthographicCamera>();
  // const refModel = useRef<THREE.Group>();
  // An array of references to the text boxes
  const refInputs = useRef<RefDict>({});
  // The index into the data array
  const refIdxs = useRef<number[]>([]);

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

  const updateDOMRefs = useCallback((data: PanelData, event: TimeEvent) => {
    if (
      !data.series.length || // Check if there is valid query result
      data.series[0].fields.length < 2// || // Check if there are time and value columns in query
      //refIdx.current >= data.series[0].fields[0].values.length // Check if there are values in those columns
    ) {
      //refIdx.current = 0;
      return;
    }
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
        const currentValue: string = (data.series[0].fields[i+1].values.get(refIdxs.current[i]) ?? 0);
        ref.value = currentValue;
      }
    });
  }, []);
  return [refInputs, updateDOMRefs];
};
