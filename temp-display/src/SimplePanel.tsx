import React, { useEffect, useRef, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { RectWithTextHandle, SimpleOptions, TimeEvent } from 'types';
import RectWithText from 'components/RectWithText';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, eventBus }) => {
  // An array of references to the svg rect element inside RectWithText
  const refRects = useRef<Array<RectWithTextHandle | null>>([]);
  const refIdxs = useRef<number[]>([]);
  const [numColumns, setNumColumns] = useState<number>(0);

  useEffect(() => {
    // Array of references
    // Number of columns is the total -1 to exclude the time column
    const numColumns = data.series[0].fields.length-1;
    setNumColumns(numColumns);
    if (refRects.current.length < numColumns) {
      for (let i = refRects.current.length; i < numColumns; i++) {
          refRects.current.push(null);
      }
    } else {
      refRects.current = refRects.current.slice(0, numColumns);
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

  // Unix seconds timestamp that denotes current time, obtained from cosmos-timeline event publisher
  useEffect(() => {
    const subscriber = eventBus.getStream(TimeEvent).subscribe(event => {
      if (event.payload.time !== undefined) {
        //refUnixTime.current = event.payload.time;
        refRects.current.forEach((val, i) => {
          // Make sure element reference has been obtained
          if (val === null || val.text === null || val.rect === null) {
            return;
          }
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
          const thing = (data.series[0].fields[i+1].values.get(refIdxs.current[i]) ?? 0);
          val.text!.textContent = thing;
        });
      }
    });

    return () => {
      subscriber.unsubscribe();
    }
  }, [eventBus, data.series, numColumns]);
  
  if (!data.series.length || !data.series[0].fields.length) {
      return null;
  }

  return (
    <div style={{ width: width, height: height, display: 'block' }}>
      {
        refRects.current.map((rectRef, i) => {
          let temp = 0;
          if (data.series.length && i+1 < data.series[0].fields.length) {
            const idx = data.series[0].fields[i+1].values.length-1;
            temp = data.series[0].fields[i+1].values.get(idx);
          }
          return (
              <RectWithText
                ref={(el) => refRects.current[i] = el}
                width={50}
                height={30}
                key={`temp-${i}`}
                temperature={temp}
              />
          );
        })
      }
    </div>
  );
};
