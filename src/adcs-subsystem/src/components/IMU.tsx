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

  const IMU = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        {/*IMU*/}
        <HorizontalGroup>
        <VerticalGroup>
            <HorizontalGroup>
            <text className='smaller-font'>q<span className="subscript">0</span></text>
            <input style={orbitStyle} type="text" value="" />
            </HorizontalGroup>
            <HorizontalGroup>
            <text className='smaller-font'>q<span className="subscript">1</span></text>
            <input style={orbitStyle} type="text" value="" />
            </HorizontalGroup>
            <HorizontalGroup>
            <text className='smaller-font'>q<span className="subscript">2</span></text>
            <input style={orbitStyle} type="text" value="" />
            </HorizontalGroup>
            <HorizontalGroup>
            <text className='smaller-font'>q<span className="subscript">3</span></text>
            <input style={orbitStyle} type="text" value="" />
            </HorizontalGroup>
        </VerticalGroup>
        <VerticalGroup style={{ marginRight: '10px' }}>
          <HorizontalGroup>
            <text className='smaller-font'> {"Acceleration (m/s"}<span className="superscript">2</span>{")"}</text>
            <text style={{marginLeft: '10px'}} className='smaller-font'> {"Magnetic Field (nT)"}</text>
          </HorizontalGroup>
        <HorizontalGroup>
            <text className='smaller-font'>X</text>
            <input style={orbitStyle} type="text" value="" />
            <input style={{ ...orbitStyle, marginLeft: '15px' }} type="text" value="" />
        </HorizontalGroup>
        <HorizontalGroup>
            <text className='smaller-font'>Y</text>
            <input style={orbitStyle} type="text" value="" />
            <input style={{ ...orbitStyle, marginLeft: '15px' }} type="text" value="" />
        </HorizontalGroup>
        <HorizontalGroup>
            <text className='smaller-font'>Z</text>
            <input style={orbitStyle} type="text" value="" />
            <input style={{ ...orbitStyle, marginLeft: '15px' }} type="text" value="" />
        </HorizontalGroup>
        </VerticalGroup>
        </HorizontalGroup>
      </div>
    );
  };

  export default IMU;

