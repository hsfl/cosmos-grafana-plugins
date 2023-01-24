import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { Text } from '@visx/text';
import { useCosmosTimeline, useDomUpdate } from '../helpers/hooks';
import { TimeEvent } from '../types';
import { EventBus, PanelData, TimeRange } from '@grafana/data';
import { animate, motion, useMotionValue } from "framer-motion";
//import "./styles.css";

// interface DummyEvent {
//   name: string;
//   start: number;
//   duration: number;
// }

const orbitalEventTimes = [
  1666468859000, // 0
  1666469459000, // 10
  1666469939000, // 18
];
const orbitalEventDurations = [15, 10, 5].map((v) => v * 60 * 1000);
const orbitalDummyEvents: DummyEvent[] = orbitalEventTimes.map((v, i) => ({
  name: 'O event' + i,
  start: orbitalEventTimes[i],
  duration: orbitalEventDurations[i],
}));

// Some dummy events for time between UTC 2022-10-22 20:00:00 to 2022-10-22 21:00:00 (1666468859000 to 1666472399000)
const spacecraftEventTimes = [
  1666470359000, // 25
  1666470659000, // 30
  1666471859000, // 50
  1666472159000, // 55
];
const spacecraftEventDurations = [20, 10, 20, 20].map((v) => v * 60 * 1000);
const spacecraftDummyEvents: DummyEvent[] = spacecraftEventTimes.map((v, i) => ({
  name: 'SC event' + i,
  start: spacecraftEventTimes[i],
  duration: spacecraftEventDurations[i],
}));

const tickHeight = 30;

