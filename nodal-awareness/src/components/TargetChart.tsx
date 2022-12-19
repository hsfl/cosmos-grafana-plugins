import React from 'react';
import { Input } from '@grafana/ui';

export const TargetChart = (props: { width: number; height: number }) => {
  return (
    <div
      style={{
        alignItems: 'center',
        alignContent: 'start',
        justifyItems: 'center',
        textAlign: 'center',
        display: 'grid',
        gridTemplateRows: 'auto auto auto',
        gridTemplateColumns: '1fr 3em 3em 3em 3em 3em 3em',
        // width: props.width,
        // height: props.height,
        overflow: 'scroll'
      }}
    >
      {/** Column labels */}
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 2 }}>Type</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 3 }}>Lat</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 4 }}>Lon</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 5 }}>Alt</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 6 }}>Slant Range</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 7 }}>Elev</div>

      {/** Row label */}
      {['kauaicc', 'fairbanks', 'surreysc'].map((val, i) => {
        return (
          <div key={`na-target-header-${val}`} style={{ gridRow: i + 2, gridColumn: 1, marginInlineEnd: '1em' }}>
            {val}
          </div>
        );
      })}
      {/** Row cells */}
      {['kauaicc', 'fairbanks', 'surreysc'].map((target, ti) =>
        [0, 1, 2, 3, 4, 5].map((col, ci) => (
          <div key={`na-target-row-${target}-${ti}-${ci}`} style={{ gridRow: ti + 2, gridColumn: ci + 2 }}>
            <Input type="text" />
          </div>
        ))
      )}
    </div>
  );
};
