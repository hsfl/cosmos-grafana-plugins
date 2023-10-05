import { BusEventWithPayload } from '@grafana/data';

type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}

export interface TimeEventPayload {
  // The starting time, positive unix timestamp
  time?: number;
  // Time progression rate, in seconds. Event fires sparsely
  rate?: number;
}

export interface UTCEvent {
  utcStart: string;
  localStart: string;
}
export interface Event {
  eventCode: number;
  eventName: string;
  eventType: number;
  eventObj: number; //maybe user defines columns ahead of time? Need to work on this
}

export class TimeEvent extends BusEventWithPayload<Partial<TimeEventPayload>> {
  static type = 'COSMOS-TimeEvent';
}

export type TimeEventCallback = (event: TimeEvent) => void;

export const Events: Event[] = [
  { eventCode: 4096, eventName: 'PHYSICAL', eventType: 0, eventObj: 0 },
  { eventCode: 4353, eventName: 'LATA', eventType: 0, eventObj: 4 },
  { eventCode: 4354, eventName: 'LATD', eventType: 0, eventObj: 4 },
  { eventCode: 4368, eventName: 'LATMAX', eventType: 0, eventObj: 4 },
  { eventCode: 4384, eventName: 'LATMIN', eventType: 0, eventObj: 4 },
  { eventCode: 4609, eventName: 'APOGEE', eventType: 0, eventObj: 4 },
  { eventCode: 4610, eventName: 'PERIGEE', eventType: 0, eventObj: 4 },
  { eventCode: 4614, eventName: 'UMBRA', eventType: 0, eventObj: 0 },
  { eventCode: 4616, eventName: 'PENUMBRA', eventType: 0, eventObj: 0 },
  { eventCode: 5120, eventName: 'GS', eventType: 1, eventObj: 2 },
  { eventCode: 5121, eventName: 'GS5', eventType: 1, eventObj: 2 },
  { eventCode: 5122, eventName: 'GS10', eventType: 1, eventObj: 2 },
  { eventCode: 5124, eventName: 'GSMAX', eventType: 1, eventObj: 2 },
  { eventCode: 6144, eventName: 'TARG', eventType: 1, eventObj: 4 },
  { eventCode: 6145, eventName: 'TARGMIN', eventType: 1, eventObj: 4 },
  { eventCode: 6160, eventName: 'TARG_OBSRV', eventType: 1, eventObj: 4 },
  { eventCode: 8192, eventName: 'COMMAND', eventType: 1, eventObj: 4 },
  { eventCode: 8448, eventName: 'BUS', eventType: 1, eventObj: 4 },
  { eventCode: 8464, eventName: 'EPS', eventType: 1, eventObj: 4 },
  { eventCode: 8480, eventName: 'ADCS', eventType: 1, eventObj: 4 },
  { eventCode: 9216, eventName: 'PAYLOAD', eventType: 1, eventObj: 4 },
  { eventCode: 10240, eventName: 'SYSTEM', eventType: 1, eventObj: 4 },
  { eventCode: 16384, eventName: 'LOG', eventType: 1, eventObj: 4 },
  { eventCode: 32768, eventName: 'MESSAGE', eventType: 1, eventObj: 4 },
];
