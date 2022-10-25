
import { BusEventWithPayload } from '@grafana/data';

type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}

export interface TimeEventPayload {
  // The starting time, positive unix timestamp
  time?: number,
  // Time progression rate, in seconds. Event fires sparsely
  rate?: number,
}

export class TimeEvent extends BusEventWithPayload<Partial<TimeEventPayload>> {
  static type = 'COSMOS-TimeEvent';
}
