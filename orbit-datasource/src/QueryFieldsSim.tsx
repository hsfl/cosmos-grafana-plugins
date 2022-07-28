import React, { ChangeEvent, FormEvent } from 'react';
import { InlineField, InlineFieldRow, Input, InlineSwitch } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { MyDataSourceOptions, MyQuery, SimFields } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

// react elements for one set of params for a node in simulation mode
export const nodeSimParams = (idx: number, props: Props, query: Partial<MyQuery> & MyQuery) => {
  const { isSimMode, simNodeList } = query;
  return (
    <div>
      <InlineFieldRow>
        <InlineField labelWidth={13.8} label="Name">
          <Input
            width={20}
            type="text"
            value={simNodeList[idx].name || ''}
            onChange={(e) => onSimFieldsChange(e, idx, 'name', props, simNodeList)}
          />
        </InlineField>
        {idx === 0 ? (
          <span>
            <InlineField
              labelWidth={21.8}
              label="Simulation Mode"
              tooltip="Generate a full orbit from initial conditions in simulation mode"
            >
              <InlineSwitch
                value={isSimMode || false}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onIsSimModeChange(e, props)}
              />
            </InlineField>
          </span>
        ) : null}
      </InlineFieldRow>
    </div>
  );
};

// Change node sim fields in nodes list
// event: click event
// idx: index of node in nodes
// field: which field was changed
export const onSimFieldsChange = (
  event: FormEvent<HTMLInputElement>,
  idx: number,
  field: string,
  props: Props,
  simNodeList: SimFields[]
) => {
  const { onChange, query } = props;
  switch (field) {
    case 'name':
      onChange({
        ...query,
        simNodeList: simNodeList.map((el, i) => (i === idx ? { ...el, name: event.currentTarget.value } : { ...el })),
      });
      break;
  }
};

// Handler for when Simulation mode toggle is clicked
const onIsSimModeChange = (event: ChangeEvent<HTMLInputElement>, props: Props) => {
  const { onChange, query } = props;
  onChange({ ...query, isSimMode: event.target.checked });
};
