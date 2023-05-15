import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { ActionMeta, Button, Select, Switch } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from '../datasource';
import {
  defaultQuery,
  MyDataSourceOptions,
  MyQuery,
  compareTypeOptions,
  Filter,
  filterTypeOptions,
  queryOptions,
  posTypeOptions,
} from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onQueryTextChange = (value: SelectableValue<string>, actionMeta: ActionMeta) => {
    const { onChange, query } = this.props;
    const newValue = value.value ?? 'position';
    onChange({ ...query, queryText: newValue });
  };

  onTypeTextChange = (value: SelectableValue<string>, actionMeta: ActionMeta) => {
    const { onChange, query } = this.props;
    const newType = value.value ?? 'eci';
    onChange({ ...query, typeText: newType });
  };

  onLatestOnlyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, latestOnly: event.currentTarget.checked });
  };

  onAddFilterClick = () => {
    const { onChange, query } = this.props;
    const newFilter: Filter = {
      filterType: 'node',
      compareType: 'equals',
      filterValue: '',
    };
    onChange({ ...query, filters: [...query.filters, newFilter] });
  };

  onFilterChangeFilterTypeClick = () => {
    // const { onChange, query } = this.props;
  };

  onFilterChangeCompareTypeClick = () => {
    // const { onChange, query } = this.props;
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, typeText, latestOnly, filters } = query;
    console.log('queryText:', queryText);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
        {/* Header settings row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: 'whitesmoke',
            padding: '0.5em',
            gap: '1em',
            alignItems: 'center',
          }}
        >
          {'Get latest only'}
          <Switch value={latestOnly} onChange={this.onLatestOnlyChange} style={{ alignItems: 'center' }} />
        </div>
        {/* Data Query row */}
        <div
          style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'whitesmoke', padding: '0.5em', gap: '1em' }}
        >
          <div>
            Data
            <Select options={queryOptions} value={queryText || ''} onChange={this.onQueryTextChange} width={20} />
          </div>
          {queryText === 'position' ? (
            <div>
              Type
              <Select options={posTypeOptions} value={typeText || ''} onChange={this.onTypeTextChange} width={20} />
            </div>
          ) : null}
        </div>
        {/* Filters */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'whitesmoke',
            padding: '0.5em',
            gap: '1em',
          }}
        >
          Filters
          {filters.map((v, i) => (
            <div key={`filter-${i}`} style={{ display: 'flex', flexDirection: 'row' }}>
              <Select options={filterTypeOptions} value={v.filterType} onChange={this.onFilterChangeFilterTypeClick} />
              <Select
                options={compareTypeOptions}
                value={v.compareType}
                onChange={this.onFilterChangeCompareTypeClick}
              />
            </div>
          ))}
          <Button variant="secondary" icon={'plus'} onClick={this.onAddFilterClick} style={{ width: 'min-content' }} />
        </div>
        {/* Functions */}
      </div>
    );
  }
}
