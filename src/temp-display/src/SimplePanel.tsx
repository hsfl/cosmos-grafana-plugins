import React, { useEffect, useRef, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { RectWithTextHandle, SimpleOptions, TimeEvent } from './types';
import RectWithText from './components/RectWithText';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, eventBus }) => {
  // An array of references to the svg rect element inside RectWithText
  const refRects = useRef<Array<RectWithTextHandle | null>>([]);
  const refIdxs = useRef<number[]>([]);
  const [numColumns, setNumColumns] = useState<number>(0);

  useEffect(() => {
    // Array of references
    // Number of columns is the total -1 to exclude the time column
    if (!data.series.length) {
      return;
    }
    const numColumns = data.series[0].fields.length - 1;
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
    const subscriber = eventBus.getStream(TimeEvent).subscribe((event) => {
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
          if (i + 1 >= data.series[0].fields.length) {
            return;
          }
          // Query must have returned some values
          const timeValues = data.series[0].fields[0].values;
          if (timeValues.length === 0) {
            return;
          }
          // If index is out of bounds, set it back to the start
          if (
            refIdxs.current[i] === undefined ||
            // refIdxs.current[i] >= timeValues.length - 1
            refIdxs.current[i]! < 0
          ) {
            refIdxs.current[i] = 0;
          }
          //
          //
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
              refIdxs.current[i] = max_index;
            } else {
              // the inner case for payload within data range
              // iterate over data array for best fit timestamp
              for (let t_index = 0; t_index < timeValues.length - 1; t_index++) {
                // time = timeValues[refIdxs.current[i]!];
                let t_time = timeValues.get(t_index);
                // console.log('timevalues', timeValues, 't time', t_time, 'time diff', event.payload.time! - t_time);
                if (t_time === event.payload.time!) {
                  refIdxs.current[i]! = t_index;
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
                          refIdxs.current[i]! = t_index_minus;
                          // console.log('backwards scrub done', t_index);
                          break;
                        }
                      }
                      break;
                    } else {
                      // this is the one
                      refIdxs.current[i]! = t_index - 1;
                      // console.log("t_time_minus < event.payload.time! index zero, return", t_index - 1);
                      break;
                    }
                  } else {
                    refIdxs.current[i]! = 0;
                    // console.log("t_time > event.payload.time! index zero, return", t_index);
                    return;
                  }
                } else if (t_time < event.payload.time!) {
                  if (t_index === timeValues.length - 1) {
                    // console.log("t_time < event.payload.time! max index", t_index);
                    refIdxs.current[i]! = t_index;
                    break;
                  }
                  let t_time_plus = timeValues.get(t_index + 1);
                  if (t_time_plus > event.payload.time!) {
                    refIdxs.current[i]! = t_index;
                    // console.log("t_time < event.payload.time!", t_index);
                    break;
                  }
                }
              }
            }
          }
          //
          //

          // // If new timestamp is less than our current timestamp, then search from start
          // // TODO: depending on circumstances, we could perhaps just search backwards, eg: if scrubbing is in event?
          // let time = timeValues.get(refIdxs.current[i]);
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
          //     refIdxs.current[i] -= 1;
          //     break;
          //   }
          // }
          const currentTemp: number = data.series[0].fields[i + 1].values.get(refIdxs.current[i]) ?? 0;
          console.log('current temp: ', currentTemp);
          val.text!.textContent = currentTemp.toFixed(2);
        });
      }
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus, data.series, numColumns]);

  if (!data.series.length || !data.series[0].fields.length) {
    return null;
  }

  return (
    <div style={{ width: width, height: height, display: 'block' }}>
      {refRects.current.map((rectRef, i) => {
        let temp = 0;
        // let name = 'name';
        let name = '';
        if (data.series.length && i + 1 < data.series[0].fields.length) {
          // const idx = data.series[0].fields[i + 1].values.length - 1;
          temp = data.series[0].fields[i + 1].values.get(refIdxs.current[i]);
          // let name_field = data.series[0].fields.find((field) => field.name === 'name');
          // if (name_field === undefined) {
          //   return;
          // }
          // name = name_field!.values.get(refIdxs.current[i]);
          // temp = data.series[0].fields[i + 1].values.get(idx);
          // temp = val.text!.textContent
        }
        return (
          <RectWithText
            ref={(el) => (refRects.current[i] = el)}
            width={60}
            height={30}
            device={name}
            key={`temp-${i}`}
            temperature={temp}
          />
        );
      })}
    </div>
  );
};
