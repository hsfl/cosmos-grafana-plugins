import { useCallback, useEffect, useRef } from 'react';
import { EventBus } from '@grafana/data';
import { TimeEvent, TimeEventCallback } from '../types';

// Hook to listen to eventBus for cosmos timeevents, running animation callback when event fires
export const useCosmosTimeline = (eventBus: EventBus, callback: TimeEventCallback) => {
  // ---------------------------------------------------
  // Imperative animation controller
  // Unix seconds timestamp that denotes current time, obtained from cosmos-timeline event publisher
  useEffect(() => {
    const subscriber = eventBus.getStream(TimeEvent).subscribe((event) => {
      if (event.payload.time !== undefined) {
        callback(event);
      }
    });
    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus, callback]);
};

// ---------------------------------------------------
type DomUpdateReturn = [
  regTimeTickGroup: React.MutableRefObject<SVGElement | null>,
  callback: (event: TimeEvent) => void
];
// Imperative animation manager
export const useDomUpdate = (): DomUpdateReturn => {
  //const refId = useRef<number>(0);
  //const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
  const refTimeTickGroup = useRef<SVGElement | null>(null);

  useEffect(() => {
    // Clean up renderer on unmount
    return () => {};
  }, []);

  // ---------------------------------------------------
  // Imperative animation update call
  const updateDOMRefs = useCallback((event: TimeEvent) => {
    // Update threejs model rotation
    requestAnimationFrame(() => {
      if (refTimeTickGroup.current !== undefined) {
        // console.log('reftimetickgroup', refTimeTickGroup.current.top);
      }
    });
  }, []);

  return [refTimeTickGroup, updateDOMRefs];
};
