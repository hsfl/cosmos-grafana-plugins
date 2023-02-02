import React, { useCallback, useEffect, useRef } from 'react';
import { JulianDate, Viewer as CesiumViewer } from 'cesium';
import { EventBus, PanelData } from '@grafana/data';
import { IdxDict, RefDict, TimeEvent, TimeEventCallback, input_field } from '../types';

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
  callback: (data: PanelData, event: TimeEvent) => void
];
// Imperative animation manager
export const useDomUpdate = (cesiumViewer: CesiumViewer | undefined): DomUpdateReturn => {
  // An array of references to the text boxes
  const refInputs = useRef<RefDict>({});
  // The index into the data array
  const refIdxs = useRef<IdxDict>({});

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
        //refIdx.current = 0;
        return;
      }

      // Update field values
      Object.entries(refInputs.current).forEach(([key, ref], i) => {
        if (ref !== null) {
          // Note, this type cast does NOT ensure that key is in input_field
          const input_field_key = key as input_field;
          // Check that there are query results
          if (!data.series.length) {
            return;
          }

          // Query must have returned some values
          const timeValues = data.series[0].fields[0].values;
          if (timeValues.length === 0) {
            return;
          }
          // If index is out of bounds, set it back to the start
          if (
            refIdxs.current[input_field_key] === undefined ||
            refIdxs.current[input_field_key]! >= timeValues.length - 1
          ) {
            refIdxs.current[input_field_key] = 0;
          }
          // If new timestamp is less than our current timestamp, then search from start
          // TODO: depending on circumstances, we could perhaps just search backwards, eg: if scrubbing is in event?
          let time = timeValues.get(refIdxs.current[input_field_key]!);
          if (time > event.payload.time!) {
            refIdxs.current[input_field_key] = 0;
          }
          // Search through timestamps, and get the timestamp that is one before we go over the event timestamp
          for (; refIdxs.current[input_field_key]! < timeValues.length - 1; refIdxs.current[input_field_key]!++) {
            time = timeValues.get(refIdxs.current[input_field_key]!);
            if (time === event.payload.time!) {
              break;
            }
            if (time > event.payload.time!) {
              refIdxs.current[input_field_key]! -= 1;
              break;
            }
          }
          // Grab appropriate column
          const field = data.series[0].fields.find((field) => field.name === key);
          if (field === undefined) {
            return;
          }
          // Finally, update display with most up-to-date values
          const currentValue: number = field.values.get(refIdxs.current[input_field_key]!) ?? 0;
          ref.value = currentValue.toString();
        }
      });

      // Update threejs model rotation
      requestAnimationFrame(() => {
        if (cesiumViewer !== undefined) {
          const newTime = JulianDate.fromDate(new Date(event.payload.time!));
          if (JulianDate.lessThan(newTime, cesiumViewer.clock.startTime)) {
            cesiumViewer.clock.currentTime = cesiumViewer.clock.startTime.clone();
          } else if (JulianDate.greaterThan(newTime, cesiumViewer.clock.stopTime)) {
            cesiumViewer.clock.currentTime = cesiumViewer.clock.stopTime.clone();
          } else {
            cesiumViewer.clock.currentTime = newTime;
          }
        }
      });
    },
    [cesiumViewer]
  );

  return [refInputs, updateDOMRefs];
};
