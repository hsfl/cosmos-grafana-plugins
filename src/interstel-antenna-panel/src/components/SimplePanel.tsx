import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { AntennaPlot } from './AntennaPlot';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  return (
    <div>
      <AntennaPlot width={width} height={height} />
    </div>
  );
};
