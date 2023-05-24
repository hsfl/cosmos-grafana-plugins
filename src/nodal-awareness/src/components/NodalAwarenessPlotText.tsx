import React, { useMemo } from 'react';
import { scaleLinear } from '@visx/scale';
import { motion } from 'framer-motion';
import { PanelData } from '@grafana/data';

// interface Point {
//   theta: number;
//   r: number;
// }
// Axis markers
// const points: Point[] = [
//   { theta: 0, r: 45 },
//   { theta: 22.5, r: 45 },
//   { theta: 45.0, r: 45 },
//   { theta: 67.5, r: 45 },
// ];
// const angleTicks: number[] = [0, 1, 2, 3, 4, 5, 6, 7].map((v) => v * 45);
const radialTicks: number[] = [0, 22.5, 45.0, 67.5];
// accessors
// const getTheta = (d: Point) => d.theta;
// const getRadius = (d: Point) => d.r;
// const formatTicks = (val: NumberLike) => String(val);

// const padding = 20;

// const blue = '#aeeef8';

export const NodalAwarenessPlotText = (props: { width: number; height: number; data: PanelData }) => {
  const { width, height } = props;
  const dimMax = Math.min(width, height);
  const padding = Math.min(dimMax / 2 / (radialTicks.length + 1), 100000);
  const yMax = height / 2;
  // const xScale = useMemo(
  //   () =>
  //     scaleLinear({
  //       domain: [0, 360],
  //       range: [0, Math.PI * 2],
  //     }),
  //   []
  // );
  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [90, 0],
        range: [1, yMax],
      }),
    [yMax]
  );
  // const angle = (d: Point) => xScale(getTheta(d)) ?? 0;
  // const radius = (d: Point) => yScale(getRadius(d)) ?? 0;

  if (width < 10) {
    return null;
  }

  //const horizonCX = (width * 0.6) / 2;
  //const horizonCY = height / 2.5 + height / 5;

  // Update scale output to match component dimensions
  yScale.range([0, height / 2 - padding]);
  return (
    <div style={{ width: width * 0.6, height: height, overflow: 'scroll' }}>
      <motion.svg width={width * 0.6} height={height + 50}>
        <motion.rect width={width * 0.6} height={height + 50} fill={'#000'} rx={0} />
        <motion.text x="10" y="15" initial="hidden" animate="visible" style={{ fill: 'red' }}>
          <tspan x="10" dy="1em">
            Central Node
          </tspan>
          <tspan x="10" dy="1em">
            Node Type: {props.data.series[0].fields[1].values.get(0)}
          </tspan>
          <tspan x="10" dy="1em">
            Name: {props.data.series[0].name}
          </tspan>
        </motion.text>
        <motion.text x="10" y="70" initial="hidden" animate="visible" style={{ fill: '#32CD32' }}>
          <tspan x="10" dy="1em">
            Node Type: {props.data.series[1].fields[2].values.get(0)}
          </tspan>
          <tspan x="10" dy="1em">
            Node Name: {props.data.series[1].name}
          </tspan>
          <tspan x="10" dy="1em">
            Azimuth: {props.data.series[1].fields[1].values.get(0)}
          </tspan>
          <tspan x="10" dy="1em">
            Elevation: {props.data.series[1].fields[3].values.get(0)}
          </tspan>
          <tspan x="10" dy="1em">
            Slant Range: {props.data.series[1].fields[4].values.get(0)}
          </tspan>
        </motion.text>
      </motion.svg>
    </div>
  );
};
