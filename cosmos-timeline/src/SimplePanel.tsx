import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { Button } from '@grafana/ui';
import { SimpleOptions, TimeEvent, TimeEventPayload } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, eventBus, timeRange }) => {
  // Playback state, if it is paused or not
  const [paused, setPaused] = useState<boolean>(true);
  // When the timeRange changes, will snap to the closer of start or end
  // of timeRange if currently outside of it
  const [boundedTime, setBoundedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  // For animating timeline
  const refCurrentTime = useRef<number>(0);
  const refTimeRate = useRef<number>(60);

  // Time event publisher
  const publishNewTime = useCallback((payload: TimeEventPayload)=>{
    if (payload.time !== undefined) {
      refCurrentTime.current = payload.time;
    }
    eventBus.publish(new TimeEvent(payload));
  }, [eventBus]);

  useEffect(() => {
    // Keep boundedTime within bounds of time range
    // .unix() returns unix seconds, convert to unix milliseconds
    const rangeStart = timeRange.from.unix() * 1000;
    const rangeEnd = timeRange.to.unix() * 1000;
    setBoundedTime((boundedTime)=> boundedTime > rangeStart ? boundedTime : rangeStart);
    setBoundedTime((boundedTime)=> boundedTime < rangeEnd ? boundedTime : rangeEnd);
    setStartTime(rangeStart);
    setEndTime(rangeEnd);
  }, [timeRange]);

  useEffect(() => {
    if (refCurrentTime.current !== boundedTime) {
      // publish new time bound start time
      publishNewTime({time: boundedTime});
    }
  }, [boundedTime, publishNewTime]);

  useEffect(() => {
    // No interval if paused
    if (paused) {
      publishNewTime({time: refCurrentTime.current});
      return;
    }
    // If we are playing, create a new interval with proper refresh speed
    const interval = setInterval(() => {
      // Just publish new time every second for now
      publishNewTime({time: refCurrentTime.current});

      // Use unix millisecond timestamps
      const newTime = refCurrentTime.current + 1000 * refTimeRate.current;
      if (newTime > endTime) {
        setPaused(true);
      } else {
        refCurrentTime.current = newTime;
      }
    }, 1000, [endTime]);

    return () => {
      // Clear interval reference
      clearInterval(interval);
    }
  }, [paused, endTime, publishNewTime]);

  return (
    <div className='mytestclass'>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
        <Button
          size={'md'}
          variant={'secondary'}
          fill={'outline'}
          icon={'step-backward'}
          // Rewind to beginning of timeRange
          onClick={() => {
            publishNewTime({time: startTime, rate: 0});
            setPaused(true);
          }}
        />
        <Button
          size={'md'}
          variant={'secondary'}
          fill={'outline'}
          icon={paused ? 'play' : 'pause'}
          onClick={() => {
            // If paused, unpause
            publishNewTime(paused ? {rate: refTimeRate.current} : {rate: 0});
            setPaused((paused) => !paused);
          }}
        />
      </div>
    </div>
  );
};
