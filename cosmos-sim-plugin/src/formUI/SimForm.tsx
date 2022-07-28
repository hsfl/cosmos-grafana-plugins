import React from 'react';
import { InlineField, InlineFieldRow, Input, MultiSelect, Tooltip } from '@grafana/ui';
import { PropagatorArgs, telemDesc, telemList, TelemSelect, telemType } from '../types';
import { currentMJD } from 'utils/utilFunctions';

//const inputWidth = 17;

const generateTelemSelect = (telems: telemType[]): TelemSelect[] => {
  return telems.map((telem) => {
    return {
      label: telem,
      value: telem,
      description: telemDesc[telem],
    };
  });
};

// Main sim setup stuff, nodes are handled in NodeForm.tsx
export const simForm = (
  propagatorArgs: PropagatorArgs,
  setPropagatorArgs: (value: React.SetStateAction<PropagatorArgs>) => void
) => {
  const defaultTime = currentMJD(-300 / 86400);

  // Update state when SimForm updates a number field
  const handleSimChangeNumber = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.valueAsNumber == null || isNaN(target.valueAsNumber)) {
      return;
    }
    setPropagatorArgs((p) => {
      const newVal = target.valueAsNumber ?? (p[target.name as keyof typeof p] || 0);
      return { ...p, [target.name as keyof typeof p]: newVal };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <InlineFieldRow>
        <InlineField
          label="Start"
          tooltip="Start time of the propagator. All nodes will be forward-propagated to this start time and then run together."
        >
          <Input
            name="start"
            type="number"
            value={propagatorArgs.start ?? defaultTime}
            onChange={handleSimChangeNumber}
          />
        </InlineField>
        <InlineField
          label="Runcount"
          tooltip="Number of discrete timesteps to take. The propagator will return one telem set for every timestep. Total runtime of the propagator will be runcount*simdt seconds."
        >
          <Input name="runcount" type="number" value={propagatorArgs.runcount ?? 1} onChange={handleSimChangeNumber} />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField
          label="Sim dt"
          tooltip="Time delta of the propagator in seconds. The propagator will return one telem set for every timestep. Total runtime of the propagator will be runcount*simdt seconds."
        >
          <Input name="simdt" type="number" value={propagatorArgs.simdt ?? 0} onChange={handleSimChangeNumber} />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <Tooltip placement="top" content={'Fields for the propagator to return.'}>
          <div style={{ width: '100%', maxWidth: '40em', height: 'auto' }}>
            <MultiSelect
              options={generateTelemSelect(telemList)}
              value={generateTelemSelect(propagatorArgs.telem) ?? []}
              onChange={(telems) => {
                setPropagatorArgs((propArgs) => {
                  return {
                    ...propArgs,
                    telem: telems.map((telem) => {
                      return telem.value as telemType;
                    }),
                  };
                });
              }}
            />
          </div>
        </Tooltip>
      </InlineFieldRow>
    </div>
  );
};
