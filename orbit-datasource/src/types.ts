import { DataQuery, DataSourceJsonData } from '@grafana/data';

// For propagator setup
export interface SimFields {
  node_name: string;
  utc: number;
  px: number;
  py: number;
  pz: number;
  vx: number;
  vy: number;
  vz: number;
}

// For editing query to database
export interface OpFields {
  node_name: string;
  tag_name: string;
  tag_value: string;
  px: string;
  py: string;
  pz: string;
  vx: string;
  vy: string;
  vz: string;
}

// Front-end options
export interface MyQuery extends DataQuery {
  queryText?: string;
  constant: number;
  isSimMode: boolean;
  simNodeList: SimFields[];
  opNodeList: OpFields[];
}

export const defaultQuery: Partial<MyQuery> = {
  constant: 6.5,
  isSimMode: false,
  simNodeList: [
    {
      node_name: '',
      utc: 0,
      px: 0,
      py: 0,
      pz: 0,
      vx: 0,
      vy: 0,
      vz: 0,
    },
  ],
  opNodeList: [
    {
      node_name: '',
      tag_name: 'beacon_type',
      tag_value: 'posbeacon',
      px: 'node.loc.pos.eci.s.col[0]',
      py: 'node.loc.pos.eci.s.col[1]',
      pz: 'node.loc.pos.eci.s.col[2]',
      vx: 'node.loc.pos.eci.v.col[0]',
      vy: 'node.loc.pos.eci.v.col[1]',
      vz: 'node.loc.pos.eci.v.col[2]',
    },
  ],
};

/**
 * These are options configured for each DataSource instance.
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  path?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  apiKey?: string;
}
