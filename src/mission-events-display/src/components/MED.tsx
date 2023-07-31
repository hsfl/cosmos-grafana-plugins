import React, { useCallback, useEffect, useState } from 'react';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { Text } from '@visx/text';
import { useCosmosTimeline, useDomUpdate } from '../helpers/hooks';
import { TimeEvent } from '../types';
import { EventBus, PanelData, TimeRange } from '@grafana/data';
import { animate, motion, useMotionValue } from 'framer-motion';
//import moment from 'moment-timezone';

interface UTCEvent {
  utcStart: string;
  localStart: string;
}

const tickHeight = 30;

export const MissionEventsDisplay = (props: {
  data: PanelData;
  width: number;
  height: number;
  eventBus: EventBus;
  timeRange: TimeRange;
}) => {
  const { data, width, height, eventBus, timeRange } = props;
  const columns = ['Umbra', 'kauai', 'surrey', 'payload1', 'payload2'];
  const colOffset = width / 4;
  const colOffsetEnd = colOffset + 15 * columns.length;
  const topPartOffset = height / 6;
  const [refTimeTickGroup] = useDomUpdate();
  // let's assume a scale of 1 means that each tick represents 1 minute
  const [scale /*, setScale */] = useState<number>(1);
  const [graphHeight, setGraphHeight] = useState<number>(height);
  const [divElement, setDivElement] = useState<HTMLDivElement>();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(timeRange.from.unix() * 1000);
  //const scrollPercentage = useRef<number>(0);
  const [tickVals, setTickVals] = useState<number[]>([]);
  //const [lineHeight, setLineHeight] = useState<number>()

  const utcData: UTCEvent[] = [];
  const dataArray = data.series[0].fields[0].values.toArray();

  dataArray.map((v, i) => {
    const utcStart = new Date(dataArray[i]);
    const localStart = new Date(utcStart.getTime() - 10 * 60 * 60 * 1000);

    utcData.push({
      utcStart: utcStart.toUTCString().slice(4, -4),
      localStart: localStart.toUTCString().slice(4, -4),
    });
  });
  function unixToDateTime(unixTimestamp: number): Date {
    return new Date(unixTimestamp);
  }
  const startTime = timeRange.from.unix() * 1000;
  const timeSpan = timeRange.to.unix() * 1000 - timeRange.from.unix() * 1000;
  console.log(unixToDateTime(startTime));
  // Update various parameters of the graph: height, ticks, etc.
  useEffect(() => {
    const newGraphHeight = tickHeight * (timeSpan / (60000 * scale));
    setGraphHeight(newGraphHeight);
    setTickVals(() => {
      const ret: number[] = [];
      for (let i = 0; i < newGraphHeight; i += tickHeight) {
        ret.push(i);
      }
      return ret;
    });
  }, [timeSpan, height, scale]);

  const pixPerMin = tickHeight / scale;

  //Updates scrollbar and display position
  const barPosition = useMotionValue(topPartOffset);
  const updateScrollBar = useCallback(
    (event: TimeEvent) => {
      requestAnimationFrame(() => {
        if (divElement && event.payload.time !== undefined) {
          animate(barPosition, ((event.payload.time / 1000 - timeRange.from.unix()) / 60) * pixPerMin, {
            type: 'tween',
          });
          if (barPosition.get() > height / 2) {
            divElement.scrollTo({
              top: ((event.payload.time / 1000 - timeRange.from.unix()) / 60) * pixPerMin - 5 * pixPerMin,
              behavior: 'smooth',
            });
          }
        }
      });
    },
    [divElement, height, barPosition, pixPerMin, timeRange.from]
  );
  useCosmosTimeline(eventBus, updateScrollBar);

  const incrementElapsedTime = useCallback(
    (event: TimeEvent) => {
      if (event.payload.time !== undefined) {
        const presentTime = event.payload.time / 1000;
        const timeFrom = timeRange.from.unix();
        const newElapsedTimeInMinutes = (presentTime - timeFrom) / 60;
        setElapsedTime(newElapsedTimeInMinutes * 60000);
        setCurrentTime(startTime + newElapsedTimeInMinutes * 60000);
      }
    },
    [timeRange.from, startTime]
  );
  useCosmosTimeline(eventBus, incrementElapsedTime);
  console.log(unixToDateTime(currentTime), elapsedTime);

  const countdownStrings: string[] = [];
  for (let i = 0; i < utcData.length; i++) {
    if (Date.parse(utcData[i].localStart) - currentTime >= 0) {
      const currentString = `${Math.floor((Date.parse(utcData[i].localStart) - currentTime) / (1000 * 60 * 60))
        .toString()
        .padStart(2, '0')}:${Math.floor(((Date.parse(utcData[i].localStart) - currentTime) / (1000 * 60)) % 60)
        .toString()
        .padStart(2, '0')}:${Math.floor(((Date.parse(utcData[i].localStart) - currentTime) / 1000) % 60)
        .toString()
        .padStart(2, '0')}`;
      countdownStrings.push(`- ${currentString}`);
    } else {
      const currentString = `${Math.floor(Math.abs(Date.parse(utcData[i].localStart) - currentTime) / (1000 * 60 * 60))
        .toString()
        .padStart(2, '0')}:${Math.floor((Math.abs(Date.parse(utcData[i].localStart) - currentTime) / (1000 * 60)) % 60)
        .toString()
        .padStart(2, '0')}:${Math.floor((Math.abs(Date.parse(utcData[i].localStart) - currentTime) / 1000) % 60)
        .toString()
        .padStart(2, '0')}`;
      countdownStrings.push(`+ ${currentString}`);
    }
  }
  // Callback for div reference acquisition
  const refDiv = useCallback((ref: HTMLDivElement | null) => {
    if (ref !== null) {
      setDivElement(ref);
    }
  }, []);

  // Don't attempt to display anything if view is too small
  if (width < 80) {
    return null;
  }

  return (
    <div ref={refDiv} style={{ width: width, height: height, overflow: 'scroll' }}>
      <div ref={refDiv} style={{ width: width, height: topPartOffset, position: 'fixed' }}>
        <svg width={width} height={topPartOffset}>
          <Group top={0} left={0}>
            {/* Header Background */}
            <motion.rect
              style={{
                x: 0,
                y: 0,
                fill: '#000000',
                opacity: 50,
                width: width - 10,
                height: topPartOffset,
                position: 'fixed',
                borderRadius: '5%',
                background: '#000000',
              }}
            />
            {/* Header Labels */}
            <Group>
              <Text x={0} y={topPartOffset} fontSize={10} verticalAnchor="end" fill={'#03fcf0'}>
                Orbital Events
              </Text>
              <Text x={colOffsetEnd + 5} y={topPartOffset} fontSize={10} verticalAnchor="end" fill={'#fff'}>
                UTC
              </Text>
              <Text x={colOffsetEnd + 75} y={topPartOffset} fontSize={10} verticalAnchor="end" fill={'#ff0'}>
                Spacecraft Events
              </Text>
              <Text x={colOffsetEnd + 200} y={topPartOffset} fontSize={10} verticalAnchor="end" fill={'#fff'}>
                Countdown Timer
              </Text>
              {/* <Text x={colOffsetEnd + 120} y={topPartOffset} fontSize={10} verticalAnchor="end" fill={'#ff0'}>
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
          </Group>
        </svg>
      </div>
      <svg width={width} height={graphHeight}>
        <rect width={width} height={graphHeight} fill={'#000'} rx={14} />
        <Group top={topPartOffset} left={0}>
          {/* columns*/}
          <Line from={{ x: colOffset, y: 0 }} to={{ x: colOffset, y: graphHeight }} stroke={'#ffff00'} />
          {columns.map((val, i) => (
            <Group key={`radar-line-${i}`}>
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
                from={{ x: colOffset, y: 0 + val }}
                to={{ x: colOffsetEnd, y: 0 + val }}
                stroke={'#ffff00'}
              />
            ))}
          </Group>
          {/* Horizontal time tracker line */}
          {/* <Line from={{ x: 0, y: topPartOffset + scrollPercentage.current }} to={{ x: width, y: topPartOffset + scrollPercentage.current }} stroke={'#0f0'} /> */}
        </Group>
        {/* Example orbital events*/}
        <Group top={topPartOffset} left={0}>
          {/* Event Rectangle*/}
          {data.series[0].fields[0].values.toArray().reduce((a, v, i) => {
            if (data.series[0].fields[0].values.get(i) - startTime < 0) {
              return a;
            } else if (data.series[0].fields[3].values.get(i) === 2) {
              return a;
            }
            {
              /* Orbital Events Rectangle */
            }
            a.push(
              <Group key={`orbital-event-${i}`}>
                <rect
                  x={colOffset + 15 * data.series[0].fields[3].values.get(i)}
                  y={((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  width={15}
                  height={((data.series[0].fields[2].values.get(i) * 86400) / 60) * tickHeight}
                  fill={'#f0f'}
                  fillOpacity={0.7}
                  strokeWidth={1}
                  stroke={'#fff'}
                />
                {/* Orbital Events Text */}
                <Text
                  x={0}
                  y={((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  fontSize={10}
                  verticalAnchor="end"
                  fill={'#f0f'}
                >
                  {data.series[0].fields[4].values.get(i)}
                </Text>
                {/* UTC Time */}
                <Text
                  x={colOffsetEnd + 5}
                  y={((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  fontSize={10}
                  verticalAnchor="end"
                  fill={'#fff'}
                >
                  {utcData[i].utcStart.toString().slice(12)}
                </Text>
                {/* Countdown Timer (Work in Progress) */}
                <Text
                  x={colOffsetEnd + 200}
                  y={((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  fontSize={10}
                  verticalAnchor="end"
                  fill={'#fff'}
                >
                  {countdownStrings[i]}
                </Text>
              </Group>
            );
            return a;
          }, [])}
        </Group>
        {/* Example spacecraft events*/}
        <Group top={topPartOffset} left={0}>
          {/* Event Rectangle*/}
          {data.series[0].fields[0].values.toArray().reduce((a, v, i) => {
            if (data.series[0].fields[0].values.get(i) - startTime < 0) {
              return a;
            } else if (data.series[0].fields[3].values.get(i) !== 2) {
              return a;
            }
            a.push(
              <Group key={`orbital-event-${i}`}>
                <rect
                  x={colOffset + 15 * data.series[0].fields[3].values.get(i)}
                  y={((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  width={15}
                  height={((data.series[0].fields[2].values.get(i) * 86400) / 60) * tickHeight}
                  fill={'#0df'}
                  fillOpacity={0.7}
                  strokeWidth={1}
                  stroke={'#fff'}
                />
                <Text
                  x={colOffsetEnd + 75}
                  y={((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  fontSize={10}
                  verticalAnchor="end"
                  fill={'#0df'}
                >
                  {data.series[0].fields[4].values.get(i)}
                </Text>
                <Text
                  x={colOffsetEnd + 5}
                  y={((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  fontSize={10}
                  verticalAnchor="end"
                  fill={'#fff'}
                >
                  {utcData[i].utcStart.toString().slice(12)}
                </Text>
              </Group>
            );
            return a;
          }, [])}
        </Group>
        <Group top={topPartOffset} left={0}>
          {/* Timeline Bar */}
          <motion.rect
            initial={{ y: 0 }}
            style={{
              x: 0,
              y: barPosition,
              fill: '#00ff00',
              opacity: 100,
              width: width,
              height: 5,
              borderRadius: '5%',
              background: '#00ff00',
            }}
          />
        </Group>
      </svg>
    </div>
  );
};
