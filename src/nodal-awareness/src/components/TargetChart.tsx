import React from 'react';
import { InlineFieldRow, Input, Select } from '@grafana/ui';
import { PanelData } from '@grafana/data';

export const TargetChart = (props: { width: number; height: number; data: PanelData }) => {
  //const { data, width, height } = props;
  console.log(props.data.series[0].name);
  return (
    <div
      style={{
        alignItems: 'center',
        alignContent: 'start',
        justifyItems: 'center',
        textAlign: 'center',
        display: 'grid',
        gridTemplateRows: 'auto auto auto',
        gridTemplateColumns: '1fr 6em 6em 6em 6em 6em 6em',
        //width: props.width,
        //height: props.height,
        overflow: 'scroll',
      }}
    >
      <div>
        <InlineFieldRow>
          <Select
            value={{ label: 'ECI' }}
            options={[{ label: 'ECI' }, { label: 'ICRF' }, { label: 'GEOD' }, { label: 'GEOS' }, { label: 'LVLH' }]}
            onChange={() => {}}
            width="auto"
          />
        </InlineFieldRow>
      </div>
      {/** Column labels */}
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 2 }}>Type</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 3 }}>Lon</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 4 }}>Lat</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 5 }}>Alt</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 6 }}>Slant Range</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 7 }}>Elev</div>

      {/** Row label */}
      {/** Takes name from node data */}
      {[props.data.series[0].name, props.data.series[1].name, props.data.series[2].name].map((val, i) => {
        return (
          <div key={`na-target-header-${val}`} style={{ gridRow: i + 2, gridColumn: 1, marginInlineEnd: '1em' }}>
            {val}
          </div>
        );
      })}
      {/** Row cells */}
      {/** Node 1 */}
      <div style={{ gridRow: 2, gridColumn: 2 }}>
        <Input type="text" value={props.data.series[0].fields[4].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 3 }}>
        <Input type="text" value={props.data.series[0].fields[5].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 4 }}>
        <Input type="text" value={props.data.series[0].fields[6].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 5 }}>
        <Input type="text" value={props.data.series[0].fields[7].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 6 }}>
        <Input type="text" value={'?'}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 7 }}>
        <Input type="text" value={'?'}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 2 }}>
        <Input type="text" value={props.data.series[1].fields[4].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 3 }}>
        <Input type="text" value={props.data.series[1].fields[5].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 4 }}>
        <Input type="text" value={props.data.series[1].fields[6].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 5 }}>
        <Input type="text" value={props.data.series[1].fields[7].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 6 }}>
        <Input type="text" value={'?'}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 7 }}>
        <Input type="text" value={'?'}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 2 }}>
        <Input type="text" value={props.data.series[2].fields[4].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 3 }}>
        <Input type="text" value={props.data.series[2].fields[5].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 4 }}>
        <Input type="text" value={props.data.series[2].fields[6].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 5 }}>
        <Input type="text" value={props.data.series[2].fields[7].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 6 }}>
        <Input type="text" value={'?'}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 7 }}>
        <Input type="text" value={'?'}></Input>
      </div>
      {/* {['kauaicc', 'fairbanks', 'surreysc'].map((target, ti) =>
        [0, 1, 2, 3].map((col, ci) => (
          <div key={`na-target-row-${target}-${ti}-${ci}`} style={{ gridRow: ti + 2, gridColumn: ci + 2 }}>
            <Input type="text" value={props.data.series[0].fields[ci + 2].values.get(0)}></Input>
          </div>
        ))
      )} */}
    </div>
  );
};
