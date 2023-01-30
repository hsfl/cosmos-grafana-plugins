import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { MissionEventsDisplay } from './components/MED';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, eventBus, timeRange }) => {
  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'row' }}>
      <MissionEventsDisplay data={data} width={width} height={height} eventBus={eventBus} timeRange={timeRange} />
    </div>
  );
};