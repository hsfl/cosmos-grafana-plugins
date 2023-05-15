import { DataQuery, DataSourceJsonData, SelectableValue } from '@grafana/data';

export const queryOptions: Array<SelectableValue<string>> = [
  { label: 'Attitude', value: 'attitude' },
  { label: 'Position', value: 'position' },
  { label: 'Battery', value: 'battery' },
  { label: 'BC Regulator', value: 'bcreg' },
  { label: 'CPU', value: 'cpu' },
  { label: 'Events', value: 'event' },
  { label: 'Thermal', value: 'tsen' },
];

export const posTypeOptions: Array<SelectableValue<string>> = [
  { label: 'ECI', value: 'eci', description: 'Earth-Centered Inertial' },
  { label: 'Geospheric', value: 'geos', description: '' },
  { label: 'Geodetic', value: 'geod', description: 'Lat/Lon/Alt' },
  { label: 'LVLH', value: 'lvlh', description: 'Local Vertical Local Horizontal' },
];

export interface MyQuery extends DataQuery {
  queryText: string;
  typeText?: string;
  latestOnly: boolean;
  filters: Filter[];
}

export const defaultQuery: Partial<MyQuery> = {
  queryText: 'position',
  typeText: 'eci',
  latestOnly: false,
  filters: [],
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

type filterType = 'node' | 'name' | 'col';
type compareType = 'equals' | 'contains';
export const filterTypeOptions: Array<SelectableValue<string>> = [
  { label: 'Node', value: 'node' },
  { label: 'Name', value: 'name' },
  { label: 'Column', value: 'col' },
];
export const compareTypeOptions: Array<SelectableValue<string>> = [
  { label: '=', value: 'equals', description: 'Exactly equals' },
  { label: '~=', value: 'contains', description: 'Contains' },
];

export interface Filter {
  filterType: filterType;
  compareType: compareType;
  filterValue: string;
}
