import { BusEventWithPayload, PanelData } from '@grafana/data';

export interface SimpleOptions {
  showTimeline: boolean;
  showAnimation: boolean;
}

export interface CzmlPacket {
  id: string;
  name?: string;
  version?: string;
  availability?: string;
  position?: {
    interval?: string;
    epoch: string;
    cartesian: number[];
    referenceFrame?: string;
  };
  point?: {
    color: {
      rgba: number[];
    };
    outlineColor?: {
      rgba: number[];
    };
    outlineWidth?: number;
    pixelSize: number;
  };
  model?: {
    gltf: string;
    scale: number;
    minimumPixelSize?: number;
  };
  orientation?: {
    epoch: string;
    interpolationAlgorithm?: string;
    interpolationDegree?: number;
    unitQuaternion: number[];
  };
  path?: {
    material: {
      polylineOutline: {
        color: {
          rgba: number[];
        };
        outlineColor?: {
          rgba: number[];
        };
        outlineWidth?: number;
      };
    };
    width: number;
    leadTime?: number;
    trailTime?: number;
    resolution?: number;
  };
}

export interface HashStr {
  [key: string]: string;
}

export interface HashNum {
  [key: string]: number;
}

export type RefDict = { [key in input_field]?: HTMLInputElement | null };
export type IdxDict = { [key in input_field]?: number };

export type input_field = 's_lat' | 's_lon' | 's_h' | 'sun_beta' | 'eclipse' | 'sunlight';

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
