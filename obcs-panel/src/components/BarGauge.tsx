import React, { useEffect, useMemo, useRef } from 'react';
import { BarOrientation, BarGaugeProps as BarGaugeProps, TimeEvent } from '../types';
import { Vector } from '@grafana/data';
import { scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';

const barDimensions = (
  values: Vector<any>,
  valueIdx: number,
  labelIdx: number,
  orientation: number,
  xMax: number,
  yMax: number,
  barScale: any
) => {
  // If we couldn't find one (i.e., the 0th timestamp was already higher),
  // then refIdxs.current[i] will be -1, and the .get() below for barSize will return undefined,
  // which then gets null coalesced to 0. I.e., show value 0 if time is way before we have anything for
  // The scaled 'extent' for the value of the bar (e.g., for a vertical orientation, the height of the bar)
  const barSize = barScale(values.get(valueIdx) ?? 0);
  // Note: x increases positive to the right, y increases positive downward, hence barY's vertical calculation
  // The starting X point
  const barX = 0;
  // The starting Y point. Graph grows positive down
  const barY = orientation === BarOrientation.horizontal ? 0 : yMax - barSize;
  // The width of the graph (i.e., not of the containing bar)
  const graphWidth = xMax;
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
export const BarGauge = (props: BarGaugeProps) => {
  const { width, height, data, orientation, bidx, eventBus } = props;
  // An array of references to the bar gauges in this row
  const refGauge = useRef<SVGRectElement | null>(null);
  // An array of idxs into the field value array, where we expect the next timestamp to be after
  const refIdx = useRef<number>(0);
  const verticalMargin = 0; //height * .4;
  // Bounds
  const xMax = width;
  const yMax = height + verticalMargin;
  // TODO: adjust maxBarSize horizontal width?
  const maxBarSize = orientation === BarOrientation.horizontal ? width : yMax;
  // TODO: fix max value, current using 5
  const maxValue = 5;
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

  // Unix seconds timestamp that denotes current time, obtained from cosmos-timeline event publisher
  useEffect(() => {
    const subscriber = eventBus.getStream(TimeEvent).subscribe((event) => {
      if (event.payload.time !== undefined) {
        //refUnixTime.current = event.payload.time;
        // Make sure div reference has been obtained
        if (refGauge.current === null) {
          return;
        }
        // There are bar gauges to display (TODO: we should always be able to show empty)
        if (bidx === undefined || bidx > data.series.length) {
          return;
        }
        // setState takes one rerender cycle to be reset to the correct value
        if (1 >= data.series[bidx].fields.length) {
          return;
        }
        // Query must have returned some values
        if (data.series[bidx].fields[0].values.length === 0) {
          return;
        }
        // If index is out of bounds, set it back to the start
        if (refIdx.current >= data.series[bidx].fields[0].values.length - 1) {
          refIdx.current = 0;
        }
        // If new timestamp is less than our current timestamp, then search from start
        // TODO: depending on circumstances, we could perhaps just search backwards, eg: if scrubbing is in event?
        const timeValues = data.series[bidx].fields[0].values;
        let time = timeValues.get(refIdx.current);
        if (time > event.payload.time!) {
          refIdx.current = 0;
        }
        // Search through timestamps, and get the timestamp that is one before we go over the event timestamp
        for (; refIdx.current < timeValues.length - 1; refIdx.current++) {
          time = timeValues.get(refIdx.current);
          if (time === event.payload.time!) {
            break;
          }
          if (time > event.payload.time!) {
            refIdx.current -= 1;
            break;
          }
        }
        const { x, y, barWidth, barHeight } = barDimensions(
          data.series[bidx].fields[1].values,
          refIdx.current,
          1,
          orientation,
          xMax,
          yMax,
          barScale
        );
        refGauge.current!.setAttribute('x', (x ?? 0).toString());
        refGauge.current!.setAttribute('y', y.toString());
        refGauge.current!.setAttribute('width', barWidth.toString());
        refGauge.current!.setAttribute('height', barHeight.toString());
      }
    });

    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus, barScale, bidx, data.series, orientation, xMax, yMax]);
  //console.log(filteredLabels, numGraphs, filteredLabels.map(i=>`thing${i}`), xScale(`thing7`));
  if (bidx === undefined || bidx > data.series.length) {
    return null;
  }
  return (
    <svg width={xMax} height={yMax}>
      <Group>
        {[1].map((val: number, i: number) => {
          // setState takes one rerender cycle to be reset to the correct value
          if (val >= data.series[bidx].fields.length) {
            return null;
          }
          const { x, y, barWidth, barHeight, graphWidth, graphHeight } = barDimensions(
            data.series[bidx].fields[val].values,
            data.series[bidx].fields[val].values.length - 1,
            val,
            orientation,
            xMax,
            yMax,
            barScale
          );
          return (
            <Group key={`bar-${val}`}>
              <rect x={x} y={0} width={graphWidth} height={graphHeight} fill="rgba(0, 0, 0, 0.9)" />
              <Bar innerRef={refGauge} x={x} y={y} width={barWidth} height={barHeight} fill="rgba(0, 255, 0, 0.9)" />
            </Group>
          );
        })}
      </Group>
    </svg>
  );
};
