import React, { useEffect, useRef, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { BarOrientation, SimpleOptions, Labels } from './types';
import { BarGaugeRow } from './components/BarGaugeRow';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig, eventBus }) => {
  const [bcregLabels, setBcregLabels] = useState<Labels>({});
  const [battLabels, setBattLabels] = useState<Labels>({});
  const refBcregSeriesIdx = useRef<number | undefined>(undefined);
  const refBattSeriesIdx = useRef<number | undefined>(undefined);

  useEffect(() => {
    refBcregSeriesIdx.current = undefined;
    refBattSeriesIdx.current = undefined;

    // See assumptions at the bottom of this file,
    // with one additional caveat: same node for different tables are in separate series
    for (let i = 0; i < data.series.length; i++) {
      const type = data.series[i]?.meta?.custom?.type;
      if (type === undefined) {
        continue;
      }
      if (type === 'batt') {
        refBattSeriesIdx.current = i;
      } else if (type === 'bcreg') {
        refBcregSeriesIdx.current = i;
      }
    }

    // This sets up the bcregLabel for the solar panel components to use
    if (refBcregSeriesIdx.current !== undefined && data.series[refBcregSeriesIdx.current] !== undefined) {
      const bidx = refBcregSeriesIdx.current;
      const newLabels: Labels = {};

      // Iterate over every column
      // Skip the 0th field, which is time column
      const fields = data.series[bidx].fields;
      for (let i = 1; i < fields.length; i++) {
        // Only interested in mpptin_amp column
        if (fields[i].name !== 'mpptin_amp') {
          continue;
        }
        const labels = fields[i].labels;
        if (labels === undefined || !('name' in labels)) {
          continue;
        }
        // Grab everything but the numeric suffix
        let label = labels.name;
        // Index of first character of numeric suffix (eg: for 'asdf1', return 4)
        let suffixIdx = label.search(/\d/);
        if (suffixIdx > 1) {
          // Check if character before that is non-alphabetic (eg: for 'asdf_1'), if so, remove that too
          if (suffixIdx > 1 && /^[^a-z0-9]$/i.test(label[suffixIdx - 1])) {
            suffixIdx -= 1;
          }
          // Truncate suffix
          label = label.slice(0, suffixIdx);
        }
        // Push the column index to the label
        // All columns with the same label (ie: the name without the suffix) will be together
        if (newLabels[label] === undefined) {
          newLabels[label] = [i];
        } else {
          newLabels[label].push(i);
        }
      }
      setBcregLabels(newLabels);
    }

    // This sets up for the battery component to use
    if (refBattSeriesIdx.current !== undefined && data.series[refBattSeriesIdx.current] !== undefined) {
      const bidx = refBattSeriesIdx.current;
      const newLabels: Labels = {};
      // Iterate over every column
      // Skip the 0th field, which is time column
      const fields = data.series[bidx].fields;
      for (let i = 1; i < fields.length; i++) {
        // Only interested in percentage column
        if (fields[i].name !== 'percentage') {
          continue;
        }
        const labels = fields[i].labels;
        if (labels === undefined || !('name' in labels)) {
          continue;
        }
        // Grab everything but the numeric suffix
        let label = labels.name;
        // Index of first character of numeric suffix (eg: for 'asdf1', return 4)
        let suffixIdx = label.search(/\d/);
        if (suffixIdx > 1) {
          // Check if character before that is non-alphabetic (eg: for 'asdf_1'), if so, remove that too
          if (suffixIdx > 1 && /^[^a-z0-9]$/i.test(label[suffixIdx - 1])) {
            suffixIdx -= 1;
          }
          // Truncate suffix
          label = label.slice(0, suffixIdx);
        }
        // Push the column index to the label
        // All columns with the same label (ie: the name without the suffix) will be together
        if (newLabels[label] === undefined) {
          newLabels[label] = [i];
        } else {
          newLabels[label].push(i);
        }
      }
      setBattLabels(newLabels);
    }
  }, [data]);
  // Batt row needs: time col, n cols of battery values

  return (
    <div style={{ width: width, height: height, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {Object.keys(bcregLabels).map((key, i) => {
        return (
          <div key={`row-${key}`} style={{ display: 'flex', flexDirection: 'column' }}>
            {key}
            <BarGaugeRow
              width={20}
              height={20}
              bidx={refBcregSeriesIdx.current}
              orientation={BarOrientation.vertical}
              filteredLabels={bcregLabels[key] !== undefined ? bcregLabels[key] : []}
              data={data}
              eventBus={eventBus}
            />
          </div>
        );
      })}
      {Object.keys(battLabels).map((key, i) => {
        return (
          <div key={`row-${key}`} style={{ display: 'flex', flexDirection: 'column' }}>
            {key}
            <BarGaugeRow
              width={80}
              height={40}
              bidx={refBattSeriesIdx.current}
              orientation={BarOrientation.horizontal}
              filteredLabels={battLabels[key] !== undefined ? battLabels[key] : []}
              data={data}
              eventBus={eventBus}
            />
          </div>
        );
      })}
    </div>
  );
};

// Todo:
// Also, the case of no suffixes

// Assumptions:
//
// Series will be grouped by node (eventually will probably all be consolidated into one series?)
// i.e., series[0].name = 'mother', series[1].name = 'child01', etc.
// The table type of the series is stored in meta.custom.type
// The name of the contained fields is the column name
// The labels of the field contains the human readable name of the device and the node_name
