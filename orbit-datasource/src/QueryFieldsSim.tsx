import React, { ChangeEvent, FormEvent } from 'react';
import { InlineField, InlineFieldRow, InlineFormLabel, Input, InlineSwitch } from '@grafana/ui';
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
        <InlineField labelWidth={13.8} label="Node name" tooltip="Name of this node. Must be unique">
          <Input
            width={20}
            type="text"
            value={simNodeList[idx].node_name || ''}
            onChange={(e) => onSimFieldsChange(e, idx, 'node_name', props, simNodeList)}
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
      <InlineField
        labelWidth={14}
        label="Time"
        tooltip="Timestamp in Modified Julian Date. Full orbit will be generated starting from this time"
      >
        <Input
          width={20}
          type="number"
          value={simNodeList[idx].utc}
          onChange={(e) => onSimFieldsChange(e, idx, 'utc', props, simNodeList)}
        />
      </InlineField>
      <InlineFieldRow>
        <InlineFormLabel width={5} tooltip="Position of the satellite in ECI coordinate frame">
          Position
        </InlineFormLabel>
        <InlineField labelWidth={3} label="X">
          <Input
            type="number"
            value={simNodeList[idx].px}
            onChange={(e) => onSimFieldsChange(e, idx, 'px', props, simNodeList)}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Y">
          <Input
            type="number"
            value={simNodeList[idx].py}
            onChange={(e) => onSimFieldsChange(e, idx, 'py', props, simNodeList)}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Z">
          <Input
            type="number"
            value={simNodeList[idx].pz}
            onChange={(e) => onSimFieldsChange(e, idx, 'pz', props, simNodeList)}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineFormLabel width={5} tooltip="Velocity of the satellite in ECI coordinate frame">
          Velocity
        </InlineFormLabel>
        <InlineField labelWidth={3} label="X">
          <Input
            type="number"
            value={simNodeList[idx].vx}
            onChange={(e) => onSimFieldsChange(e, idx, 'vx', props, simNodeList)}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Y">
          <Input
            type="number"
            value={simNodeList[idx].vy}
            onChange={(e) => onSimFieldsChange(e, idx, 'vy', props, simNodeList)}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Z">
          <Input
            type="number"
            value={simNodeList[idx].vz}
            onChange={(e) => onSimFieldsChange(e, idx, 'vz', props, simNodeList)}
          />
        </InlineField>
      </InlineFieldRow>
      <br />
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
    case 'node_name':
      onChange({
        ...query,
        simNodeList: simNodeList.map((el, i) =>
          i === idx ? { ...el, node_name: event.currentTarget.value } : { ...el }
        ),
      });
      break;
    case 'utc':
      onChange({
        ...query,
        simNodeList: simNodeList.map((el, i) =>
          i === idx ? { ...el, utc: parseFloat(event.currentTarget.value) } : { ...el }
        ),
      });
      break;
    case 'px':
      onChange({
        ...query,
        simNodeList: simNodeList.map((el, i) =>
          i === idx ? { ...el, px: parseFloat(event.currentTarget.value) } : { ...el }
        ),
      });
      break;
    case 'py':
      onChange({
        ...query,
        simNodeList: simNodeList.map((el, i) =>
          i === idx ? { ...el, py: parseFloat(event.currentTarget.value) } : { ...el }
        ),
      });
      break;
    case 'pz':
      onChange({
        ...query,
        simNodeList: simNodeList.map((el, i) =>
          i === idx ? { ...el, pz: parseFloat(event.currentTarget.value) } : { ...el }
        ),
      });
      break;
    case 'vx':
      onChange({
        ...query,
        simNodeList: simNodeList.map((el, i) =>
          i === idx ? { ...el, vx: parseFloat(event.currentTarget.value) } : { ...el }
        ),
      });
      break;
    case 'vy':
      onChange({
        ...query,
        simNodeList: simNodeList.map((el, i) =>
          i === idx ? { ...el, vy: parseFloat(event.currentTarget.value) } : { ...el }
        ),
      });
      break;
    case 'vz':
      onChange({
        ...query,
        simNodeList: simNodeList.map((el, i) =>
          i === idx ? { ...el, vz: parseFloat(event.currentTarget.value) } : { ...el }
        ),
      });
      break;
  }
};

// Handler for when Simulation mode toggle is clicked
const onIsSimModeChange = (event: ChangeEvent<HTMLInputElement>, props: Props) => {
  const { onChange, query } = props;
  onChange({ ...query, isSimMode: event.target.checked });
};
