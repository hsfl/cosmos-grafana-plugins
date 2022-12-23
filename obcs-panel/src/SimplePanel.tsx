import React from 'react'; //{ useState}
import { PanelProps } from '@grafana/data';
import { Input, InlineField, InlineFieldRow } from '@grafana/ui'; //Card, RadioButtonGroup
import { BarGauge } from './components/BarGauge';
import { BarOrientation, SimpleOptions /*currentMJD*/ } from './types';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, eventBus }) => {
  const useTimeMode = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div>Free SSDR</div>
        <InlineFieldRow>
          <InlineField shrink>
            <Input name="start" type="text" value={46.2 + '%'} />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField shrink>
            <Input name="start" type="text" value={153.044 + ' MB'} />
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField shrink>
            <Input name="start" type="number" value={148} />
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
