type SeriesSize = 'sm' | 'md' | 'lg';
type CircleColor = 'red' | 'green' | 'blue';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  color: CircleColor;
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
