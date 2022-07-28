import React, { ChangeEvent, FormEvent } from 'react';
import { InlineField, InlineFieldRow, InlineFormLabel, Input, InlineSwitch } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { MyDataSourceOptions, MyQuery, OpFields } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

// react elements for one set of params for a node in simulation mode
export const nodeOpParams = (idx: number, props: Props, query: Partial<MyQuery> & MyQuery) => {
  const { isSimMode, opNodeList } = query;
  return (
    <div>
      <InlineFieldRow>
        <InlineField labelWidth={13.8} label="Node name" tooltip="Name of this node. Must be unique">
          <Input
            width={20}
            type="text"
            value={opNodeList[idx].name || ''}
            onChange={(e) => onOpFieldsChange(e, idx, 'name', props, opNodeList)}
          />
        </InlineField>
        {idx === 0 ? (
          <span>
            <InlineField
              labelWidth={22}
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
      <InlineFieldRow>
        <InlineField
          labelWidth={14}
          label="Tag name"
          tooltip="Tag name in Influxdb for the measurement containing position and velocity values"
        >
          <Input
            width={20}
            type="string"
            value={opNodeList[idx].tag_name}
            onChange={(e) => onOpFieldsChange(e, idx, 'tag_name', props, opNodeList)}
          />
        </InlineField>
        <InlineField
          labelWidth={14}
          label="Tag value"
          tooltip="Tag value in Influxdb for the measurement containing position and velocity values"
        >
          <Input
            width={20}
            type="string"
            value={opNodeList[idx].tag_value}
            onChange={(e) => onOpFieldsChange(e, idx, 'tag_value', props, opNodeList)}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineFormLabel width={5} tooltip="Field names of ECI-frame XYZ position component values in the database">
          Position
        </InlineFormLabel>
        <InlineField labelWidth={3} label="X">
          <Input
            type="string"
            value={opNodeList[idx].px || ''}
            onChange={(e) => onOpFieldsChange(e, idx, 'px', props, opNodeList)}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Y">
          <Input
            type="string"
            value={opNodeList[idx].py || ''}
            onChange={(e) => onOpFieldsChange(e, idx, 'py', props, opNodeList)}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Z">
          <Input
            type="string"
            value={opNodeList[idx].pz || ''}
            onChange={(e) => onOpFieldsChange(e, idx, 'pz', props, opNodeList)}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineFormLabel width={5} tooltip="Field names of ECI-frame XYZ velocity component values in the database">
          Velocity
        </InlineFormLabel>
        <InlineField labelWidth={3} label="X">
          <Input
            type="string"
            value={opNodeList[idx].vx || ''}
            onChange={(e) => onOpFieldsChange(e, idx, 'vx', props, opNodeList)}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Y">
          <Input
            type="string"
            value={opNodeList[idx].vy || ''}
            onChange={(e) => onOpFieldsChange(e, idx, 'vy', props, opNodeList)}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Z">
          <Input
            type="string"
            value={opNodeList[idx].vz || ''}
            onChange={(e) => onOpFieldsChange(e, idx, 'vz', props, opNodeList)}
          />
        </InlineField>
      </InlineFieldRow>
      <br />
    </div>
  );
};

// Change node operational fields in nodes list
// event: click event
// idx: index of node in nodes
// field: which field was changed
export const onOpFieldsChange = (
  event: FormEvent<HTMLInputElement>,
  idx: number,
  field: string,
  props: Props,
  opNodeList: OpFields[]
) => {
  const { onChange, query } = props;
  switch (field) {
    case 'name':
      onChange({
        ...query,
        opNodeList: opNodeList.map((el, i) => (i === idx ? { ...el, name: event.currentTarget.value } : { ...el })),
      });
      break;
    case 'tag_name':
      onChange({
        ...query,
        opNodeList: opNodeList.map((el, i) => (i === idx ? { ...el, tag_name: event.currentTarget.value } : { ...el })),
      });
      break;
    case 'tag_value':
      onChange({
        ...query,
        opNodeList: opNodeList.map((el, i) =>
          i === idx ? { ...el, tag_value: event.currentTarget.value } : { ...el }
        ),
      });
      break;
    case 'px':
      onChange({
        ...query,
        opNodeList: opNodeList.map((el, i) => (i === idx ? { ...el, px: event.currentTarget.value } : { ...el })),
      });
      break;
    case 'py':
      onChange({
        ...query,
        opNodeList: opNodeList.map((el, i) => (i === idx ? { ...el, py: event.currentTarget.value } : { ...el })),
      });
      break;
    case 'pz':
      onChange({
        ...query,
        opNodeList: opNodeList.map((el, i) => (i === idx ? { ...el, pz: event.currentTarget.value } : { ...el })),
      });
      break;
    case 'vx':
      onChange({
        ...query,
        opNodeList: opNodeList.map((el, i) => (i === idx ? { ...el, vx: event.currentTarget.value } : { ...el })),
      });
      break;
    case 'vy':
      onChange({
        ...query,
        opNodeList: opNodeList.map((el, i) => (i === idx ? { ...el, vy: event.currentTarget.value } : { ...el })),
      });
      break;
    case 'vz':
      onChange({
        ...query,
        opNodeList: opNodeList.map((el, i) => (i === idx ? { ...el, vz: event.currentTarget.value } : { ...el })),
      });
      break;
  }
};

// Handler for when Simulation mode toggle is clicked
const onIsSimModeChange = (event: ChangeEvent<HTMLInputElement>, props: Props) => {
  const { onChange, query } = props;
  onChange({ ...query, isSimMode: event.target.checked });
};
