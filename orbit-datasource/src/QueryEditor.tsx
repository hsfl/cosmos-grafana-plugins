import { defaults } from 'lodash';

import React, { ChangeEvent, FormEvent } from 'react';
import { Button, InlineField, InlineFieldRow, InlineFormLabel, Input, InlineSwitch } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

// Note: state is currently stored in the prop, which means everything will rerender after every
// keystroke in the fields, which is incredibly silly.
// Perhaps a combination of a settimeout and useeffect to update the prop only after a second after
// the user is finished typing could be better.
export const QueryEditor = (props: Props) => {
  const query = defaults(props.query, defaultQuery);
  const { queryText, enableSimMode, simNodeList } = query;

  // Change node sim fields in nodes list
  // event: click event
  // idx: index of node in nodes
  // field: which field was changed
  const onSimFieldsChange = (event: FormEvent<HTMLInputElement>, idx: number, field: string) => {
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

  // const onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const { onChange, query, onRunQuery } = props;
  //   onChange({ ...query, constant: parseFloat(event.target.value) });
  //   // executes the query
  //   onRunQuery();
  // };

  const onEnableSimModeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = props;
    onChange({ ...query, enableSimMode: event.target.checked });
  };

  const onSubmitClick = () => {
    const { onRunQuery } = props;
    onRunQuery();
  };

  // react elements for one set of params for a node in simulation mode
  const nodeSimParams = (idx: number) => {
    return (
      <div>
        <InlineFieldRow>
          <InlineField labelWidth={13.8} label="Node name" tooltip="Name of this node. Must be unique">
            <Input
              width={20}
              type="text"
              value={simNodeList[idx].node_name || ''}
              onChange={(e) => onSimFieldsChange(e, idx, 'node_name')}
            />
          </InlineField>
          {idx === 0 ? (
            <span>
              <InlineField
                labelWidth={22}
                label="Simulation Mode"
                tooltip="Generate a full orbit from initial conditions in simulation mode"
              >
                <InlineSwitch value={enableSimMode || false} onChange={onEnableSimModeChange} />
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
            onChange={(e) => onSimFieldsChange(e, idx, 'utc')}
          />
        </InlineField>
        <InlineFieldRow>
          <InlineFormLabel width={5} tooltip="Position of the satellite in ECI coordinate frame">
            Position
          </InlineFormLabel>
          <InlineField labelWidth={3} label="X">
            <Input type="number" value={simNodeList[idx].px} onChange={(e) => onSimFieldsChange(e, idx, 'px')} />
          </InlineField>
          <InlineField labelWidth={3} label="Y">
            <Input type="number" value={simNodeList[idx].py} onChange={(e) => onSimFieldsChange(e, idx, 'py')} />
          </InlineField>
          <InlineField labelWidth={3} label="Z">
            <Input type="number" value={simNodeList[idx].pz} onChange={(e) => onSimFieldsChange(e, idx, 'pz')} />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineFormLabel width={5} tooltip="Velocity of the satellite in ECI coordinate frame">
            Velocity
          </InlineFormLabel>
          <InlineField labelWidth={3} label="X">
            <Input type="number" value={simNodeList[idx].vx} onChange={(e) => onSimFieldsChange(e, idx, 'vx')} />
          </InlineField>
          <InlineField labelWidth={3} label="Y">
            <Input type="number" value={simNodeList[idx].vy} onChange={(e) => onSimFieldsChange(e, idx, 'vy')} />
          </InlineField>
          <InlineField labelWidth={3} label="Z">
            <Input type="number" value={simNodeList[idx].vz} onChange={(e) => onSimFieldsChange(e, idx, 'vz')} />
          </InlineField>
        </InlineFieldRow>
        <br />
      </div>
    );
  };

  const simNodeFields = simNodeList.map((el, i) => nodeSimParams(i));

  // Add a node to the query
  const onAddNodeClick = () => {
    const { onChange, query } = props;
    onChange({
      ...query,
      simNodeList: [...simNodeList, { node_name: '', utc: 0, px: 0, py: 0, pz: 0, vx: 0, vy: 0, vz: 0 }],
    });
  };

  // Remove last node from query
  const onRemoveNodeClick = () => {
    const { onChange, query } = props;
    if (query.simNodeList.length > 1) {
      onChange({
        ...query,
        simNodeList: simNodeList.slice(0, -1),
      });
    }
  };

  const SimulationMode = () => {
    return simNodeFields;
  };

  const RegularMode = () => {
    return (
      <InlineFieldRow>
        <InlineField labelWidth={14} label="Node name" tooltip="Name of this node. Must be unique">
          <Input width={20} type="text" value={queryText || ''} onChange={(e) => null} />
        </InlineField>
        <InlineFormLabel tooltip="Generate a full orbit from initial conditions in simulation mode">
          Simulation Mode
        </InlineFormLabel>
        <InlineSwitch value={enableSimMode || false} onChange={onEnableSimModeChange} />
      </InlineFieldRow>
    );
  };

  return (
    <div>
      {enableSimMode ? SimulationMode() : RegularMode()}
      <InlineFieldRow>
        <Button onClick={onAddNodeClick}>Add Node +</Button>
        <Button onClick={onRemoveNodeClick}>Remove Node -</Button>
        <Button onClick={onSubmitClick}>Run Propagator</Button>
      </InlineFieldRow>
    </div>
  );
};
