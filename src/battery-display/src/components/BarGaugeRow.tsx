import React, { useEffect, useMemo, useRef } from 'react';
import { BarOrientation, BarGaugeRowProps, TimeEvent } from '../types';
import { Vector } from '@grafana/data';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';

const barDimensions = (
  values: Vector<any>,
  valueIdx: number,
  labelIdx: number,
  orientation: number,
  yMax: number,
  xScale: any,
  barScale: any
) => {
  // If we couldn't find one (i.e., the 0th timestamp was already higher),
  // then refIdxs.current[i] will be -1, and the .get() below for barSize will return undefined,
  // which then gets null coalesced to 0. I.e., show value 0 if time is way before we have anything for
  // The scaled 'extent' for the value of the bar (e.g., for a vertical orientation, the height of the bar)
  const barSize = barScale(values.get(valueIdx) ?? 0);
  // Note: x increases positive to the right, y increases positive downward, hence barY's vertical calculation
  // The starting X point
  const barX = xScale(labelIdx);
  // The starting Y point. Graph grows positive down
  const barY = orientation === BarOrientation.horizontal ? 0 : yMax - barSize;
  // The width of the graph (i.e., not of the containing bar)
  const graphWidth = xScale.bandwidth();
  // The height of the graph (i.e., not of the containing bar)
  const graphHeight = yMax;
  // The width of the scaled bar in the graph
  const barWidth = orientation === BarOrientation.horizontal ? barSize : graphWidth;
  // The height of the scaled bar in the graph
  const barHeight = orientation === BarOrientation.horizontal ? yMax : barSize;
  return {
    x: barX,
    y: barY,
    graphWidth: graphWidth,
    graphHeight: graphHeight,
    barWidth: barWidth,
    barHeight: barHeight,
  };
};

// Row of solar panel values
export const BarGaugeRow = (props: BarGaugeRowProps) => {
  const { width, height, filteredLabels, data, orientation, bidx, eventBus } = props;
  // An array of references to the bar gauges in this row
  const refGauges = useRef<Array<SVGRectElement | null>>([]);
  // An array of idxs into the field value array, where we expect the next timestamp to be after
  const refIdxs = useRef<number[]>([]);
  // Number of graphs in this row
  const numGraphs = filteredLabels.length;
  const verticalMargin = 0; //height * .4;
  // Bounds
  const xMax = width * numGraphs;
  const yMax = height + verticalMargin;
  // TODO: adjust maxBarSize horizontal width?
  const maxBarSize = orientation === BarOrientation.horizontal ? width : yMax;
  // TODO: fix max value, current using 5
  const maxValue = 5;
  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand<number>({
        range: [0, xMax],
        round: true,
        domain: filteredLabels,
        paddingInner: 0.1,
      }),
    [xMax, filteredLabels]
  );
  // Scale between 0 and end of bar's maximum value, in the direction of the orientation (i.e., barSize)
  const barScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, maxBarSize],
        round: true,
        domain: [0, maxValue],
        clamp: true,
      }),
    [maxBarSize]
  );
  // Set length of array of references to number of bar gauges in this row
  // Also set the length of the array of indices
  useEffect(() => {
    // Array of references
    if (filteredLabels.length > refGauges.current.length) {
      for (let i = refGauges.current.length; i < filteredLabels.length; i++) {
        refGauges.current.push(null);
      }
    } else {
      refGauges.current = refGauges.current.slice(0, filteredLabels.length);
    }
    // Array of indices
    if (filteredLabels.length > refIdxs.current.length) {
      for (let i = refIdxs.current.length; i < filteredLabels.length; i++) {
        refIdxs.current.push(0);
      }
    } else {
      refIdxs.current = refIdxs.current.slice(0, filteredLabels.length);
    }
  }, [filteredLabels]);
  // Unix seconds timestamp that denotes current time, obtained from cosmos-timeline event publisher
  useEffect(() => {
    const subscriber = eventBus.getStream(TimeEvent).subscribe((event) => {
      if (event.payload.time !== undefined) {
        //refUnixTime.current = event.payload.time;
        filteredLabels.forEach((val: number, i: number) => {
          // Make sure div reference has been obtained
          if (refGauges.current[i] === null) {
            return;
          }
          // There are bar gauges to display (TODO: we should always be able to show empty)
          if (numGraphs === 0 || bidx === undefined || bidx > data.series.length) {
            return;
          }
          // setState takes one rerender cycle to be reset to the correct value
          if (val >= data.series[bidx].fields.length) {
            return;
          }
          // Query must have returned some values
          if (data.series[bidx].fields[0].values.length === 0) {
            return;
          }
          // If index is out of bounds, set it back to the start
          if (refIdxs.current[i] >= data.series[bidx].fields[0].values.length - 1) {
            refIdxs.current[i] = 0;
          }
          // If new timestamp is less than our current timestamp, then search from start
          // TODO: depending on circumstances, we could perhaps just search backwards, eg: if scrubbing is in event?
          const timeValues = data.series[bidx].fields[0].values;
          let time = timeValues.get(refIdxs.current[i]);
          if (time > event.payload.time!) {
            refIdxs.current[i] = 0;
          }
          // Search through timestamps, and get the timestamp that is one before we go over the event timestamp
          for (; refIdxs.current[i] < timeValues.length - 1; refIdxs.current[i]++) {
            time = timeValues.get(refIdxs.current[i]);
            if (time === event.payload.time!) {
              break;
            }
            if (time > event.payload.time!) {
              refIdxs.current[i] -= 1;
              break;
            }
          }
          const { x, y, barWidth, barHeight } = barDimensions(
            data.series[bidx].fields[val].values,
            refIdxs.current[i],
            val,
            orientation,
            yMax,
            xScale,
            barScale
          );
          refGauges.current[i]!.setAttribute('x', (x ?? 0).toString());
          refGauges.current[i]!.setAttribute('y', y.toString());
          refGauges.current[i]!.setAttribute('width', barWidth.toString());
          refGauges.current[i]!.setAttribute('height', barHeight.toString());
        });
      }
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus, barScale, bidx, data.series, filteredLabels, numGraphs, orientation, xScale, yMax]);
  //console.log(filteredLabels, numGraphs, filteredLabels.map(i=>`thing${i}`), xScale(`thing7`));
  if (numGraphs === 0 || bidx === undefined || bidx > data.series.length) {
    return null;
  }
  return (
    <svg width={xMax} height={yMax}>
      <Group>
        {filteredLabels.map((val: number, i: number) => {
          // setState takes one rerender cycle to be reset to the correct value
          if (val >= data.series[bidx].fields.length) {
            return null;
          }
          const { x, y, barWidth, barHeight, graphWidth, graphHeight } = barDimensions(
            data.series[bidx].fields[val].values,
            data.series[bidx].fields[val].values.length - 1,
            val,
            orientation,
            yMax,
            xScale,
            barScale
          );
          return (
            <Group key={`bar-${val}`}>
              <rect x={x} y={0} width={graphWidth} height={graphHeight} fill="rgba(200, 200, 200, 0.9)" />
              <Bar
                innerRef={(el) => (refGauges.current[i] = el)}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="rgba(255, 255, 0, 0.9)"
              />
            </Group>
          );
        })}
      </Group>
    </svg>
  );
};
