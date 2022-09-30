type SeriesSize = 'sm' | 'md' | 'lg';

export type telemType = 'poseci' | 'veleci' | 'acceci' | 'atteci' | 'posphys' | 'poskep';
export interface TelemSelect {
  label: string;
  value: telemType;
  description: string;
}
export const telemDesc: { [key in telemType]: string } = {
  poseci: 'Position of node in ECI. Returns dict eci with keys: px, py, pz.',
  veleci: 'Velocity of node in ECI. Returns dict eci with keys: vx, vy, vz.',
  acceci: 'Acceleration of node in ECI. Returns dict eci with keys: ax, ay, az.',
  atteci: 'Attitude of node in ECI. Returns dict eci with keys: qw, qx, qy, qz.',
  posphys: 'Position of node in PHYS. Returns dict phys with keys: lat, lon, alt, angle.',
  poskep: 'Position of node in KEPLER. Returns dict kep with keys: ea, inc, ap, raan, ecc, sma.',
};
export const telemList: telemType[] = ['poseci', 'veleci', 'acceci', 'atteci', 'posphys', 'poskep'];

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
}

// For propagator setup
export interface NodeProps {
  name: string;
  utc: number | null;
  eci: EciPos | null;
  phys: PhysPos | null;
  kep: KepPos | null;
  shape: string | null;
  force: EciAccel | null;
}

// Initialize position in eci
export interface EciPos {
  px: number;
  py: number;
  pz: number;
  vx: number;
  vy: number;
  vz: number;
}

// Initialize position in phys
export interface PhysPos {
  lat: number;
  lon: number;
  alt: number;
  angle: number;
}

// Initialize position in keplerian elements
export interface KepPos {
  ea: number;
  inc: number;
  ap: number;
  raan: number;
  ecc: number;
  sma: number;
}

interface EciAccel {
  ax: number;
  ay: number;
  az: number;
}

export interface PropagatorArgs {
  start: number;
  end: number | null;
  runcount: number | null;
  simdt: number;
  telem: telemType[];
  nodes: NodeProps[];
  db: boolean;
}
