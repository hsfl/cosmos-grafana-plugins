import { BusEventWithPayload, EventBus, PanelData, SelectableValue } from '@grafana/data';

type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}

export type RefDict = { [key in input_field]?: HTMLInputElement | null };
export type IdxDict = { [key in input_types]?: number };

export type input_field = 'theta_x' | 'theta_y' | 'theta_z' | 'theta_w' |
  'omega_x' | 'omega_y' | 'omega_z' |
  'mag_x' | 'mag_y' | 'mag_z' |
  'qva' | 'qvb' | 'qvc' | 'qvd' | 'azi' | 'elev' |
  'geoc_s_x' | 'geoc_s_y' | 'geoc_s_z' | 'geod_s_lat' | 'geod_s_lon' | 'geod_s_alt' |
  's_h' | 's_e' | 's_b' | 'v_x' | 'v_y' | 'v_z' |
  'mtr_torq' | 'mtr_a' | 'rw_torq' | 'rw_rpm' |
  'a_x' | 'a_y' | 'a_z' | 'v_deg_x' | 'v_deg_y' | 'v_deg_z';
// add types for controls; need to have single row, add other rows dynamically... 
// query twice for controls panel for mtr and rw ? 

// RefCont ... dictionary of 'device' | 'mtr_torq' | 'mtr_a' | 'rw_torq' | 'rw_rpm', with device:value objects for each, value as HTMLInputElement
// export type RefCont = { [key in control_field]?: {} };
// export type control_field = 'mtrs' | 'rws' | 'mtr_torq' | 'mtr_a' | 'rw_torq' | 'rw_rpm';
// IdxCont
export type input_types = 'imu' | 'ssen' | 'gps' |
  'adcstotal' | 'mtr' | 'rw';

export type RefMtr = { [key in mtr_field]?: HTMLInputElement | null };
export type mtr_field = 'mtr_name' | 'mtr_torq' | 'mtr_a';

export type RefRw = { [key in rw_field]?: HTMLInputElement | null };
export type rw_field = 'rw_name' | 'rw_torq' | 'rw_rpm';

export type RefImu = { [key in imu_field]?: HTMLInputElement | null };
export type imu_field = 'imu_name' | 'theta_x' | 'theta_y' | 'theta_z' | 'theta_w' |
  'omega_x' | 'omega_y' | 'omega_z' |
  'mag_x' | 'mag_y' | 'mag_z';

export type RefSsen = { [key in ssen_field]?: HTMLInputElement | null };
export type ssen_field = 'ssen_name' | 'qva' | 'qvb' | 'qvc' | 'qvd' | 'azi' | 'elev';

export type RefGps = { [key in gps_field]?: HTMLInputElement | null };
export type gps_field = 'gps_name' | 'geoc_s_x' | 'geoc_s_y' | 'geoc_s_z' | 'geod_s_lat' | 'geod_s_lon' | 'geod_s_alt';

export type RefAdcstot = { [key in adcstot_field]?: HTMLInputElement | null };
export type adcstot_field = 'adcstot_name' | 'geod_s_lat' | 'geod_s_lon' | 'geod_s_alt' |
  's_h' | 's_e' | 's_b' | 'v_x' | 'v_y' | 'v_z' |
  'a_x' | 'a_y' | 'a_z' | 'v_deg_x' | 'v_deg_y' | 'v_deg_z';

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

export enum BarOrientation {
  vertical,
  horizontal,
}

export interface BarGaugeProps {
  time?: any;
  solars?: any;
  /** Selected CPU to display data for */
  cpu: SelectableValue<string> | undefined;
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
