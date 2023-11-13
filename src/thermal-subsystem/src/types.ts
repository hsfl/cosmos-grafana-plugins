import { BusEventWithPayload, PanelData } from '@grafana/data';

type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}

export type IdxDict = { [key in input_types]?: number };


export type input_types = 'bcreg' | 'tsen';

export type RefBcreg = { [key in bcreg_field]?: HTMLInputElement | null };
export type bcreg_field = 'bcreg_name' | 'temp';

export type RefTsen = { [key in tsen_field]?: HTMLInputElement | null };
export type tsen_field = 'tsen_name' | 'temp';


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

export interface TimeValuesArray {
  buffer: number[];
}
