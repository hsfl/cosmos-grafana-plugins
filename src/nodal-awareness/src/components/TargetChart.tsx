import React, { useState } from 'react';
import { Input, RadioButtonGroup, Select } from '@grafana/ui';
import { PanelData, SelectableValue } from '@grafana/data';

export const TargetChart = (props: {
  width: number;
  height: number;
  data: PanelData;
  radialArray: number[];
  onRadioButtonChange: (value: string) => void;
}) => {
  //const { data, width, height } = props;
  console.log(props.data);
  const defaultOptions = [
    { label: 'Az/Elev', value: 'Az/Elev' },
    { label: 'Az/Slant', value: 'Az/Slant' },
  ];
  const [, setValue] = useState<SelectableValue<string>>();
  const [selected, setSelected] = useState<string>(defaultOptions[0].value!);

  {
    /* For when data was coming in random orders*/
  }
  const dataArray = [];
  for (let i = 0; i < props.data.series.length; i++) {
    dataArray.push(props.data.series[i]);
  }

  dataArray.sort((a, b) => {
    const nameA = a.name!.toUpperCase(); // Convert names to uppercase for case-insensitive sorting
    const nameB = b.name!.toUpperCase();

    if (nameA < nameB) {
      return -1; // a comes before b
    }
    if (nameA > nameB) {
      return 1; // a comes after b
    }
    return 0; // a and b have the same order
  });

  console.log(dataArray);
  // const sortedNames = names.sort();

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
        <Select
          value={{ label: 'ECI' }}
          options={[{ label: 'ECI' }, { label: 'ICRF' }, { label: 'GEOD' }, { label: 'GEOS' }, { label: 'LVLH' }]}
          onChange={(v) => {
            setValue(v.value);
          }}
          width="auto"
        />
      </div>
      {/** Column labels */}
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 2 }}>Type</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 3 }}>Lon</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 4 }}>Lat</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 5 }}>Alt</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 6 }}>Slant Range</div>
      <div style={{ fontSize: '0.8em', gridRow: 1, gridColumn: 7 }}>Elev</div>

      {/** Row label */}

      {/** Takes name from node data (This was for when data was coming in in random orders, leaving in case we need again) */}
      {/* {[sortedNames[0], sortedNames[1], sortedNames[2]].map((val, i) => {
        return (
          <div key={`na-target-header-${val}`} style={{ gridRow: i + 2, gridColumn: 1, marginInlineEnd: '1em' }}>
            {val}
          </div>
        );
      })} */}

      {[dataArray[1].name, dataArray[3].name, dataArray[5].name].map((val, i) => {
        return (
          <div key={`na-target-header-${val}`} style={{ gridRow: i + 2, gridColumn: 1, marginInlineEnd: '1em' }}>
            {val}
          </div>
        );
      })}
      {/** Row cells */}
      {/** Node 1 */}
      <div style={{ gridRow: 2, gridColumn: 2 }}>
        <Input label="Type" type="text" value={dataArray[1].fields[2].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 3 }}>
        <Input label="Lon" type="text" value={dataArray[0].fields[4].values.get(0) * (180 / Math.PI)}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 4 }}>
        <Input label="Lat" type="text" value={dataArray[0].fields[3].values.get(0) * (180 / Math.PI)}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 5 }}>
        <Input label="Alt" type="text" value={dataArray[0].fields[5].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 6 }}>
        <Input label="Slant" type="text" value={dataArray[1].fields[4].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 2, gridColumn: 7 }}>
        <Input label="Elev" type="text" value={dataArray[1].fields[3].values.get(0) * (180 / Math.PI)}></Input>
      </div>
      {/* Node 2*/}
      <div style={{ gridRow: 3, gridColumn: 2 }}>
        <Input label="Type" type="text" value={dataArray[3].fields[2].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 3 }}>
        <Input label="Lon" type="text" value={dataArray[2].fields[4].values.get(0) * (180 / Math.PI)}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 4 }}>
        <Input label="Lat" type="text" value={dataArray[2].fields[3].values.get(0) * (180 / Math.PI)}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 5 }}>
        <Input label="Alt" type="text" value={dataArray[2].fields[5].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 6 }}>
        <Input label="Slant" type="text" value={dataArray[3].fields[4].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 3, gridColumn: 7 }}>
        <Input label="Elev" type="text" value={dataArray[3].fields[3].values.get(0) * (180 / Math.PI)}></Input>
      </div>
      {/* Node 3*/}
      <div style={{ gridRow: 4, gridColumn: 2 }}>
        <Input label="Type" type="text" value={dataArray[5].fields[2].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 3 }}>
        <Input label="Lon" type="text" value={dataArray[4].fields[4].values.get(0) * (180 / Math.PI)}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 4 }}>
        <Input label="Lat" type="text" value={dataArray[4].fields[3].values.get(0) * (180 / Math.PI)}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 5 }}>
        <Input label="Alt" type="text" value={dataArray[4].fields[5].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 6 }}>
        <Input label="Slant" type="text" value={dataArray[5].fields[4].values.get(0)}></Input>
      </div>
      <div style={{ gridRow: 4, gridColumn: 7 }}>
        <Input label="Elev" type="text" value={dataArray[5].fields[3].values.get(0) * (180 / Math.PI)}></Input>
      </div>
      {/* {['kauaicc', 'fairbanks', 'surreysc'].map((target, ti) =>
        [0, 1, 2, 3].map((col, ci) => (
          <div key={`na-target-row-${target}-${ti}-${ci}`} style={{ gridRow: ti + 2, gridColumn: ci + 2 }}>
            <Input type="text" value={dataArray[0].fields[ci + 2].values.get(0)}></Input>
          </div>
        ))
      )} */}
      {/* Az/Elev, Az/Slant Option*/}
      <div style={{ marginBottom: '32px' }}>
        <RadioButtonGroup
          options={defaultOptions}
          value={selected}
          onChange={(v) => {
            setSelected(v!);
            props.onRadioButtonChange(v!);
          }}
          size="sm"
        />
      </div>
    </div>
  );
};
export default TargetChart;
