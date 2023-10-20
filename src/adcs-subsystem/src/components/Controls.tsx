import { HorizontalGroup, VerticalGroup } from '@grafana/ui';
import React from 'react';
import { RefMtr, RefRw } from 'types';
import './styles.css';

//Input Style
const orbitStyle = {
  width: '75px',
  height: '15px',
  fontSize: '10px',
  color: '#32CD32',
};

const Controls = (combList: { mtrList: React.MutableRefObject<RefMtr[]>, rwList: React.MutableRefObject<RefRw[]> }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
      {/*Controls*/}
      <VerticalGroup>
        <HorizontalGroup>
          <text style={{ marginLeft: '70px' }} className='smaller-font'>{"Torque (Nm)"}</text>
          <text style={{ marginLeft: '10px' }} className='smaller-font'>{"Current (A)"}</text>
        </HorizontalGroup>
        {combList.mtrList.current.map((mtrRef, i) => {
          return (
            <HorizontalGroup key={`mtr-${i}`}>
              <text className='smaller-font'>{`Torquerod ${i + 1}`}</text>
              <input ref={(ref) => (mtrRef['mtr_torq'] = ref)} style={orbitStyle} type="text" value="" />
              <input ref={(ref) => (mtrRef['mtr_a'] = ref)} style={orbitStyle} type="text" value="" />
            </HorizontalGroup>
          )
        })}
        <HorizontalGroup>
          <text style={{ marginLeft: '90px' }} className='smaller-font'>{"Torque (Nm)"}</text>
          <text style={{ marginLeft: '10px' }} className='smaller-font'>{"Speed (rpm)"}</text>
        </HorizontalGroup>
        {combList.rwList.current.map((rwRef, i) => {
          return (
            <HorizontalGroup key={`rw-${i}`}>
              <text className='smaller-font'>{`Reaction Wheel ${i + 1}`}</text>
              <input ref={(ref) => (rwRef['rw_torq'] = ref)} style={orbitStyle} type="text" value="" />
              <input ref={(ref) => (rwRef['rw_rpm'] = ref)} style={orbitStyle} type="text" value="" />
            </HorizontalGroup>
          )
        })}
      </VerticalGroup>
    </div>
  );
};

export default Controls;

