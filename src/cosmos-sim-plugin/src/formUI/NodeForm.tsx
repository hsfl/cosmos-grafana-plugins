import React from 'react';
import { InlineField, InlineFieldRow, InlineFormLabel, Input } from '@grafana/ui';
import { EciPos, PhysPos, KepPos, NodeProps, PropagatorArgs } from '../types';

const inputWidth = 17;

// react elements for one set of params for a node in simulation mode
export const nodeForm = (
  node: NodeProps,
  page: number,
  setPropagatorArgs: (value: React.SetStateAction<PropagatorArgs>) => void
) => {
  // Update state when NodeForm updates a string field
  const handleNodeChangeString = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setPropagatorArgs((p) => {
      const nodes = p.nodes.map((node, idx) => {
        return idx === page - 1 ? { ...node, [target.name]: target.value } : node;
      });
      return { ...p, nodes: nodes };
    });
  };
  // Update state when NodeForm updates a string field
  const handleNodeChangeNumber = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.valueAsNumber == null || isNaN(target.valueAsNumber)) {
      return;
    }
    setPropagatorArgs((p) => {
      const nodes = p.nodes.map((node, idx) => {
        if (idx !== page - 1) {
          return node;
        }
        const newVal = target.valueAsNumber ?? (node[target.name as keyof typeof node] || 0);
        return { ...node, [target.name]: newVal };
      });
      return { ...p, nodes: nodes };
    });
  };
  // Update state when NodeForm updates a position number field
  const handleNodePosChangeNumber = (e: React.FormEvent<HTMLInputElement>, frame: keyof NodeProps) => {
    const target = e.target as HTMLInputElement;
    if (target.valueAsNumber == null || isNaN(target.valueAsNumber)) {
      return;
    }
    setPropagatorArgs((p) => {
      const nodes = p.nodes.map((node, idx) => {
        if (idx !== page - 1) {
          return node;
        }
        let nodeFrame = node[frame];
        if (nodeFrame == null || typeof nodeFrame === 'string' || typeof nodeFrame === 'number') {
          return node;
        }
        switch (frame) {
          case 'eci': {
            const newVal = target.valueAsNumber ?? ((nodeFrame as EciPos)[target.name as keyof EciPos] || 0);
            (nodeFrame as EciPos)[target.name as keyof EciPos] = newVal;
            break;
          }
          case 'phys': {
            const newVal = target.valueAsNumber ?? ((nodeFrame as PhysPos)[target.name as keyof PhysPos] || 0);
            (nodeFrame as PhysPos)[target.name as keyof PhysPos] = newVal;
            break;
          }
          case 'kep': {
            const newVal = target.valueAsNumber ?? ((nodeFrame as KepPos)[target.name as keyof KepPos] || 0);
            (nodeFrame as KepPos)[target.name as keyof KepPos] = newVal;
            break;
          }
          default:
            break;
        }
        return { ...node, [frame]: nodeFrame };
      });
      return { ...p, nodes: nodes };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <InlineFieldRow>
        <InlineField labelWidth={13.5} label="Node name" tooltip="Name of this node. Must be unique">
          <Input
            name="node_name"
            width={inputWidth}
            type="text"
            value={node.name || 'node' + page.toString()}
            onChange={handleNodeChangeString}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineField
        labelWidth={13.5}
        label="Time"
        tooltip="Timestamp in Modified Julian Date. Full orbit will be generated starting from this time"
      >
        <Input width={inputWidth} type="number" name="utc" value={node.utc ?? 0} onChange={handleNodeChangeNumber} />
      </InlineField>
      <InlineFieldRow>
        <InlineFormLabel width={5} tooltip="Position of the satellite in ECI coordinate frame">
          Position
        </InlineFormLabel>
        <InlineField labelWidth={3} label="X">
          <Input
            width={inputWidth}
            type="number"
            name="px"
            value={node.eci?.px ?? 0}
            onChange={(e) => handleNodePosChangeNumber(e, 'eci')}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Y">
          <Input
            width={inputWidth}
            type="number"
            name="py"
            value={node.eci?.py ?? 0}
            onChange={(e) => handleNodePosChangeNumber(e, 'eci')}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Z">
          <Input
            width={inputWidth}
            type="number"
            name="pz"
            value={node.eci?.pz ?? 0}
            onChange={(e) => handleNodePosChangeNumber(e, 'eci')}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineFormLabel width={5} tooltip="Velocity of the satellite in ECI coordinate frame">
          Velocity
        </InlineFormLabel>
        <InlineField labelWidth={3} label="X">
          <Input
            width={inputWidth}
            type="number"
            name="vx"
            value={node.eci?.vx ?? 0}
            onChange={(e) => handleNodePosChangeNumber(e, 'eci')}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Y">
          <Input
            width={inputWidth}
            type="number"
            name="vy"
            value={node.eci?.vy ?? 0}
            onChange={(e) => handleNodePosChangeNumber(e, 'eci')}
          />
        </InlineField>
        <InlineField labelWidth={3} label="Z">
          <Input
            width={inputWidth}
            type="number"
            name="vz"
            value={node.eci?.vz ?? 0}
            onChange={(e) => handleNodePosChangeNumber(e, 'eci')}
          />
        </InlineField>
      </InlineFieldRow>
    </div>
  );
};
