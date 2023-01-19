import { DataQuery, DataSourceJsonData } from '@grafana/data';

// For propagator setup
export interface SimFields {
  name: string;
  frame: string;
}

// For editing query to database
export interface OpFields {
  name: string;
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
  isSimMode: true,
  simNodeList: [
    {
      name: '',
      frame: 'eci',
    },
  ],
  opNodeList: [
    {
      name: '',
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
  org?: string;
  dburl?: string;
  backendurl?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface MySecureJsonData {
  authKey?: string;
}
