import React from 'react';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { Text } from '@visx/text';
import { useCosmosTimeline, useDomUpdate } from '../helpers/hooks';
import { EventBus } from '@grafana/data';

// interface Point {
//   x: number;
//   y: number;
// }

export const MissionEventsDisplay = (props: { width: number, height: number, eventBus: EventBus }) => {
  const { width, height, eventBus } = props;
  const columns = ['Umbra', 'kauaic', 'surrey', 'cube1', 'cube2'];
  const colOffset = width / 4;
  const colOffsetEnd = colOffset + 15 * columns.length
  const topPartOffset = height / 6;
  const [refTimeTickGroup, updateDomRefs] = useDomUpdate();
  useCosmosTimeline(eventBus, updateDomRefs);

  if (width < 10) {
    return null;
  }

  return (
    <svg width={width} height={height}>
      <rect width={width} height={height} fill={'#000'} rx={14} />
      <Group top={0} left={0}>
        {/* header texts */}
        <Group>
          <Text x={0} y={topPartOffset} fontSize={12} verticalAnchor='end' fill={'#03fcf0'}>Orbital Events</Text>
          <Text x={colOffsetEnd + 5} y={topPartOffset} fontSize={12} verticalAnchor='end' fill={'#fff'}>UTC</Text>
          <Text x={colOffsetEnd + 40} y={topPartOffset} fontSize={12} verticalAnchor='end' fill={'#ff0'}>Scheduled</Text>
          <Text x={colOffsetEnd + 120} y={topPartOffset} fontSize={12} verticalAnchor='end' fill={'#ff0'}>Executed</Text>
        </Group>
        {/* white horizontal line */}
        <Line from={{ x: 0, y: topPartOffset }} to={{ x: width, y: topPartOffset }} stroke={'#ffffff'} />
        {/* columns*/}
        <Line from={{ x: colOffset, y: 0 }} to={{ x: colOffset, y: height }} stroke={'#ffff00'} />
        {columns.map((val, i) => (
          <Group key={`radar-line-${i}`}>
            <Text x={colOffset + 15 * i} y={20} angle={90} fill={'#ffffff'}>
              {val}
            </Text>
            <Line from={{ x: colOffset + 15 * (i+1), y: 0 }} to={{ x: colOffset + 15 * (i+1), y: height }} stroke={'#ffff00'} />
          </Group>
        ))}
        {/* horizontal time ticks */}
        <Group top={0} left={0} ref={ref=> refTimeTickGroup.current = ref}>
          {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map((val, i) => (
              <Line key={`tick-line-${i}`} from={{ x: colOffset, y: topPartOffset + val*30 }} to={{ x: colOffsetEnd, y: topPartOffset + val * 30 }} stroke={'#ffff00'} />
          ))}
        </Group>
        {/* Horizontal time tracker line */}
        <Line from={{ x: 0, y: height/2 }} to={{ x: width, y: height/2 }} stroke={'#0f0'} />
      </Group>
    </svg>
  );
};
