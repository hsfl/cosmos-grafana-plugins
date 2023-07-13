import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { AntennaPlot } from './AntennaPlot';
import Header from './AntennaHeader';
import GroundStation from './GroundStation';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  return (
    <div>
      <Header />
      <AntennaPlot width={width} height={height} />
      <GroundStation />
    </div>
  );
};
