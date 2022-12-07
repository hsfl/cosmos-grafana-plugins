import React from 'react';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { Text } from '@visx/text';

// interface Point {
//   x: number;
//   y: number;
// }

export const MissionEventsDisplay = (props: {width: number, height: number}) => {
  const { width, height } = props;
  const columns = ['Umbra', 'kauaic', 'surrey', 'cube1', 'cube2'];
  const colOffset = width/4;
  
  if (width < 10) {return null;}

  return (
    <svg width={width} height={height}>
      <rect width={width} height={height} fill={'#000'} rx={14} />
      <Group top={0} left={0}>

        <Line from={{x:0, y:height/6}} to={{x:width, y:height/6}} stroke={'#ffffff'} />
        {/* columns*/}
        {columns.map((val, i) => (
          <Group key={`radar-line-${i}`}>
            <Text x={colOffset+15*i} y={20} angle={90} fill={'#ffffff'} >{val}</Text>
            <Line from={{x:colOffset+15*i, y:0}} to={{x:colOffset+15*i, y:height}} stroke={'#ffff00'} />
          </Group>
        ))}
      </Group>
    </svg>
  );
}
