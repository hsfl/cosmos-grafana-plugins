import { BusEventWithPayload, PanelData } from '@grafana/data';

type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}

//
export type RefDict = { [key in adcs_field]?: HTMLInputElement | null };

export type adcs_field =
  | 'YAW'
  | 'VYAW'
  | 'AYAW'
  | 'PITCH'
  | 'VPITCH'
  | 'APITCH'
  | 'ROLL'
  | 'VROLL'
  | 'AROLL'
  | 'TIME'
  | 'NODE'
  | 'PLTIME';

export interface TimeEventPayload {
  // The starting time, positive unix timestamp
  time?: number;
  // Time progression rate, in seconds. Event fires sparsely
  rate?: number;
}

export class TimeEvent extends BusEventWithPayload<Partial<TimeEventPayload>> {
  static type = 'COSMOS-TimeEvent';
}

export type TimeEventCallback = (data: PanelData, event: TimeEvent) => void;
