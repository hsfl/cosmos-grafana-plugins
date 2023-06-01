import React, { useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { NodalAwarenessPlot } from './components/NodalAwarenessPlot';
import { NodalAwarenessPlotText } from './components/NodalAwarenessPlotText';
import { TargetChart } from './components/TargetChart';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const [radialArray, setRadialArray] = useState<number[]>([0, 22.5, 45.0, 67.5]);

  const handleRadioButtonChange = (value: string) => {
    if (value === 'Az/Slant') {
      setRadialArray([1000, 750, 500, 250]);
    } else {
      setRadialArray([0, 22.5, 45.0, 67.5]);
    }
  };
  const plotWidth = Math.min((width * 2) / 3, height * 1.5);
  return (
    // TODO: fix plot/table relative spacing
    <div style={{ width, height, display: 'grid', gridTemplateColumns: 'auto auto auto' }}>
      <NodalAwarenessPlotText width={plotWidth} height={height} data={data} />
      <NodalAwarenessPlot width={plotWidth} height={height} data={data} radialArray={radialArray} />
      <TargetChart
        width={width / 3}
        height={height}
        data={data}
        radialArray={radialArray}
        onRadioButtonChange={handleRadioButtonChange}
      />
    </div>
  );
};
