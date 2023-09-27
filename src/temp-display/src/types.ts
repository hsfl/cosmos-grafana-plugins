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

export class TimeEvent extends BusEventWithPayload<Partial<TimeEventPayload>> {
  static type = 'COSMOS-TimeEvent';
}

export interface RectWithTextProps {
  /** Temperature in K */
  temperature: number;
  /** Width of one little bar gauge */
  width: number;
  /** Height of one little bar gauge */
  height: number;
  /** Ref to the inner SVG element */
  device: string;
}

export type RectWithTextHandle = {
  rect: SVGRectElement | null;
  text: SVGTextElement | null;
};
