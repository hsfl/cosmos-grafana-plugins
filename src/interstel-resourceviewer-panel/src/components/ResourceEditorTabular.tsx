import React from 'react';
import { Input } from '@grafana/ui'

// A component for displaying the table-editor view for
// changing the resource usage levels for each timestep.

export const ResourceEditorTabular = (props: {
  // Timestamps
  domain: number[],
  // Resource usage rows
  dataSeries: {[name: string]: number[]},
  // Sets state of resource usage rows, calls setDataSeries
  setData: (name: string, idx: number, value: number) => void
  width: number,
  height: number
}) => {
  const { domain, dataSeries, setData, width, height } = props;

  // Callback for when user changes a value in a cell for the resource usage value
  // name: resource dataseries key name
  // i: Index of value changed in number[] of dataseries
  // event: Input change event
  const onValueChange = (name: string, idx: number, event: React.FormEvent<HTMLInputElement>) => {
    const val = Number(event.currentTarget.value);
    event.currentTarget.value = val.toString();
    setData(name, idx, val);
  };

  return (
    <div
      style={{
        width: width,
        height: height,
        overflow: 'scroll',
        alignItems: 'center',
        justifyItems: 'center',
        textAlign: 'center',
        display: 'grid',
        columnGap: '1em',
        gridTemplateRows: 'auto',
        gridTemplateColumns: 'auto',
      }}
    >
      {/* Time */}
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 1 }}>Time</div>
      {
        domain.map((v,i) => (
          <div key={`cell-c${1}-r${i+2}`} style={{ gridRow: i+2, gridColumn: 1 }}>
            {v}
          </div>
        ))
      }
      {/* Resources Headings */}
      {
        Object.keys(dataSeries).map((name, name_idx) => (
          // Iterate over every timestep and its cumulative resource value
          // Grid format starts at 1, hence the +2 offset, since Time is col 1
          <div key={`cell-c${name_idx+2}-r${1}`} style={{ fontSize: '0.8em', gridRow: 1, gridColumn: name_idx+2 }}>{name}</div>
        ))
      }
      {/* Resource Rows */}
      {
        // Iterate over every resource name
        Object.keys(dataSeries).map((name, name_idx) => (
          // Iterate over every timestep and its cumulative resource value
          dataSeries[name].map((v,i) => (
            <div key={`cell-c${name_idx+2}-r${i+2}`} style={{ gridRow: i+2, gridColumn: name_idx+2 }}>
              <Input type="number" defaultValue={v} onChange={e => onValueChange(name, i, e)} />
            </div>
          ))
        ))
      }
    </div>
  );
}
