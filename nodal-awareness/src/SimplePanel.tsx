import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { NodalAwarenessPlot } from './components/NodalAwarenessPlot';
import { TargetChart } from './components/TargetChart';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'row' }}>
      <NodalAwarenessPlot width={width*2/3} height={height} />
      <TargetChart />
      
    </div>
  );
};
