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
  { label: 'Events', value: 'event' },
  { label: 'Thermal', value: 'tsen' },
  { label: 'Nodal Awareness', value: 'nodalaware', description: 'Relative angle/range to other nodes' },
];

// Coordinate-frame conversion options for the Position query type
export const posTypeOptions: Array<SelectOption<string>> = [
  { label: 'ECI', value: 'eci', description: 'Earth-Centered Inertial' },
  { label: 'Geospheric', value: 'geos', description: '' },
  { label: 'Geodetic', value: 'geod', description: 'Lat/Lon/Alt' },
  { label: 'LVLH', value: 'lvlh', description: 'Local Vertical Local Horizontal' },
  { label: 'ICRF', value: 'icrf', description: 'icrf for H E B in ADCS' },
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
