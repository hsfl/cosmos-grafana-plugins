import { DataQuery, DataSourceJsonData } from '@grafana/data';

export type queryValues = 'attitude' | 'position' | 'battery' | 'bcreg' | 'cpu' | 'event' | 'tsen';

export interface MyQuery extends DataQuery {
  queryText?: queryValues;
}

export const defaultQuery: Partial<MyQuery> = {
  queryText: 'position',
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
