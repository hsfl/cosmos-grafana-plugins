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

export const NodalAwarenessPlot = (props: { width: number; height: number; data: PanelData }) => {
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

  const horizonCX = (width * 0.6) / 2;
  const horizonCY = height / 2.5 + height / 5;

  //Positioning of secondary node indicator dot
  const ringIdx = radialTicks.length;
  const tickSpacing = dimMax / 2 / (radialTicks.length + 1);
  const concentricR = tickSpacing * ringIdx;
  //distance from center of concentric rings to indicator dot using elevation
  const nodeR = ((90 - Math.abs(props.data.series[1].fields[3].values.get(0)) * (180 / Math.PI)) / 90) * concentricR;
  //x and y position of indicator dot using azimuth
  const nodeY =
    height -
    concentricR -
    (height - 2 * concentricR) / 2 -
    nodeR * Math.sin(90 * (Math.PI / 180) - props.data.series[1].fields[1].values.get(0));
  const nodeX =
    (width * 0.6) / 2 -
    concentricR -
    (width * 0.6 - 2 * concentricR) / 2 -
    nodeR * Math.cos(90 * (Math.PI / 180) - props.data.series[1].fields[1].values.get(0));

  // Update scale output to match component dimensions
  yScale.range([0, height / 2 - padding]);
  return (
    <motion.svg width={width * 0.6} height={height}>
      <motion.rect width={width * 0.6} height={height} fill={'#000'} rx={0} />
      {/** Horizon subcircle */}
      <motion.g>
        <motion.circle
          cx={horizonCX}
          cy={horizonCY}
          fill="#f00"
          fillOpacity={0.2}
          r={dimMax / 2.5 - padding}
          stroke="#f00"
          strokeOpacity={0.2}
        />
      </motion.g>

      {/** Awareness Grid group */}
      <motion.g>
        {/** Concentric rings */}
        {radialTicks.map((v, i) => {
          const ringIdx = radialTicks.length - i;
          const tickSpacing = dimMax / 2 / (radialTicks.length + 1);
          const r = tickSpacing * ringIdx;
          const gridCenterX = (width * 0.6) / 2;
          const gridCenterY = height / 2;
          return (
            <motion.circle
              key={`radial-circle-${i}`}
              cx={gridCenterX}
              cy={gridCenterY}
              fill="none"
              r={r}
              stroke="#f00"
              //strokeWidth="4"
              strokeLinecap="round"
              //transition={{ ease: "easeInOut", repeat: Infinity, duration: 2 }}
            />
          );
        })}
        {/** Tick labels */}
        {radialTicks.map((v, i) => {
          const ringIdx = radialTicks.length - i;
          const tickSpacing = dimMax / 2 / (radialTicks.length + 1);
          const gridCenterX = (width * 0.6) / 2;
          const gridCenterY = height / 2;
          return (
            <motion.text
              key={`radial-tick-${i}`}
              x={gridCenterX}
              y={gridCenterY + tickSpacing * ringIdx}
              fill="#f00"
              pointerEvents="none"
            >
              {v}
            </motion.text>
          );
        })}
        {/** Dashed radial lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((v, i) => {
          const gridCenterX = (width * 0.6) / 2;
          const gridCenterY = height / 2;
          const gridRadius = dimMax / 2 - padding;
          const x2 = Math.cos((i * Math.PI) / 4) * gridRadius + gridCenterX;
          const y2 = Math.sin((i * Math.PI) / 4) * gridRadius + gridCenterY;
          return (
            <motion.line
              key={`radial-line-${i}`}
              x1={gridCenterX}
              y1={gridCenterY}
              x2={x2}
              y2={y2}
              stroke="#f00"
              strokeDasharray={4}
            />
          );
        })}
      </motion.g>

      <motion.g>
        <motion.circle cx={nodeX} cy={nodeY} fill="#0f0" fillOpacity={0.5} r={4} stroke="#0f0" strokeOpacity={0.5} />
      </motion.g>
    </motion.svg>
  );
};
