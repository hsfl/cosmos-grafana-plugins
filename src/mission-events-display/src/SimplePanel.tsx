import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { MissionEventsDisplay } from './components/MED';
import { BlankMissionEventsDisplay } from './components/BlankMED';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, eventBus, timeRange }) => {
  if (data.series === undefined || data.series.length === 0 || data.series[0].fields === undefined) {
    return (
      <div style={{ width, height, display: 'flex', flexDirection: 'row' }}>
        <BlankMissionEventsDisplay width={width} height={height} />
      </div>
    );
  } else {
    return (
      <div style={{ width, height, display: 'flex', flexDirection: 'row' }}>
        <MissionEventsDisplay data={data} width={width} height={height} eventBus={eventBus} timeRange={timeRange} />
      </div>
    );
  }
};
