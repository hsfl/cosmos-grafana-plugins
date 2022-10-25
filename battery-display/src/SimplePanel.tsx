import React, { useEffect, useRef, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { BarOrientation, SimpleOptions, Labels } from 'types';
import { BarGaugeRow } from 'components/BarGaugeRow';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, eventBus }) => {
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
              <BarGaugeRow width={20} height={20} bidx={refBcregSeriesIdx.current} orientation={BarOrientation.vertical} filteredLabels={bcregLabels[key] !== undefined ? bcregLabels[key] : []} data={data} eventBus={eventBus} />
            </div>
          );
        })
      }
      {
        Object.keys(battLabels).map((key, i) => {
          return (
            <div key={`row-${key}`} style={{ display: 'flex', flexDirection: 'column' }}>
              {key}
              <BarGaugeRow width={80} height={40} bidx={refBattSeriesIdx.current} orientation={BarOrientation.horizontal} filteredLabels={battLabels[key] !== undefined ? battLabels[key] : []} data={data} eventBus={eventBus} />
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
