import React from 'react';
import { PanelData } from '@grafana/data';

const eventStyle = {
  width: '200pxpx',
  height: '70px',
  fontSize: '10px',
};

const GroundStation = (props: { data: PanelData }) => {
  let gsString;
  if (props.data.series === undefined || props.data.series.length === 0 || props.data.series[0].fields === undefined) {
    gsString = ['GS\t\tElevation\t\tRange\nKCC\t\t\t\t\t\nUAF\t\t\t\t\t\nSSC\t\t\t\t\t'];
  } else {
    //Alphabetizing data since it comes in in random orders currently
    const dataArray = [];
    for (let i = 0; i < props.data.series.length; i++) {
      dataArray.push(props.data.series[i]);
    }

    dataArray.sort((a, b) => {
      const nameA = a.name!.toUpperCase();
      const nameB = b.name!.toUpperCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    const rangeValues = [
      dataArray[1].fields[4].values.get(0).toFixed(6),
      dataArray[3].fields[4].values.get(0).toFixed(6),
      dataArray[5].fields[4].values.get(0).toFixed(6),
    ];
    const elevationValues = [
      dataArray[1].fields[3].values.get(0).toFixed(6),
      dataArray[3].fields[3].values.get(0).toFixed(6),
      dataArray[5].fields[3].values.get(0).toFixed(6),
    ];

    gsString = `GS\t\tElevation\t\tRange\nKCC\t\t${elevationValues[0]}\t${rangeValues[0]}\nUAF\t\t${elevationValues[1]}\t${rangeValues[1]}\nSSC\t\t${elevationValues[2]}\t${rangeValues[2]}`;
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
      <textarea style={eventStyle} value={gsString} />
    </div>
  );
};

export default GroundStation;
