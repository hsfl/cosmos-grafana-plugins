import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery, queryValues, typeValues } from '../types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    const newValue: queryValues = (event.target.value as queryValues) ?? 'position';
    onChange({ ...query, queryText: newValue });
  };

  onTypeTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    const newType: typeValues = (event.target.value as typeValues) ?? 'eci';
    onChange({ ...query, typeText: newType });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, typeText } = query;

    return (
      <div className="gf-form">
        <FormField
          labelWidth={8}
          value={queryText || ''}
          onChange={this.onQueryTextChange}
          label="Query Text"
          tooltip="Tip: endpoint specifier for cosmos backend"
        />
        <FormField
          labelWidth={8}
          value={typeText || ''}
          onChange={this.onTypeTextChange}
          label="Type Text"
          tooltip="Tip: Type specifier for {position}"
        />
      </div>
    );
  }
}
