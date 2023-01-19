import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { Text } from '@visx/text';
import { useCosmosTimeline, useDomUpdate } from '../helpers/hooks';
import { EventBus, PanelData } from '@grafana/data';

interface DummyEvent {
  name: string;
  start: number;
  duration: number;
}

// Some dummy events for time between UTC 2022-10-22 20:00:00 to 2022-10-22 21:00:00 (1666468859000 to 1666472399000)
const eventTimes = [
  1666468859000, // 0
  1666469459000, // 10
  1666469939000, // 18
  1666470359000, // 25
  1666470659000, // 30
  1666471859000, // 50
  1666472159000, // 55
];
const eventDurations = [15, 10, 5, 20, 10, 20, 20].map((v) => v * 60 * 1000);
const dummyEvents: DummyEvent[] = eventTimes.map((v, i) => ({
  name: 'event' + i,
  start: eventTimes[i],
  duration: eventDurations[i],
}));
const tickHeight = 30;

export const MissionEventsDisplay = (props: { data: PanelData; width: number; height: number; eventBus: EventBus }) => {
  const { data, width, height, eventBus } = props;
  const columns = ['Umbra', 'kauaic', 'surrey', 'cube1', 'cube2'];
  const colOffset = width / 4;
  const colOffsetEnd = colOffset + 15 * columns.length;
  const topPartOffset = height / 6;
  const [refTimeTickGroup, updateDomRefs] = useDomUpdate();
  useCosmosTimeline(eventBus, updateDomRefs);
  // let's assume a scale of 1 means that each tick represents 1 minute
  const [scale, setScale] = useState<number>(1);
  const [graphHeight, setGraphHeight] = useState<number>(height);
  const [divElement, setDivElement] = useState<HTMLDivElement>();
  const scrollPercentage = useRef<number>(0);
  const [tickVals, setTickVals] = useState<number[]>([]);

  // Update various parameters of the graph: height, ticks, etc.
  useEffect(() => {
    const timeSpan = eventTimes[eventTimes.length - 1] - eventTimes[0];
    const newGraphHeight = tickHeight * (timeSpan / 60000 / scale);
    setGraphHeight(newGraphHeight);
    setTickVals(() => {
      const ret: number[] = [];
      for (let i = 0; i < newGraphHeight; i += tickHeight) {
        ret.push(i);
      }
      return ret;
    });
  }, [height, scale]);

  // Temp time ticker, replace with cosmos timeline
  useEffect(() => {
    const interval = setInterval(() => {
      if (divElement) {
        divElement.scrollTo({ top: scrollPercentage.current, behavior: 'smooth' });
        scrollPercentage.current += 10;
      }
    }, 1000);

    return () => {
      // Clear interval reference
      clearInterval(interval);
    };
  }, [divElement]);

  // Callback for div reference acquisition
  const refDiv = useCallback((ref: HTMLDivElement | null) => {
    if (ref !== null) {
      setDivElement(ref);
    }
  }, []);

  // Don't attempt to display anything if view is too small
  if (width < 10) {
    return null;
  }

  return (
    <div ref={refDiv} style={{ width: width, height: height, overflow: 'scroll' }}>
      <svg width={width} height={graphHeight}>
        <rect width={width} height={graphHeight} fill={'#000'} rx={14} />
        <Group top={0} left={0}>
          {/* header texts */}
          <Group>
            <Text x={0} y={topPartOffset} fontSize={12} verticalAnchor="end" fill={'#03fcf0'}>
              Orbital Events
            </Text>
            <Text x={colOffsetEnd + 5} y={topPartOffset} fontSize={12} verticalAnchor="end" fill={'#fff'}>
              UTC
            </Text>
            <Text x={colOffsetEnd + 40} y={topPartOffset} fontSize={12} verticalAnchor="end" fill={'#ff0'}>
              Scheduled
            </Text>
            <Text x={colOffsetEnd + 120} y={topPartOffset} fontSize={12} verticalAnchor="end" fill={'#ff0'}>
              Executed
            </Text>
          </Group>
          {/* white horizontal line */}
          <Line from={{ x: 0, y: topPartOffset }} to={{ x: width, y: topPartOffset }} stroke={'#ffffff'} />
          {/* columns*/}
          <Line from={{ x: colOffset, y: 0 }} to={{ x: colOffset, y: graphHeight }} stroke={'#ffff00'} />
          {columns.map((val, i) => (
            <Group key={`radar-line-${i}`}>
              <Text x={colOffset + 15 * i} y={20} angle={90} fill={'#ffffff'}>
                {val}
              </Text>
              <Line
                from={{ x: colOffset + 15 * (i + 1), y: 0 }}
                to={{ x: colOffset + 15 * (i + 1), y: graphHeight }}
                stroke={'#ffff00'}
              />
            </Group>
          ))}
          {/* horizontal time ticks */}
          <Group top={0} left={0} ref={(ref) => (refTimeTickGroup.current = ref)}>
            {tickVals.map((val, i) => (
              <Line
                key={`tick-line-${i}`}
                from={{ x: colOffset, y: topPartOffset + val }}
                to={{ x: colOffsetEnd, y: topPartOffset + val }}
                stroke={'#ffff00'}
              />
            ))}
          </Group>
          {/* Horizontal time tracker line */}
          <Line from={{ x: 0, y: height / 2 }} to={{ x: width, y: height / 2 }} stroke={'#0f0'} />
        </Group>
      </svg>
    </div>
  );
};
