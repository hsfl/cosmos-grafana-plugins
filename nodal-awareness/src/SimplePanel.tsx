import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { AxisLeft } from '@visx/axis';
import { curveNatural } from '@visx/curve';
import { GridAngle, GridRadial } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear, NumberLike } from '@visx/scale';
import { LineRadial } from '@visx/shape';

interface Props extends PanelProps<SimpleOptions> {}

const green = '#e5fd3d';
export const blue = '#aeeef8';
export const background = '#744cca';
const strokeColor = '#744cca';

// utils
// function extent<Datum>(data: Datum[], value: (d: Datum) => number) {
//   const values = data.map(value);
//   return [Math.min(...values), Math.max(...values)];
// }

interface Point {
    x: number;
}
const points: Point[] = [{x:0},{x:0.1},{x:0.2},{x:0.3},{x:0.4},{x:0.5},{x:0.6},{x:0.7},{x:0.8},{x:0.9},{x:1}];
// accessors
const xpt = (d: Point) => d.x;
const formatTicks = (val: NumberLike) => String(val);

// scales
const xScale = scaleLinear({
  domain: [0,1],
  range: [0, Math.PI * 2],
});
const yScale = scaleLinear({
  domain: [0,1],
  range: [1, 10],
});
// for (let point of points) {
//     console.log(xScale(point.x));
// }

const angle = (d: Point) => xScale(xpt(d)) ?? 0;
const radius = (d: Point) => yScale(xpt(d)) ?? 0;
const padding = 20;

export type LineRadialProps = {
  width: number;
  height: number;
  animate?: boolean;
};


export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {

  if (width < 10) {return null;}

  // Update scale output to match component dimensions
  yScale.range([0, height / 2 - padding]);
  const reverseYScale = yScale.copy().range(yScale.range().reverse());

  return (
    <div style={{ width, height }}>
      <svg width={width} height={height}>
        <rect width={width} height={height} fill={'#744cca'} rx={14} />
        <Group top={height/2} left={width/2}>
          <GridAngle
            scale={xScale}
            outerRadius={height / 2 - padding}
            stroke={green}
            strokeWidth={1}
            strokeOpacity={0.3}
            strokeDasharray="5,2"
            numTicks={20}
          />
          <GridRadial
            scale={yScale}
            numTicks={5}
            stroke={blue}
            strokeWidth={1}
            fill={blue}
            fillOpacity={0.1}
            strokeOpacity={0.2}
          />
          <AxisLeft
            top={-height / 2 + padding}
            scale={reverseYScale}
            numTicks={5}
            tickStroke="none"
            tickLabelProps={(val) => ({
              fontSize: 8,
              fill: blue,
              fillOpacity: 1,
              textAnchor: 'middle',
              dx: '1em',
              dy: '-0.5em',
              stroke: strokeColor,
              strokeWidth: 0.5,
              paintOrder: 'stroke',
            })}
            tickFormat={formatTicks}
            hideAxisLine
          />
          <LineRadial angle={angle} radius={radius} curve={curveNatural} data={points} stroke='#fff' />
        </Group>
      </svg>
    </div>
  );
};
