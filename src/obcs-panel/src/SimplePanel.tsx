import React from 'react';
import { PanelProps } from '@grafana/data';
import { Input, InlineField, InlineFieldRow } from '@grafana/ui';
import { BarGauge } from './components/BarGauge';
import { BarOrientation, SimpleOptions } from './types';
import { useCosmosTimeline, useDomUpdate } from './helpers/hooks';

interface Props extends PanelProps<SimpleOptions> {}

{
  /* <Button size="xs" style={{ background:green }}>
Flight Dynamics
</Button> */
}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, eventBus }) => {
  const [refInputs, updateDOMRefs] = useDomUpdate();
  useCosmosTimeline(data, eventBus, updateDOMRefs);

  const useTimeMode = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div>Free SSDR</div>
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
