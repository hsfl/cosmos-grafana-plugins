import React, { useCallback, useEffect, useState } from 'react';
import { Group } from '@visx/group';
import { Line } from '@visx/shape';
import { Text } from '@visx/text';
import { useCosmosTimeline, useDomUpdate } from '../helpers/hooks';
import { TimeEvent } from '../types';
import { EventBus, PanelData, TimeRange } from '@grafana/data';
import { animate, motion, useMotionValue } from 'framer-motion';

interface UTCEvent {
  utcStart: string;
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
  //const scrollPercentage = useRef<number>(0);
  const [tickVals, setTickVals] = useState<number[]>([]);
  //const [lineHeight, setLineHeight] = useState<number>()

  const utcData: UTCEvent[] = data.series[0].fields[0].values.toArray().map((v, i) => ({
    utcStart: new Date(data.series[0].fields[0].values.get(i)).toUTCString().slice(4, -4),
  }));
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
          animate(barPosition, topPartOffset + ((event.payload.time / 1000 - timeRange.from.unix()) / 60) * pixPerMin, {
            type: 'tween',
          });
          if (barPosition.get() > height / 2) {
            divElement.scrollTo({
              top:
                topPartOffset + ((event.payload.time / 1000 - timeRange.from.unix()) / 60) * pixPerMin - 5 * pixPerMin,
              behavior: 'smooth',
            });
            //scrollPercentage.current += (topPartOffset+((event.payload.time/1000-timeRange.from.unix())/60)*pixPerMin);
          }
        }
      });
    },
    [divElement, height, barPosition, pixPerMin, timeRange.from, topPartOffset]
  );
  useCosmosTimeline(eventBus, updateScrollBar);

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
            <Text x={colOffsetEnd + 130} y={topPartOffset} fontSize={12} verticalAnchor="end" fill={'#ff0'}>
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
          {data.series[0].fields[0].values.toArray().reduce((a, v, i) => {
            if (data.series[0].fields[0].values.get(i) - startTime < 0) {
              return a;
            } else if (data.series[0].fields[3].values.get(i) === 2) {
              return a;
            }
            a.push(
              <Group key={`orbital-event-${i}`}>
                <rect
                  x={colOffset + 15 * data.series[0].fields[3].values.get(i)}
                  y={topPartOffset + ((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  width={15}
                  height={(data.series[0].fields[2].values.get(i) / 60) * tickHeight}
                  fill={'#f0f'}
                  fillOpacity={0.7}
                  strokeWidth={1}
                  stroke={'#fff'}
                />
                <Text
                  x={0}
                  y={topPartOffset + ((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  fontSize={12}
                  verticalAnchor="end"
                  fill={'#f0f'}
                >
                  {data.series[0].fields[4].values.get(i)}
                </Text>
                <Text
                  x={colOffsetEnd + 5}
                  y={topPartOffset + ((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  fontSize={12}
                  verticalAnchor="end"
                  fill={'#fff'}
                >
                  {utcData[i].utcStart}
                </Text>
              </Group>
            );
            return a;
          }, [])}
        </Group>
        {/* Example spacecraft events*/}
        <Group>
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
                  y={topPartOffset + ((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  width={15}
                  height={(data.series[0].fields[2].values.get(i) / 60) * tickHeight}
                  fill={'#0df'}
                  fillOpacity={0.7}
                  strokeWidth={1}
                  stroke={'#fff'}
                />
                <Text
                  x={colOffsetEnd + 130}
                  y={topPartOffset + ((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  fontSize={12}
                  verticalAnchor="end"
                  fill={'#0df'}
                >
                  {data.series[0].fields[4].values.get(i)}
                </Text>
                <Text
                  x={colOffsetEnd + 5}
                  y={topPartOffset + ((data.series[0].fields[0].values.get(i) - startTime) / 60000) * tickHeight}
                  fontSize={12}
                  verticalAnchor="end"
                  fill={'#fff'}
                >
                  {utcData[i].utcStart}
                </Text>
              </Group>
            );
            return a;
          }, [])}
          {/* Timeline Bar */}
          <motion.rect
            //initial={{ y: topPartOffset }}
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
