import { BusEventWithPayload, EventBus, PanelData } from '@grafana/data';

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

export enum BarOrientation {
  vertical,
  horizontal,
}

export interface BarGaugeRowProps {
  time?: any;
  solars?: any;
  /** Array of field indices into data for desired label */
  filteredLabels: number[];
  /** Reference to query data */
  data: PanelData;
  /** Width of one little bar gauge */
  width: number;
  /** Height of one little bar gauge */
  height: number;
  /** Horizontal or Vertical */
  orientation: BarOrientation;
  /** Index for the query series in data to refer to. BCREG and BATT in separate series at the moment. See assumptions at the bottom of the file */
  bidx: number | undefined;
  /** The grafana eventbus */
  eventBus: EventBus;
}

// Interface for a dict of arrays
// Key will be the label name, which points to an array of indices into the data.series[].fields array which share the same label
export interface Labels {
  [key: string]: number[];
}
