import React, { useMemo } from 'react';
import { AxisLeft } from '@visx/axis';
import { curveNatural } from '@visx/curve';
import { GridAngle, GridRadial } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear, NumberLike } from '@visx/scale';
import { Circle, LineRadial } from '@visx/shape';
import { motion } from 'framer-motion';

interface Point {
  theta: number;
  r: number;
}
// Axis markers
const points: Point[] = [
  { theta: 0, r: 45 },
  { theta: 22.5, r: 45 },
  { theta: 45.0, r: 45 },
  { theta: 67.5, r: 45 },
];
const angleTicks: number[] = [0, 1, 2, 3, 4, 5, 6, 7].map((v) => v * 45);
const radialTicks: number[] = [0, 22.5, 45.0, 67.5];
// accessors
const getTheta = (d: Point) => d.theta;
const getRadius = (d: Point) => d.r;
const formatTicks = (val: NumberLike) => String(val);

const padding = 20;

const blue = '#aeeef8';

export const NodalAwarenessPlot = (props: { width: number; height: number }) => {
  const { width, height } = props;
  const dimMax = Math.min(width, height);
  const padding = Math.min((dimMax/2)/(radialTicks.length+1), 100000);
  const yMax = height / 2;
  const xScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, 360],
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

  if (width < 10) {
    return null;
  }

  const horizonCX = width/3;
  const horizonCY = height/2.5;

  // Update scale output to match component dimensions
  yScale.range([0, height / 2 - padding]);
  return (
    // <svg width={width} height={height}>
    //   <rect width={width} height={height} fill={'#000'} rx={14} />
    //   <Group top={height / 2} left={width / 2}>
    //     {/* Horizon sub-circle */}
    //     <Circle
    //       cx={-width / 16}
    //       cy={height / 8}
    //       r={height / 3}
    //       stroke={blue}
    //       strokeWidth={1}
    //       fill={blue}
    //       fillOpacity={0.1}
    //       strokeOpacity={0.2}
    //     />
    //     {/* Grid circle */}
    //     <GridRadial
    //       innerRadius={1}
    //       scale={yScale}
    //       stroke={'#ffff00'}
    //       strokeWidth={1}
    //       fill={blue}
    //       fillOpacity={0.25}
    //       strokeOpacity={0.6}
    //       tickValues={radialTicks}
    //     />
    //     <GridAngle
    //       scale={xScale}
    //       outerRadius={height / 2 - padding}
    //       stroke={'#ff0000'}
    //       strokeWidth={1}
    //       strokeOpacity={0.8}
    //       strokeDasharray="8,8"
    //       tickValues={angleTicks}
    //     />
    //     <AxisLeft
    //       top={0}
    //       scale={yScale}
    //       tickValues={radialTicks}
    //       tickStroke="none"
    //       tickLabelProps={(val) => ({
    //         fontSize: 10,
    //         fill: blue,
    //         fillOpacity: 1,
    //         textAnchor: 'middle',
    //         dtheta: '1em',
    //         dy: '-0.5em',
    //         stroke: '#ffff00',
    //         strokeWidth: 0.5,
    //         paintOrder: 'stroke',
    //       })}
    //       tickFormat={formatTicks}
    //       hideAxisLine
    //     />
    //     <LineRadial angle={angle} radius={radius} curve={curveNatural} data={points} stroke="#fff" strokeOpacity={0} />
    //   </Group>
    // </svg>
    <motion.svg width={width} height={height} >
      <motion.rect width={width} height={height} fill={'#000'} rx={14} />
      {
      /**
       * Horizon subcircle
       */
      }
      <motion.g>
        <motion.circle
          cx={horizonCX}
          cy={horizonCY}
          fill="#f00"
          fillOpacity={0.2}
          r={dimMax/2 - padding}
          stroke="#f00"
          strokeOpacity={0.2}
        />
      </motion.g>

      {
      /**
       * Awareness Grid group
       */
      }
      <motion.g>
        {/** Concentric rings */}
        {radialTicks.map((v,i) => {
          const ringIdx = radialTicks.length - i;
          const tickSpacing = (dimMax/2)/(radialTicks.length+1);
          const r = tickSpacing*ringIdx;
          const gridCenterX = width/2;
          const gridCenterY = height/2;
          return (
            <motion.circle
              cx={gridCenterX}
              cy={gridCenterY}
              fill="none"
              r={r}
              stroke="#f00"
              //strokeWidth="4"
              strokeLinecap="round"
              //transition={{ ease: "easeInOut", repeat: Infinity, duration: 2 }}
            />);
        })}
        {/** Tick labels */}
        {radialTicks.map((v,i) => {
          const ringIdx = radialTicks.length - i;
          const tickSpacing = (dimMax/2)/(radialTicks.length+1);
          const gridCenterX = width/2;
          const gridCenterY = height/2;
          return (
            <motion.text
              x={gridCenterX}
              y={gridCenterY + tickSpacing*ringIdx}
              fill='#f00'
              pointerEvents='none'
            >
              {v}
            </motion.text>
          );
        })}
        {/** Dashed radial lines */}
        {[0,1,2,3,4,5,6,7].map((v,i)=>{
            const gridCenterX = width/2;
            const gridCenterY = height/2;
            const gridRadius = dimMax/2 - padding;
            const x2 = Math.cos(i*Math.PI/4)*gridRadius + gridCenterX;
            const y2 = Math.sin(i*Math.PI/4)*gridRadius + gridCenterY;
          return (
            <motion.line
              x1={gridCenterX}
              y1={gridCenterY}
              x2={x2}
              y2={y2}
              stroke='#f00'
              strokeDasharray={4}
            />
          );
        })}
      </motion.g>
    </motion.svg>
  );
};
