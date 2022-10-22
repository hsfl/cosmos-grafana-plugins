import React, { useEffect, useMemo, useRef, useState } from 'react';
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

enum BarOrientation {
  vertical,
  horizontal
}

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
  /** Horizontal or Vertical */
  orientation: BarOrientation,
  /** Index for the query series in data to refer to. BCREG and BATT in separate series at the moment. See assumptions at the bottom of the file */
  bidx: number | undefined,
}

// Row of solar panel values
const SolarPanelRow = (props: SolarPanelRowProps) => {
  const {width, height, filteredLabels, data, orientation, bidx} = props;
  const numGraphs = filteredLabels.length;
  const verticalMargin = 0;//height * .4;
  // Bounds
  const xMax = width*numGraphs;
  const yMax = height + verticalMargin;
  // TODO: adjust maxBarSize horizontal width?
  const maxBarSize = orientation === BarOrientation.horizontal ? width : yMax;
  // TODO: fix max value, current using 5
  const maxValue = 5;
  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand<number>({
        range: [0, xMax],
        round: true,
        domain: filteredLabels,
        paddingInner: 0.1,
      }),
    [xMax, filteredLabels],
  );
  // Scale between 0 and end of bar's maximum value, in the direction of the orientation (i.e., barSize)
  const barScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, maxBarSize],
        round: true,
        domain: [0, maxValue],
        clamp: true,
      }),
    [maxBarSize],
  );
  //console.log(filteredLabels, numGraphs, filteredLabels.map(i=>`thing${i}`), xScale(`thing7`));
  if (numGraphs === 0 || bidx === undefined) {
    return null;
  }
  return (
    <svg width={xMax} height={yMax}>
      <Group>
        {filteredLabels.map((i: any) => {
          const idxOfValue = data.series[bidx].fields[i].values.length - 1;
          // The scaled 'extent' for the value of the bar (e.g., for a vertical orientation, the height of the bar)
          const barSize = barScale(data.series[bidx].fields[i].values.get(idxOfValue) ?? 0);
          // Note: x increases positive to the right, y increases positive downward, hence barY's vertical calculation
          // The starting X point
          const barX = xScale(i);
          // The starting Y point. Graph grows positive down
          const barY = orientation === BarOrientation.horizontal ? 0 : yMax - barSize;
          // The width of the graph (i.e., not of the containing bar)
          const graphWidth = xScale.bandwidth();
          // The height of the graph (i.e., not of the containing bar)
          const graphHeight = yMax;
          // The width of the scaled bar in the graph
          const barWidth = orientation === BarOrientation.horizontal ? barSize : graphWidth;
          // The height of the scaled bar in the graph 
          const barHeight = orientation === BarOrientation.horizontal ? yMax : barSize;

          return (
            <Group key={`bar-${i}`}>
              <rect
                x={barX}
                y={0}
                width={graphWidth}
                height={graphHeight}
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
  const [bcregLabels, setBcregLabels] = useState<Labels>({});
  const [battLabels, setBattLabels] = useState<Labels>({});
  const refBcregSeriesIdx = useRef<number | undefined>(undefined);
  const refBattSeriesIdx = useRef<number | undefined>(undefined);

  useEffect(() => {
    refBcregSeriesIdx.current = undefined;
    refBattSeriesIdx.current = undefined;

    // See assumptions at the bottom of this file
    for (let i = 0; i < data.series.length; i++) {
      if (data.series[i].refId === "batt") {
        refBattSeriesIdx.current = i;
      } else if (data.series[i].refId === "bcreg") {
        refBcregSeriesIdx.current = i;
      }
    }

    // This sets up the bcregLabel for the solar panel components to use
    if (refBcregSeriesIdx.current !== undefined) {
      const bidx = refBcregSeriesIdx.current;
      const newLabels: Labels = {};
      // Iterate over every column
      // Skip the 0th field, which is time column. That or I should probably check for name == 'Time' or 'time'
      for (let i=1; i < data.series[bidx].fields.length; i++) {
        if (data.series[bidx].fields[i].labels === undefined) {
          continue;
        }
        for (let key in data.series[bidx].fields[i].labels) {
          // Grab everything but the numeric suffix
          let label = data.series[bidx].fields[i].labels![key];
          // Commenting this out for now, since I don't have human readable alias/labels at the moment
          // Index of first character of numeric suffix (eg: for 'asdf1', return 4)
          // let suffixIdx = label.search(/\d/);
          // // Check if character before that is non-alphabetic (eg: for 'asdf_1'), if so, remove that too
          // if (suffixIdx > 1 && /^[^a-z0-9]$/i.test(label[suffixIdx-1])) {
          //   suffixIdx -= 1;
          // }
          // // Truncate suffix
          // label = label.slice(0, suffixIdx);
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
      setBcregLabels(newLabels);
    }

    // This sets up for the battery component to use
    if (refBattSeriesIdx.current !== undefined) {
      const bidx = refBattSeriesIdx.current;
      const newLabels: Labels = {};
      // Iterate over every column
      // Skip the 0th field, which is time column. That or I should probably check for name == 'Time' or 'time'
      for (let i=1; i < data.series[bidx].fields.length; i++) {
        if (data.series[bidx].fields[i].labels === undefined) {
          continue;
        }
        for (let key in data.series[bidx].fields[i].labels) {
          // Grab everything but the numeric suffix
          let label = data.series[bidx].fields[i].labels![key];
          // Commenting this out for now, since I don't have human readable alias/labels at the moment
          // Index of first character of numeric suffix (eg: for 'asdf1', return 4)
          // let suffixIdx = label.search(/\d/);
          // // Check if character before that is non-alphabetic (eg: for 'asdf_1'), if so, remove that too
          // if (suffixIdx > 1 && /^[^a-z0-9]$/i.test(label[suffixIdx-1])) {
          //   suffixIdx -= 1;
          // }
          // // Truncate suffix
          // label = label.slice(0, suffixIdx);
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
      setBattLabels(newLabels);
    }


  }, [data]);
  // Batt row needs: time col, n cols of battery values

  return (
    <div style={{ width: width, height: height, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {
        Object.keys(bcregLabels).map((key, i) => {
          return (
            <div key={`row-${key}`} style={{ display: 'flex', flexDirection: 'column' }}>
              {key}
              <SolarPanelRow width={20} height={20} bidx={refBcregSeriesIdx.current} orientation={BarOrientation.vertical} filteredLabels={bcregLabels[key] !== undefined ? bcregLabels[key] : []} data={data} />
            </div>
          );
        })
      }
      {
        Object.keys(battLabels).map((key, i) => {
          return (
            <div key={`row-${key}`} style={{ display: 'flex', flexDirection: 'column' }}>
              {key}
              <SolarPanelRow width={80} height={40} bidx={refBattSeriesIdx.current} orientation={BarOrientation.horizontal} filteredLabels={battLabels[key] !== undefined ? battLabels[key] : []} data={data} />
            </div>
          );
        })
      }
      
    </div>
  );
};

// Todo: check no data case, we still probably want to display batteries (easiest, just keep labels but remove array indices)
// Also, the case of no suffixes


// Assumptions:
// There will be two series, one with name bcreg and the other batt
// 
// Considering the eventuality of using a cosmos datasource:
// The name of the field is going to be an alias (eg: "amp") of the namespace name (eg: "device_whatever_amp")
// The label will be an alias for the human readable device name for the 
