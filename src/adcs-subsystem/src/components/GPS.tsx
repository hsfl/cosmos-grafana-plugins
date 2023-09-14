import { HorizontalGroup, VerticalGroup } from '@grafana/ui';
import React from 'react';
//import { PanelProps } from '@grafana/data';
import './styles.css';

const orbitStyle = {
  width: '75px',
  height: '15px', 
  fontSize: '10px', 
  color: '#32CD32',
};

  const GPS = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        {/*GPS*/}
    <HorizontalGroup>
        <text className='smaller-font'>{"Sampling Rate (Hz)"}</text>
        <input style={orbitStyle} type="text" value="" />
    </HorizontalGroup>
    <HorizontalGroup>
        <VerticalGroup>
            <HorizontalGroup>
            <text className='smaller-font'>{"X (m)"}</text>
            <input style={orbitStyle} type="text" value="" />
            </HorizontalGroup>
            <HorizontalGroup>
            <text className='smaller-font'>{"Y (m)"}</text>
            <input style={orbitStyle} type="text" value="" />
            </HorizontalGroup>
            <HorizontalGroup>
            <text className='smaller-font'>{"Z (m)"}</text>
            <input style={orbitStyle} type="text" value="" />
            </HorizontalGroup>
        </VerticalGroup>
        <VerticalGroup>
            <HorizontalGroup>
            <text className='smaller-font'>{"Lat. (Deg)"}</text>
            <input style={{ ...orbitStyle, marginLeft: '12px' }} type="text" value="" />
            </HorizontalGroup>
            <HorizontalGroup>
            <text className='smaller-font'>{"Long. (Deg)"}</text>
            <input style={orbitStyle} type="text" value="" />
            </HorizontalGroup>
            <HorizontalGroup>
            <text className='smaller-font'>{"Alt. (Deg)"}</text>
            <input style={{ ...orbitStyle, marginLeft: '11px' }} type="text" value="" />
            </HorizontalGroup>
        </VerticalGroup>
    </HorizontalGroup>
      </div>
    );
  };

  export default GPS;

