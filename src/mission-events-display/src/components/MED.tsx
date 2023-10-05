import React, { useCallback, useEffect, useState } from 'react';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { Text } from '@visx/text';
import { useCosmosTimeline, useDomUpdate } from '../helpers/hooks';
import { UTCEvent, TimeEvent, Events } from '../types';
import { EventBus, PanelData, TimeRange } from '@grafana/data';
import { animate, motion, useMotionValue } from 'framer-motion';

const tickHeight = 30;

export const MissionEventsDisplay = (props: {
  data: PanelData;
  width: number;
  height: number;
  eventBus: EventBus;
  timeRange: TimeRange;
}) => {
  const { data, width, height, eventBus, timeRange } = props;
  const columns = ['Umbra', 'kauai', 'surrey', 'payload1', 'child1'];
  const colOffset = width / 5;
  const colOffsetEnd = colOffset + 15 * columns.length;
  const topPartOffset = 10 + 10 * columns.reduce((max, current) => Math.max(max, current.length), 0);
  const [refTimeTickGroup] = useDomUpdate();
  // let's assume a scale of 1 means that each tick represents 1 minute
  const [scale /*, setScale */] = useState<number>(1);
  const [graphHeight, setGraphHeight] = useState<number>(height);
  const [divElement, setDivElement] = useState<HTMLDivElement>();
  const [, setElapsedTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(timeRange.from.unix() * 1000);
  const [tickVals, setTickVals] = useState<number[]>([]);

  //making data more readable
  const utcData: UTCEvent[] = [];
  const eventTimes = data.series[0].fields[0].values.toArray();
  //const nodeNames = data.series[0].fields[1].values.toArray();
  const durations = data.series[0].fields[2].values.toArray();
  //const eventIDs = data.series[0].fields[3].values.toArray();
  const eventTypes = data.series[0].fields[4].values.toArray();
  const eventNames = data.series[0].fields[5].values.toArray();
  console.log(eventNames);

  eventTimes.map((v, i) => {
    const utcStart = new Date(eventTimes[i]);
    const localStart = new Date(utcStart.getTime() - 10 * 60 * 60 * 1000);

    utcData.push({
      utcStart: utcStart.toUTCString().slice(4, -4),
      localStart: localStart.toUTCString().slice(4, -4),
    });
  });

  const startTime = timeRange.from.unix() * 1000;
  const timeSpan = timeRange.to.unix() * 1000 - timeRange.from.unix() * 1000;
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

  //Updates elapsed and current time
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

  //Updates strings for countdown timer
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
  if (height < 80) {
    return null;
  }

  function getEventName(eventCode: number): string | undefined {
    const event = Events.find((event) => event.eventCode === eventCode);
    return event?.eventName;
  }
  function getEventType(eventCode: number): number | undefined {
    const event = Events.find((event) => event.eventCode === eventCode);
    return event?.eventType;
  }
  function getEventObj(eventCode: number): number | undefined {
    const event = Events.find((event) => event.eventCode === eventCode);
    return event?.eventObj;
  }

  const orbitalEventStrings: string[] = [];
  const spacecraftEventStrings: string[] = [];
  const eventColors: string[] = [];
  for (let i = 0; i < eventTypes.length; i++) {
    if (getEventType(eventTypes[i]) === 0) {
      orbitalEventStrings.push(`${getEventName(eventTypes[i])}`);
      if (getEventObj(eventTypes[i]) === 0) {
        eventColors.push('#f00');
      } else {
        eventColors.push('#ff0');
      }
    } else {
      spacecraftEventStrings.push(`${getEventName(eventTypes[i])}`);
      //eventColors.push('#0df');
    }
  }
  console.log('event type ', eventTypes);
  console.log('orbital ', orbitalEventStrings);
  console.log('spacecraft ', spacecraftEventStrings);
  console.log('color if orbital ', eventColors);
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
              <Text x={0} y={topPartOffset - 5} fontSize={10} verticalAnchor="end" fill={'#f0f'}>
                Orbital Events
              </Text>
              <Text x={colOffsetEnd + 5} y={topPartOffset - 5} fontSize={10} verticalAnchor="end" fill={'#fff'}>
                UTC
              </Text>
              <Text x={colOffsetEnd + 55} y={topPartOffset - 5} fontSize={10} verticalAnchor="end" fill={'#0df'}>
                Spacecraft Events
              </Text>
              <Text x={colOffsetEnd + 160} y={topPartOffset - 5} fontSize={10} verticalAnchor="end" fill={'#fff'}>
                Countdown
              </Text>
              {/* <Text x={colOffsetEnd + 120} y={topPartOffset} fontSize={10} verticalAnchor="end" fill={'#ff0'}>
              Executed
            </Text> */}
            </Group>
            {/* white horizontal line */}
            <Line from={{ x: 0, y: topPartOffset }} to={{ x: width - 10, y: topPartOffset }} stroke={'#ffffff'} />
            {/* columns */}
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
      <svg width={width - 10} height={graphHeight}>
        <rect width={width - 10} height={graphHeight} fill={'#000'} rx={14} />
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
          {eventTimes.reduce((a, v, i) => {
            if (eventTimes[i] - startTime < 0) {
              return a;
            } else if (getEventType(eventTypes[i]) !== 0) {
              return a;
            }
            {
              {
                /* Orbital Events Rectangle */
              }
            }
            a.push(
              <Group key={`orbital-event-${i}`}>
                <rect
                  x={colOffset + 15 * (getEventObj(eventTypes[i]) || 4)}
                  y={((eventTimes[i] - startTime) / 60000) * tickHeight}
                  width={15}
                  height={((durations[i] * 86400) / 60) * tickHeight}
                  fill={eventColors[i]}
                  fillOpacity={0.5}
                  strokeWidth={1}
                  stroke={'#fff'}
                />
                {/* Orbital Events Text */}
                <Text
                  x={0}
                  y={((eventTimes[i] - startTime) / 60000) * tickHeight}
                  fontSize={10}
                  verticalAnchor="end"
                  fill={'#f0f'}
                >
                  {orbitalEventStrings[i]}
                </Text>
                {/* UTC Time */}
                <Text
                  x={colOffsetEnd + 5}
                  y={((eventTimes[i] - startTime) / 60000) * tickHeight}
                  fontSize={10}
                  verticalAnchor="end"
                  fill={'#fff'}
                >
                  {utcData[i].utcStart.toString().slice(12)}
                </Text>
                {/* Countdown Timer */}
                <Text
                  x={colOffsetEnd + 160}
                  y={((eventTimes[i] - startTime) / 60000) * tickHeight}
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
          {eventTimes.reduce((a, v, i) => {
            if (eventTimes[i] - startTime < 0) {
              return a;
            } else if (getEventType(eventTypes[i]) !== 1) {
              return a;
            }
            a.push(
              <Group key={`spacecraft-event-${i}`}>
                <rect
                  x={colOffset + 15 * (getEventObj(eventTypes[i]) || 0)}
                  y={((eventTimes[i] - startTime) / 60000) * tickHeight}
                  width={15}
                  height={((durations[i] * 86400) / 60) * tickHeight}
                  fill={'#00f'}
                  fillOpacity={0.5}
                  strokeWidth={1}
                  stroke={'#fff'}
                />
                <Text
                  x={colOffsetEnd + 55}
                  y={((eventTimes[i] - startTime) / 60000) * tickHeight}
                  fontSize={10}
                  verticalAnchor="end"
                  fill={'#00f'}
                >
                  {spacecraftEventStrings[i]}
                </Text>
                <Text
                  x={colOffsetEnd + 5}
                  y={((eventTimes[i] - startTime) / 60000) * tickHeight}
                  fontSize={10}
                  verticalAnchor="end"
                  fill={'#fff'}
                >
                  {utcData[i].utcStart.toString().slice(12)}
                </Text>
                {/* Countdown Timer */}
                <Text
                  x={colOffsetEnd + 160}
                  y={((eventTimes[i] - startTime) / 60000) * tickHeight}
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
        <Group top={topPartOffset} left={0}>
          {/* Timeline Bar */}
          <motion.rect
            initial={{ y: 0 }}
            style={{
              x: 0,
              y: barPosition,
              fill: '#00ff00',
              opacity: 100,
              width: width - 11,
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
