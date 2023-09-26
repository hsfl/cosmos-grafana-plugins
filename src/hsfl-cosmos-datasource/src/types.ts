import { DataQuery, DataSourceJsonData, SelectableValue } from '@grafana/data';

export interface SelectOption<T> {
  label: string;
  value: T;
  description?: string;
}

export const queryOptions: Array<SelectOption<string>> = [
  { label: 'Attitude', value: 'attitude' },
  { label: 'Position', value: 'position' },
  { label: 'Battery', value: 'battery' },
  { label: 'BC Regulator', value: 'bcreg' },
  { label: 'CPU', value: 'cpu' },
  { label: 'IMU', value: 'imu' },
  { label: 'SSEN', value: 'ssen' },
  { label: 'GPS', value: 'gps' },
  { label: 'Events', value: 'event' },
  { label: 'Thermal', value: 'tsen' },
  { label: 'Nodal Awareness', value: 'nodalaware', description: 'Relative angle/range to other nodes' },
  { label: 'Target', value: 'target' },
];

// Coordinate-frame conversion options for the Position query type
export const posTypeOptions: Array<SelectOption<string>> = [
  { label: 'ECI', value: 'eci', description: 'Earth-Centered Inertial' },
  { label: 'Geospheric', value: 'geos', description: '' },
  { label: 'Geodetic', value: 'geod', description: 'Lat/Lon/Alt' },
  { label: 'LVLH', value: 'lvlh', description: 'Local Vertical Local Horizontal' },
  { label: 'ICRF', value: 'icrf', description: 'icrf for H E B in ADCS' },
  { label: 'GEOC', value: 'geoc', description: 'goec for H E B in ADCS' },
  { label: 'EUL_LVLH', value: 'eul_lvlh', description: 'Euler Angle and LVLH for H E B in ADCS' },
  { label: 'ORBIT', value: 'orbit', description: 'Orbit position: eci.s, geod lat/lon/alt, kepstruc.beta' },
  { label: 'Total Att', value: 'att_total', description: 'ADCS estimated state for total attitude and position' },
];

// Origin point node options for Nodal Awareness query type, todo: async-ify
export const nodalawareTypeArgs: Array<SelectOption<string>> = [
  { label: 'Mothership', value: 'mother' },
];

export interface MyQuery extends DataQuery {
  type: string;
  arg: string;
  latestOnly: boolean;
  filters: QueryFilter[];
  functions: QueryFunction[];
}

export const defaultQuery: Partial<MyQuery> = {
  type: 'position',
  arg: '',
  latestOnly: false,
  filters: [],
  functions: [],
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  usingHostname: boolean;
  url?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}

export const url_options: Array<SelectableValue<string>> = [
  { label: 'Host', value: '' },
  { label: 'URL', value: '' },
];

export type FilterType = 'node' | 'name' | 'col';
export type CompareType = 'equals' | 'contains';
export type FunctionType = 'sum' | 'magnitude';
export const FunctionArgs = new Map<FunctionType, string[]>([
  ['sum', []],
  ['magnitude', ['Vector name']],
]);
export const filterTypeOptions: Array<SelectOption<FilterType>> = [
  { label: 'Node', value: 'node' },
  { label: 'Name', value: 'name' },
  { label: 'Column', value: 'col' },
];
export const compareTypeOptions: Array<SelectOption<CompareType>> = [
  { label: '=', value: 'equals', description: 'Exactly equals' },
  { label: '~=', value: 'contains', description: 'Contains' },
];
export const functionTypeOptions: Array<SelectOption<FunctionType>> = [
  { label: 'Sum', value: 'sum', description: 'Compute sum of values' },
  { label: 'Magnitude', value: 'magnitude', description: 'Compute magnitude of a vector-quantity' },
];

export interface QueryFilter {
  filterType: FilterType;
  compareType: CompareType;
  filterValue: string;
}

export interface QueryFunction {
  functionType: FunctionType;
  args: string[];
}
