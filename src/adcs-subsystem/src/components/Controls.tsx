import { HorizontalGroup, VerticalGroup } from '@grafana/ui';
import React from 'react';
import './styles.css';

//Input Style
const orbitStyle = {
  width: '75px',
  height: '15px', 
  fontSize: '10px', 
  color: '#32CD32',
};

  const Controls = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
    {/*Controls*/}
    <VerticalGroup>
      <HorizontalGroup>
      <text style={{marginLeft: '70px'}} className='smaller-font'>{"Torque (Nm)"}</text>
      <text style={{marginLeft: '10px'}} className='smaller-font'>{"Current (A)"}</text>
      </HorizontalGroup>
      <HorizontalGroup>
      <text className='smaller-font'>{"Torquerod 1"}</text>
      <input style={orbitStyle} type="text" value="" />
      <input style={orbitStyle} type="text" value="" />
      </HorizontalGroup>
      <HorizontalGroup>
      <text className='smaller-font'>{"Torquerod 2"}</text>
      <input style={orbitStyle} type="text" value="" />
      <input style={orbitStyle} type="text" value="" />
      </HorizontalGroup>
      <HorizontalGroup>
      <text className='smaller-font'>{"Torquerod 3"}</text>
      <input style={orbitStyle} type="text" value="" />
      <input style={orbitStyle} type="text" value="" />
      </HorizontalGroup>
      <HorizontalGroup>
      <text style={{marginLeft: '90px'}} className='smaller-font'>{"Torque (Nm)"}</text>
      <text style={{marginLeft: '10px'}} className='smaller-font'>{"Speed (rpm)"}</text>
      </HorizontalGroup>
      <HorizontalGroup>
      <text className='smaller-font'>{"Reaction Wheel"}</text>
      <input style={orbitStyle} type="text" value="" />
      <input style={orbitStyle} type="text" value="" />
      </HorizontalGroup>
    </VerticalGroup>
      </div>
    );
  };

  export default Controls;

