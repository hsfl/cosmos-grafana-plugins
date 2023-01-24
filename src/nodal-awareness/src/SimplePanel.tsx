import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { NodalAwarenessPlot } from './components/NodalAwarenessPlot';
import { TargetChart } from './components/TargetChart';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const plotWidth = Math.min((width * 2) / 3, height * 1.5);
  return (
    // TODO: fix plot/table relative spacing
    <div style={{ width, height, display: 'grid', gridTemplateColumns: 'auto auto' }}>
      <NodalAwarenessPlot width={plotWidth} height={height} />
      <TargetChart width={width / 3} height={height} />
    </div>
  );
};
