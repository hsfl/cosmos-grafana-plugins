import React, { useEffect, useMemo, useState } from 'react';
import { PanelData, PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
//import letterFrequency, { LetterFrequency } from '@visx/mock-data/lib/mocks/letterFrequency';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';

interface Props extends PanelProps<SimpleOptions> {}

//const dataLetter = letterFrequency.slice(5);

// accessors
// const getLetter = (d: LetterFrequency) => d.letter;
// const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency) * 100;
// console.log('thing:',dataLetter.map(getLetter));

interface SolarPanelRowProps {
  time?: any,
  solars?: any,
  /** Array of field indices into data for desired label */
  filteredLabels: number[],
  /** Reference to query data */
  data: PanelData,
  /** Width of one little bar gauge */
  width: number,
  /** Height of one little bar gauge */
  height: number,
}

// Row of solar panel values
const SolarPanelRow = (props: SolarPanelRowProps) => {
  const {width, height, filteredLabels, data} = props;
  const numGraphs = filteredLabels.length;
  const verticalMargin = 0;//height * .4;
  // Bounds
  const xMax = width*numGraphs;
  const yMax = height + verticalMargin;
  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: filteredLabels.map(i=>`thing${i}`),
        padding: 0.1,
      }),
    [xMax, filteredLabels],
  );
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        // TODO: fix max value, current using 5
        domain: [0, 5],
      }),
    [yMax],
  );
  //console.log(filteredLabels, numGraphs, filteredLabels.map(i=>`thing${i}`), xScale(`thing7`));
  if (numGraphs === 0) {
    return null;
  }
  return (
    <svg width={xMax} height={yMax}>
      <Group>
        {filteredLabels.map((i: any) => {
          const barWidth = xScale.bandwidth();
          const idxOfValue = data.series[0].fields[i].values.length - 1;
          const barHeight = yMax - (yScale(data.series[0].fields[i].values.get(idxOfValue) ?? 0));
          const barX = xScale(`thing${i}`);
          const barY = yMax - barHeight;
          return (
            <Group key={`bar-${i}`}>
              <rect
                x={barX}
                width={barWidth}
                height={yMax}
                fill="rgba(200, 200, 200, 0.9)"
              />
              <Bar
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="rgba(255, 255, 0, 0.9)"
              />
            </Group>
          );
        })}
      </Group>
    </svg>
  );
};

// Interface for a dict of arrays
// Key will be the label name, which points to an array of indices into the data.series[].fields array which share the same label
interface Labels {
  [key: string]: number[]
}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig }) => {
  const [labels, setLabels] = useState<Labels>({});

  useEffect(() => {
    // This big thing here creates the whole labels dict
    if (data.series.length && data.series[0].fields.length > 1) {
      const newLabels: Labels = {};
      // Iterate over every column
      // Skip the 0th field, it's the Time column. That or I should probably check for name == 'Time' or 'time'
      for (let i=1; i < data.series[0].fields.length; i++) {
        if (data.series[0].fields[i].labels === undefined) {
          continue;
        }
        for (let key in data.series[0].fields[i].labels) {
          // Grab everything but the numeric suffix
          let label = data.series[0].fields[i].labels![key];
          // Index of first character of numeric suffix (eg: for 'asdf1', return 4)
          let suffixIdx = label.search(/\d/);
          // Check if character before that is non-alphabetic (eg: for 'asdf_1'), if so, remove that too
          if (suffixIdx > 1 && /^[^a-z0-9]$/i.test(label[suffixIdx-1])) {
            suffixIdx -= 1;
          }
          // Truncate suffix
          label = label.slice(0, suffixIdx);
          // Push the column index to the label
          // All columns with the same label (ie: the name without the suffix) will be together
          if (newLabels[label] === undefined) {
            newLabels[label] = [i];
          } else {
            newLabels[label].push(i);
          }
          // There is only one label key per field object as far as I can tell, so just break out
          break;
        }
      }
      console.log(newLabels);
      setLabels(newLabels);
    }
  }, [data]);
  // Batt row needs: time col, n cols of battery values

  return (
    <div style={{ width: width, height: height, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {
        Object.keys(labels).map((key, i) => {
          return (
            <div key={`row-${key}`} style={{ display: 'flex', flexDirection: 'column' }}>
              {key}
              <SolarPanelRow width={20} height={20} filteredLabels={labels[key] !== undefined ? labels[key] : []} data={data} />
            </div>
          );
        })
      }
      
    </div>
  );
};

// Todo: check no data case, we still probably want to display batteries (easiest, just keep labels but remove array indices)
// Also, the case of no suffixes
