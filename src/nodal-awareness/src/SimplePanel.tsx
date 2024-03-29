import React, { useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { NodalAwarenessPlot } from './components/NodalAwarenessPlot';
import { NodalAwarenessPlotText } from './components/NodalAwarenessPlotText';
import { TargetChart } from './components/TargetChart';
import { BlankNodalAwarenessPlot, BlankNodalAwarenessPlotText, BlankTargetChart } from './components/BlankNA';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const [radialArray, setRadialArray] = useState<number[]>([0, 22.5, 45.0, 67.5]);
  if (data.series === undefined || data.series.length === 0 || data.series[0].fields === undefined) {
    return (
      <div style={{ width, height, display: 'grid', gridTemplateColumns: 'auto auto auto' }}>
        <BlankNodalAwarenessPlotText width={width / 3} height={height} />
        <BlankNodalAwarenessPlot width={width / 3} height={height} />
        <BlankTargetChart width={width / 3} height={height} />
      </div>
    );
  } else {
    const dataArray = [];
    for (let i = 0; i < data.series.length; i++) {
      dataArray.push(data.series[i]);
    }

    dataArray.sort((a, b) => {
      const nameA = a.name!.toUpperCase();
      const nameB = b.name!.toUpperCase();

      if (nameA < nameB) {
        return -1; // a comes before b
      }
      if (nameA > nameB) {
        return 1; // a comes after b
      }
      return 0; // a and b have the same order
    });

    const dimMax = Math.min(width, height);
    const ringIdx = radialArray.length;
    const tickSpacing = dimMax / 2 / (radialArray.length + 1);
    const concentricR = tickSpacing * ringIdx;
    //distance from center of concentric rings to indicator dot using elevation
    const nodeR = ((90 - Math.abs(dataArray[1].fields[3].values.get(0)) * (180 / Math.PI)) / 90) * concentricR;
    //distance from center of concentric rings to indicator dot using slant range
    const nodeRSlant = (Math.abs(dataArray[1].fields[4].values.get(0)) / 2000) * concentricR;
    let dotRadius = nodeR;

    const handleRadioButtonChange = (value: string) => {
      if (value === 'Az/Slant') {
        setRadialArray([2000, 1500, 1000, 500]);
        dotRadius = nodeRSlant;
      } else {
        setRadialArray([0, 22.5, 45.0, 67.5]);
        dotRadius = nodeR;
      }
    };

    const plotWidth = Math.min((width * 2) / 3, height * 1.5);
    return (
      // TODO: fix plot/table relative spacing
      <div style={{ width, height, display: 'grid', gridTemplateColumns: 'auto auto auto' }}>
        <NodalAwarenessPlotText width={plotWidth} height={height} data={data} />
        <NodalAwarenessPlot
          width={plotWidth}
          height={height}
          data={data}
          radialArray={radialArray}
          dotRadius={dotRadius}
        />
        <TargetChart
          width={width / 3}
          height={height}
          data={data}
          radialArray={radialArray}
          onRadioButtonChange={handleRadioButtonChange}
        />
      </div>
    );
  }
};
