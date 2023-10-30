import { HorizontalGroup, VerticalGroup } from '@grafana/ui';
import React from 'react';
import { RefImu } from '../types';
import './styles.css';

const orbitStyle = {
  width: '75px',
  height: '15px',
  fontSize: '10px',
  color: '#32CD32',
};

const IMU = (refInputs: React.MutableRefObject<RefImu[]>) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
      {/*IMU*/}
      {refInputs.current.map((imuRef, i) => {
        return (
          <HorizontalGroup key={`imu-${i}`}>
            <text >{`IMU ${i + 1}`}</text>
            <VerticalGroup>
              {/*Quaternions*/}
              <HorizontalGroup>
                <text className='smaller-font'>q<span className="subscript">0</span></text>
                <input ref={(ref) => (imuRef['theta_x'] = ref)} style={orbitStyle} type="text" value="" />
              </HorizontalGroup>
              <HorizontalGroup>
                <text className='smaller-font'>q<span className="subscript">1</span></text>
                <input ref={(ref) => (imuRef['theta_y'] = ref)} style={orbitStyle} type="text" value="" />
              </HorizontalGroup>
              <HorizontalGroup>
                <text className='smaller-font'>q<span className="subscript">2</span></text>
                <input ref={(ref) => (imuRef['theta_z'] = ref)} style={orbitStyle} type="text" value="" />
              </HorizontalGroup>
              <HorizontalGroup>
                <text className='smaller-font'>q<span className="subscript">3</span></text>
                <input ref={(ref) => (imuRef['theta_w'] = ref)} style={orbitStyle} type="text" value="" />
              </HorizontalGroup>
            </VerticalGroup>
            <VerticalGroup style={{ marginRight: '10px' }}>
              <HorizontalGroup>
                <text className='smaller-font'> {"Acceleration (m/s"}<span className="superscript">2</span>{")"}</text>
                <text style={{ marginLeft: '10px' }} className='smaller-font'> {"Magnetic Field (nT)"}</text>
              </HorizontalGroup>
              <HorizontalGroup>
                <text className='smaller-font'>X</text>
                <input ref={(ref) => (imuRef['omega_x'] = ref)} style={orbitStyle} type="text" value="" />
                <input ref={(ref) => (imuRef['mag_x'] = ref)} style={{ ...orbitStyle, marginLeft: '15px' }} type="text" value="" />
              </HorizontalGroup>
              <HorizontalGroup>
                <text className='smaller-font'>Y</text>
                <input ref={(ref) => (imuRef['omega_y'] = ref)} style={orbitStyle} type="text" value="" />
                <input ref={(ref) => (imuRef['mag_y'] = ref)} style={{ ...orbitStyle, marginLeft: '15px' }} type="text" value="" />
              </HorizontalGroup>
              <HorizontalGroup>
                <text className='smaller-font'>Z</text>
                <input ref={(ref) => (imuRef['omega_z'] = ref)} style={orbitStyle} type="text" value="" />
                <input ref={(ref) => (imuRef['mag_z'] = ref)} style={{ ...orbitStyle, marginLeft: '15px' }} type="text" value="" />
              </HorizontalGroup>
            </VerticalGroup>
          </HorizontalGroup>
        )
      })}
    </div>
  );
};

export default IMU;

