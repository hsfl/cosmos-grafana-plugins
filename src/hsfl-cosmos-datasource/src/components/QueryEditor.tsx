import defaults from 'lodash/defaults';

import React, { ChangeEvent, FormEvent, PureComponent } from 'react';
import { Button, Input } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import Autocomplete from '@mui/material/Autocomplete';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { DataSource } from 'datasource';
import { QueryArgComponent, renderOption } from 'components/QueryEditorElements';
import {
  compareTypeOptions,
  defaultQuery,
  filterTypeOptions,
  functionTypeOptions,
  queryOptions,
  QueryFilter,
  MyDataSourceOptions,
  MyQuery,
  CompareType,
  FilterType,
  FunctionArgs,
  FunctionType,
  QueryFunction,
} from 'types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  // Switch positions
  state = {
    applyFilters: false,
    applyFunctions: false,
  };
  onQueryTextChange = (value: string) => {
    const { onChange, query } = this.props;
    onChange({ ...query, type: value, arg: '' });
  };

  onTypeTextChange = (value: string) => {
    const { onChange, query } = this.props;
    onChange({ ...query, arg: value });
  };

  onLatestOnlySwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, latestOnly: event.currentTarget.checked });
  };

  onFiltersSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    this.setState({ applyFilters: event.currentTarget.checked });
    onChange({ ...query, filters: event.currentTarget.checked ? query.filters : [] });
  };

  onFunctionsSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    this.setState({ applyFunctions: event.currentTarget.checked });
    onChange({ ...query, functions: event.currentTarget.checked ? query.functions : [] });
  };

  onAddFilterClick = () => {
    const { onChange, query } = this.props;
    const newFilter: QueryFilter = {
      filterType: 'node',
      compareType: 'equals',
      filterValue: '',
    };
    onChange({ ...query, filters: [...query.filters, newFilter] });
  };

  onFilterChangeFilterType = (value: FilterType, idx: number) => {
    const { onChange, query } = this.props;
    if (idx >= query.filters.length) {
      return;
    }
    query.filters[idx].filterType = value;
    onChange({ ...query });
  };

  onFilterChangeCompareType = (value: CompareType, idx: number) => {
    const { onChange, query } = this.props;
    if (idx >= query.filters.length) {
      return;
    }
    query.filters[idx].compareType = value;
    onChange({ ...query });
  };

  onFilterChangeValue = (event: FormEvent<HTMLInputElement>, idx: number) => {
    const { onChange, query } = this.props;
    if (idx >= query.filters.length) {
      return;
    }
    query.filters[idx].filterValue = event.currentTarget.value;
    onChange({ ...query, filters: query.filters });
  };

  onFilterDelete = (idx: number) => {
    const { onChange, query } = this.props;
    if (idx >= query.filters.length) {
      return;
    }
    query.filters.splice(idx, 1);
    onChange({ ...query });
  };

  onAddFunctionClick = () => {
    const { onChange, query } = this.props;
    const newFunction: QueryFunction = {
      functionType: 'sum',
      args: [],
    };
    onChange({ ...query, functions: [...query.functions, newFunction] });
  };

  onFunctionChangeFunctionType = (value: FunctionType, idx: number) => {
    const { onChange, query } = this.props;
    if (idx >= query.functions.length) {
      return;
    }
    query.functions[idx].functionType = value;
    query.functions[idx].args = [];
    const args = FunctionArgs.get(value) ?? [];
    for (let i = 0; i < args.length; i++) {
      query.functions[idx].args.push('');
    }
    onChange({ ...query });
  };

  onFunctionDelete = (idx: number) => {
    const { onChange, query } = this.props;
    if (idx >= query.functions.length) {
      return;
    }
    query.functions.splice(idx, 1);
    onChange({ ...query });
  };

  onFunctionArgChange = (event: FormEvent<HTMLInputElement>, funcIdx: number, argIdx: number) => {
    const { onChange, query } = this.props;
    if (funcIdx >= query.functions.length || argIdx >= query.functions[funcIdx].args.length) {
      return;
    }
    query.functions[funcIdx].args[argIdx] = event.currentTarget.value;
    onChange({ ...query });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { type, arg, latestOnly, filters, functions } = query;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
        {/* Header settings row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: 'whitesmoke',
            padding: '0 0.5em 0 0.5em',
            gap: '0.5em',
            alignItems: 'center',
          }}
        >
          {'Get latest only'}
          <Switch checked={latestOnly} onChange={this.onLatestOnlySwitchChange} style={{ alignItems: 'center' }} />
          {'Filters'}
          <Switch
            checked={this.state.applyFilters}
            onChange={this.onFiltersSwitchChange}
            style={{ alignItems: 'center' }}
          />
          {'Functions'}
          <Switch
            checked={this.state.applyFunctions}
            onChange={this.onFunctionsSwitchChange}
            style={{ alignItems: 'center' }}
          />
        </div>
        {/* Data Query row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 2fr',
            backgroundColor: 'whitesmoke',
            padding: '0.5em',
            gap: '1em',
          }}
        >
          <div style={{ position: 'relative' }}>
            Data
            <Autocomplete
              disableClearable
              options={queryOptions}
              value={queryOptions.find((option) => option.value === type)}
              onChange={(event, value) => this.onQueryTextChange(value.value)}
              renderInput={(params) => <TextField {...params} />}
              renderOption={renderOption}
              componentsProps={{
                popper: { disablePortal: true, placement: 'bottom-start', style: { minWidth: '100%' } },
              }}
              style={{ gridColumn: 1 }}
            />
          </div>
          <QueryArgComponent onChange={this.onTypeTextChange} type={type} arg={arg} />
        </div>
        {/* Filters */}
        {!this.state.applyFilters ? null : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'whitesmoke',
              padding: '0.5em',
              rowGap: '0.5em',
            }}
          >
            Filters
            {filters.map((v, i) => (
              <div
                key={`filter-${i}`}
                style={{ display: 'grid', gridTemplateColumns: '0.5fr auto 1fr 1fr auto', columnGap: '0.5em' }}
              >
                <Autocomplete
                  disableClearable
                  style={{ gridColumn: 1 }}
                  options={filterTypeOptions}
                  value={filterTypeOptions.find((option) => option.value === v.filterType)}
                  onChange={(event, value) => this.onFilterChangeFilterType(value.value, i)}
                  renderInput={(params) => <TextField {...params} />}
                  renderOption={renderOption}
                  componentsProps={{ popper: { placement: 'bottom-start', style: { minWidth: 'fit-content' } } }}
                />
                <Autocomplete
                  disableClearable
                  style={{ gridColumn: 2 }}
                  options={compareTypeOptions}
                  value={compareTypeOptions.find((option) => option.value === v.compareType)}
                  onChange={(event, value) => this.onFilterChangeCompareType(value.value, i)}
                  renderInput={(params) => <TextField {...params} />}
                  renderOption={renderOption}
                  componentsProps={{ popper: { placement: 'bottom-start', style: { minWidth: 'fit-content' } } }}
                />
                <Input
                  style={{ gridColumn: 3 }}
                  value={v.filterValue}
                  onChange={(e) => this.onFilterChangeValue(e, i)}
                />
                <Button
                  variant="secondary"
                  icon={'trash-alt'}
                  onClick={() => this.onFilterDelete(i)}
                  style={{ gridColumn: 5, width: 'min-content' }}
                />
              </div>
            ))}
            <Button
              variant="secondary"
              icon={'plus'}
              onClick={this.onAddFilterClick}
              style={{ width: 'min-content' }}
            />
          </div>
        )}
        {/* Functions */}
        {!this.state.applyFunctions ? null : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'whitesmoke',
              padding: '0.5em',
              rowGap: '0.5em',
            }}
          >
            Functions
            {functions.map((v, i) => (
              <div
                key={`function-${i}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                  gridAutoColumns: '20px',
                  columnGap: '0.5em',
                }}
              >
                <Autocomplete
                  disableClearable
                  style={{ gridColumn: 1 }}
                  options={functionTypeOptions}
                  value={functionTypeOptions.find((option) => option.value === v.functionType)}
                  onChange={(event, value) => this.onFunctionChangeFunctionType(value.value, i)}
                  renderInput={(params) => <TextField {...params} />}
                  renderOption={renderOption}
                  componentsProps={{ popper: { placement: 'bottom-start', style: { minWidth: 'fit-content' } } }}
                />
                {v.args.map((arg, argIdx) => (
                  <Input
                    placeholder={FunctionArgs.get(v.functionType)![argIdx]}
                    key={`function-${i}-arg${argIdx}`}
                    value={arg}
                    onChange={(e) => this.onFunctionArgChange(e, i, argIdx)}
                  />
                ))}
                <Button
                  variant="secondary"
                  icon={'trash-alt'}
                  onClick={() => this.onFunctionDelete(i)}
                  style={{ gridColumn: 5, width: 'min-content' }}
                />
              </div>
            ))}
            <Button
              variant="secondary"
              icon={'plus'}
              onClick={this.onAddFunctionClick}
              style={{ width: 'min-content' }}
            />
          </div>
        )}
      </div>
    );
  }

  componentDidMount() {
    // Set initial switch positions
    const query = defaults(this.props.query, defaultQuery);
    const { filters, functions } = query;
    this.setState({ applyFilters: filters.length > 0, applyFunctions: functions.length > 0 });
  }
}
