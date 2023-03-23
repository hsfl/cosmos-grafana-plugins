import { DataQuery, DataSourceJsonData } from '@grafana/data';

export type queryValues = 'attitude' | 'position' | 'battery' | 'bcreg' | 'cpu' | 'event' | 'tsen';

export type typeValues = 'eci' | 'geos' | 'geod' | 'lvlh';

export interface MyQuery extends DataQuery {
  queryText?: queryValues;
  typeText?: typeValues;
}

export const defaultQuery: Partial<MyQuery> = {
  queryText: 'position',
  typeText: 'eci',
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

export const url_options = [
  { label: 'Host', value: '' },
  { label: 'URL', value: '' },
];