export const MissionEventsDisplay = (props: { data: PanelData; width: number; height: number; eventBus: EventBus; timeRange: TimeRange }) => {
  const { data, width, height, eventBus, timeRange } = props;
  const columns = ['Umbra', 'kauai', 'surrey', 'payload1', 'payload2'];
  const colOffset = width / 4;
  const colOffsetEnd = colOffset + 15 * columns.length;
  const topPartOffset = height / 6;
  const [refTimeTickGroup, updateDomRefs] = useDomUpdate();
  // let's assume a scale of 1 means that each tick represents 1 minute
  const [scale /*, setScale */] = useState<number>(1);
  const [graphHeight, setGraphHeight] = useState<number>(height);
  const [divElement, setDivElement] = useState<HTMLDivElement>();
  const scrollPercentage = useRef<number>(0);
  const [tickVals, setTickVals] = useState<number[]>([]);
  //const [lineHeight, setLineHeight] = useState<number>()

  // Update various parameters of the graph: height, ticks, etc.
  useEffect(() => {
    const timeSpan = timeRange.to.unix()*1000 - timeRange.from.unix() * 1000;
    const newGraphHeight = tickHeight * (timeSpan / (60000 * scale)); //1 tick represents [scale] minutes
    setGraphHeight(newGraphHeight);
    setTickVals(() => {
      const ret: number[] = [];
      for (let i = 0; i < newGraphHeight; i += tickHeight) {
        ret.push(i);
      }
      return ret;
    });
  }, [height, scale]);

  console.log(data);

//Updates scrollbar and display position
  const barPosition = useMotionValue(0);
  const updateScrollBar = useCallback((event: TimeEvent) => {
    requestAnimationFrame(() => {
      if (divElement) {
        animate(barPosition, barPosition.get() + 10);
        if (barPosition.get() > height) {
          animate(barPosition, barPosition.get());
        }
        if (barPosition.get() > height/2) {
        divElement.scrollTo({ top: scrollPercentage.current, behavior: 'smooth' });
        scrollPercentage.current += 10;
        }
      }
    });
  }, [divElement]);
  useCosmosTimeline(eventBus, updateScrollBar);

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

//Sets height of timeline bar
  // const barPosition = useMotionValue(0);
  // const val = useRef(0);
  // const updateTimelineBar = useCallback((event: TimeEvent) => {
  //   const interval = setInterval(() => {
  //     animate(barPosition, barPosition.get() + 1);
  //     if (barPosition.get() > height) {
  //       animate(barPosition, barPosition.get());
  //     }
  //   }, 40);
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [barPosition]);

  // useCosmosTimeline(eventBus, updateTimelineBar);

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
            <Text x={colOffsetEnd + 50} y={topPartOffset} fontSize={12} verticalAnchor="end" fill={'#ff0'}>
              Spacecraft Events
            </Text>
            {/* <Text x={colOffsetEnd + 120} y={topPartOffset} fontSize={12} verticalAnchor="end" fill={'#ff0'}>
              Executed
            </Text> */}
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
          {/* <Line from={{ x: 0, y: topPartOffset + scrollPercentage.current }} to={{ x: width, y: topPartOffset + scrollPercentage.current }} stroke={'#0f0'} /> */}
          </Group>
          {/* Example orbital events*/}
          <Group>
            {/* Event Rectangle*/}
            {orbitalDummyEvents.map((v, i) => (
                <Group>
                  <rect x={colOffset+45} y={topPartOffset + ((orbitalDummyEvents[i].start-orbitalDummyEvents[0].start)/10000)} width = {15} height = {orbitalDummyEvents[i].duration/60000} fill = {"#f00"} />
                  <Text x={0} y={topPartOffset+10+(orbitalDummyEvents[i].start-orbitalDummyEvents[0].start)/10000} fontSize={12} verticalAnchor="end" fill={'#f0f'}>
                    {orbitalDummyEvents[i].name}
                  </Text>
                  <Text x={colOffsetEnd + 5} y={topPartOffset+12+(orbitalDummyEvents[i].start-orbitalDummyEvents[0].start)/10000} fontSize={12} verticalAnchor="end" fill={'#fff'}>
                    {(orbitalDummyEvents[i].start-orbitalDummyEvents[0].start)/60000}
                  </Text>
                  {/* <Text x={colOffsetEnd + 120} y={topPartOffset+12} fontSize={12} verticalAnchor="end" fill={'#ff0'}>
                  {dummyEvents[i].start-dummyEvents[0].start}
                  </Text> */}
                </Group>
              ))
            }
          </Group>
           {/* Example spacecraft events*/}
           <Group>
            {/* Event Rectangle*/}
            {spacecraftDummyEvents.map((v, i) => (
                <Group>
                  <rect x={colOffset+45} y={topPartOffset + ((spacecraftDummyEvents[i].start-spacecraftDummyEvents[0].start)/10000)} width = {15} height = {spacecraftDummyEvents[i].duration/60000} fill = {"#f00"} />
                  <Text x={colOffsetEnd + 5} y={topPartOffset+12+(spacecraftDummyEvents[i].start-spacecraftDummyEvents[0].start)/10000} fontSize={12} verticalAnchor="end" fill={'#fff'}>
                    {(spacecraftDummyEvents[i].start-spacecraftDummyEvents[0].start)/60000}
                  </Text>
                  <Text x={colOffsetEnd + 50} y={topPartOffset+12+(spacecraftDummyEvents[i].start-spacecraftDummyEvents[0].start)/10000} fontSize={12} verticalAnchor="end" fill={'#0f0'}>
                  {spacecraftDummyEvents[i].name}
                  </Text>
                  {/* <Text x={colOffsetEnd + 120} y={topPartOffset+12} fontSize={12} verticalAnchor="end" fill={'#ff0'}>
                  {dummyEvents[i].start-dummyEvents[0].start}
                  </Text> */}
                </Group>
              ))
            }
            {/* Timeline Bar */}
            <motion.rect
            initial={{ y: topPartOffset }}
            style={{
              x: 0,
              y: barPosition,
              fill: "#00ff00",
              opacity: 100,
              width: width,
              height: 5,
              borderRadius: "5%",
              background: "#00ff00"
            }}
          />
          </Group>
      </svg>
    </div>
  );
};
