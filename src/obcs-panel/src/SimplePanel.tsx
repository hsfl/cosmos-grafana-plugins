import React, { useEffect, useState } from 'react';
import { PanelProps, SelectableValue } from '@grafana/data';
import { Input, InlineField, InlineFieldRow, Select } from '@grafana/ui';
import { BarGauge } from './components/BarGauge';
import { BarOrientation, SimpleOptions, TimeEvent } from './types';
import { useCosmosTimeline, useDomUpdate } from './helpers/hooks';

interface Props extends PanelProps<SimpleOptions> {}

{
  /* <Button size="xs" style={{ background:green }}>
Flight Dynamics
</Button> */
}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, eventBus, timeRange }) => {
  // The selected cpu to display data for
  const [cpu, setCpu] = useState<SelectableValue<string>>();
  const [cpuSelectOptions, setCpuSelectOptions] = useState<Array<SelectableValue<string>>>([]);
  // Imperative animation hook -- the dictionary of refs and the animation callback function
  const [refInputs, updateDOMRefs] = useDomUpdate(cpu);
  useCosmosTimeline(data, eventBus, updateDOMRefs);

  // Data changes should cause rerender even without the timeline
  useEffect(() => {
    const dummyTimeEvent: TimeEvent = new TimeEvent({ time: timeRange.to.unix() });
    updateDOMRefs(data, dummyTimeEvent);
  }, [data, timeRange.to, updateDOMRefs]);

  // Update list of node options
  useEffect(() => {
    if (data.series.length === 0 || data.series[0].fields.length === 0) {
      return;
    }
    const cpuList: Array<SelectableValue<string>> = [];
    data.series[0].fields.forEach((field) => {
      const cpu_name = field.labels?.name;
      if (cpu_name === undefined) {
        return;
      }
      if (cpuList.findIndex((v) => v.label === cpu_name) === -1) {
        cpuList.push({ label: cpu_name });
      }
    });
    setCpuSelectOptions(cpuList);
    setCpu((prevCpu) => {
      if (cpuList.length === 0) {
        return prevCpu;
      }
      if (cpuList.findIndex((v) => v.label === prevCpu?.label) === -1) {
        return cpuList[0];
      }
      return prevCpu;
    });
  }, [data]);

  const useTimeMode = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row', paddingBottom: '0.25em' }}>
          <div style={{ paddingRight: '0.5em' }}>CPU:</div>
          <Select
            isClearable={false}
            isSearchable={false}
            value={cpu}
            options={cpuSelectOptions}
            onChange={setCpu}
            width="auto"
          />
        </div>
        <InlineFieldRow>
          <InlineField shrink>
            <Input ref={(ref) => (refInputs.current['load'] = ref)} type="text" value={0 + '%'} />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField shrink>
            <Input ref={(ref) => (refInputs.current['gib'] = ref)} type="text" value={0 + ' MB'} />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField shrink>
            <Input ref={(ref) => (refInputs.current['storage'] = ref)} type="text" value={0} />
          </InlineField>
        </InlineFieldRow>
      </div>
    );
  };

  const useBarGauge = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <BarGauge
          width={120}
          height={120}
          bidx={0}
          orientation={BarOrientation.vertical}
          cpu={cpu}
          data={data}
          eventBus={eventBus}
        />
        <div>Images</div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
      {useBarGauge()}
      {useTimeMode()}
      {/* {useNodeCard()} */}
    </div>
  );
};
