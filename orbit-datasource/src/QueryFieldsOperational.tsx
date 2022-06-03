import React, { ChangeEvent } from 'react';
import { InlineField, InlineFieldRow, InlineFormLabel, Input, InlineSwitch } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { MyDataSourceOptions, MyQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

// react elements for one set of params for a node in simulation mode
export const nodeQueryParams = (props: Props, query: Partial<MyQuery> & MyQuery) => {
  const { isSimMode, queryText } = query;
  return (
    <InlineFieldRow>
      <InlineField labelWidth={14} label="Node name" tooltip="Name of this node. Must be unique">
        <Input width={20} type="text" value={queryText || ''} onChange={(e) => null} />
      </InlineField>
      <InlineFormLabel tooltip="Generate a full orbit from initial conditions in simulation mode">
        Simulation Mode
      </InlineFormLabel>
      <InlineSwitch
        value={isSimMode || false}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onisSimModeChange(e, props)}
      />
    </InlineFieldRow>
  );
};

// Handler for when Simulation mode toggle is clicked
const onisSimModeChange = (event: ChangeEvent<HTMLInputElement>, props: Props) => {
  const { onChange, query } = props;
  onChange({ ...query, isSimMode: event.target.checked });
};
