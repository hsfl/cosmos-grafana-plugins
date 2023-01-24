import React, { useMemo } from 'react';
import { AxisLeft } from '@visx/axis';
import { curveNatural } from '@visx/curve';
import { GridAngle, GridRadial } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear, NumberLike } from '@visx/scale';
import { LineRadial } from '@visx/shape';

interface Point {
  theta: number;
  r: number;
}
// Axis markers
// const points: Point[] = [
//   { theta: 0, r: 45 },
//   { theta: 22.5, r: 45 },
//   { theta: 45.0, r: 45 },
//   { theta: 67.5, r: 45 },
// ];

// Sample data, drawing a mock antenna pattern
const dataPoints: Point[] = [];
const numPoints = 20;
for (let i = 0; i < numPoints; i++) {
  const theta = ((2 * Math.PI) / (numPoints - 1)) * i;
  const r = (1 - Math.cos(theta)) * 45;
  dataPoints.push({ theta, r });
}

const angleTicks: number[] = [0, 1, 2, 3, 4, 5, 6, 7].map((v) => (v * Math.PI) / 4);
const radialTicks: number[] = [0, 22.5, 45.0, 67.5];
// accessors
const getTheta = (d: Point) => d.theta;
const getRadius = (d: Point) => d.r;
const formatTicks = (val: NumberLike) => String(val);

const padding = 20;

const bgColor = '#fefefe';

export const AntennaPlot = (props: { width: number; height: number }) => {
  const { width, height } = props;
  const dimMax = Math.min(width, height);
  const yMax = dimMax / 2;
  const xScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, Math.PI * 2],
        range: [0, Math.PI * 2],
      }),
    []
  );
  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [90, 0],
        range: [1, yMax],
      }),
    [yMax]
  );
  const angle = (d: Point) => xScale(getTheta(d)) ?? 0;
  const radius = (d: Point) => yScale(getRadius(d)) ?? 0;

  if (dimMax < 10) {
    return null;
  }

  // Update scale output to match component dimensions
  yScale.range([0, dimMax / 2 - padding]);
  return (
    <svg width={dimMax} height={dimMax}>
      {/* Background pattern */}
      <rect width={dimMax} height={dimMax} fill={'#fff'} rx={14} />
      <Group top={dimMax / 2} left={dimMax / 2}>
        {/* Grid circle */}
        <GridRadial
          innerRadius={1}
          scale={yScale}
          stroke={'#ccc'}
          strokeWidth={1}
          fill={bgColor}
          fillOpacity={1}
          strokeOpacity={1}
          tickValues={radialTicks}
        />
        <GridAngle
          scale={xScale}
          outerRadius={dimMax / 2 - padding}
          stroke={'#777'}
          strokeWidth={1}
          strokeOpacity={1}
          strokeDasharray="8,8"
          tickValues={angleTicks}
        />
        {/* Radial Axis labels */}
        <AxisLeft
          top={0}
          scale={yScale}
          tickValues={radialTicks}
          tickStroke="none"
          tickLabelProps={(val) => ({
            fontSize: 10,
            fill: bgColor,
            fillOpacity: 1,
            textAnchor: 'middle',
            dtheta: '1em',
            dy: '-0.5em',
            stroke: '#777',
          })}
          tickFormat={formatTicks}
          hideAxisLine
        />
        {/* Antenna pattern */}
        <LineRadial
          angle={angle}
          radius={radius}
          curve={curveNatural}
          data={dataPoints}
          stroke="#f77"
          strokeOpacity={1}
          strokeWidth={3}
        />
      </Group>
    </svg>
  );
};
