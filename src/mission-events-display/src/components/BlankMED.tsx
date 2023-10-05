import React, { useCallback, useState } from 'react';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { Text } from '@visx/text';
import { useDomUpdate } from '../helpers/hooks';
import { motion } from 'framer-motion';

//const tickHeight = 30;

export const BlankMissionEventsDisplay = (props: { width: number; height: number }) => {
  const { width, height } = props;
  const columns = ['Umbra', 'kauai', 'surrey', 'payload1', 'child1'];
  const colOffset = width / 5;
  const colOffsetEnd = colOffset + 15 * columns.length;
  const topPartOffset = 10 + 10 * columns.reduce((max, current) => Math.max(max, current.length), 0);
  const [refTimeTickGroup] = useDomUpdate();
  // let's assume a scale of 1 means that each tick represents 1 minute
  const [graphHeight] = useState<number>(height);
  const [, setDivElement] = useState<HTMLDivElement>();
  const [tickVals] = useState<number[]>([]);

  //making data more readable

  // const startTime = timeRange.from.unix() * 1000;
  // const timeSpan = timeRange.to.unix() * 1000 - timeRange.from.unix() * 1000;
  // // Update various parameters of the graph: height, ticks, etc.
  // useEffect(() => {
  //   const newGraphHeight = tickHeight * (timeSpan / (60000 * scale));
  //   setGraphHeight(newGraphHeight);
  //   setTickVals(() => {
  //     const ret: number[] = [];
  //     for (let i = 0; i < newGraphHeight; i += tickHeight) {
  //       ret.push(i);
  //     }
  //     return ret;
  //   });
  // }, [timeSpan, height, scale]);

  // const pixPerMin = tickHeight / scale;

  // //Updates scrollbar and display position
  // const barPosition = useMotionValue(topPartOffset);
  // const updateScrollBar = useCallback(
  //   (event: TimeEvent) => {
  //     requestAnimationFrame(() => {
  //       if (divElement && event.payload.time !== undefined) {
  //         animate(barPosition, ((event.payload.time / 1000 - timeRange.from.unix()) / 60) * pixPerMin, {
  //           type: 'tween',
  //         });
  //         if (barPosition.get() > height / 2) {
  //           divElement.scrollTo({
  //             top: ((event.payload.time / 1000 - timeRange.from.unix()) / 60) * pixPerMin - 5 * pixPerMin,
  //             behavior: 'smooth',
  //           });
  //         }
  //       }
  //     });
  //   },
  //   [divElement, height, barPosition, pixPerMin, timeRange.from]
  // );
  // useCosmosTimeline(eventBus, updateScrollBar);

  // //Updates elapsed and current time
  // const incrementElapsedTime = useCallback(
  //   (event: TimeEvent) => {
  //     if (event.payload.time !== undefined) {
  //       const presentTime = event.payload.time / 1000;
  //       const timeFrom = timeRange.from.unix();
  //       const newElapsedTimeInMinutes = (presentTime - timeFrom) / 60;
  //       setElapsedTime(newElapsedTimeInMinutes * 60000);
  //       setCurrentTime(startTime + newElapsedTimeInMinutes * 60000);
  //     }
  //   },
  //   [timeRange.from, startTime]
  // );
  // useCosmosTimeline(eventBus, incrementElapsedTime);

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

  // function getEventName(eventCode: number): string | undefined {
  //   const event = Events.find((event) => event.eventCode === eventCode);
  //   return event?.eventName;
  // }
  // function getEventType(eventCode: number): number | undefined {
  //   const event = Events.find((event) => event.eventCode === eventCode);
  //   return event?.eventType;
  // }
  // function getEventObj(eventCode: number): number | undefined {
  //   const event = Events.find((event) => event.eventCode === eventCode);
  //   return event?.eventObj;
  // }

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
      </svg>
    </div>
  );
};
