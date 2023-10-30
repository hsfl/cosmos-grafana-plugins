import { HorizontalGroup, VerticalGroup } from '@grafana/ui';
import React from 'react';
import { RefSsen } from '../types';
import './styles.css';

//Input Style
const orbitStyle = {
  width: '75px',
  height: '15px',
  fontSize: '10px',
  color: '#32CD32',
};

const SunSensor = (refInputs: React.MutableRefObject<RefSsen[]>) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
      {/*Sun Sensor*/}
      {refInputs.current.map((ssenRef, i) => {
        return (
          <VerticalGroup key={`ssen-${i}`}>
            <text >{`SSEN ${i + 1}`}</text>
            {/*Quadrants*/}
            <HorizontalGroup>
              <div className="quadrant-container">
                <div className="quadrant-row">
                  <div className="quadrant">
                    <input ref={(ref) => (ssenRef['qva'] = ref)} style={{ ...orbitStyle, marginTop: '45px' }} type="text" placeholder="Quadrant 1" />
                  </div>
                  <div className="quadrant-vertical-line"></div>
                  <div className="quadrant">
                    <input ref={(ref) => (ssenRef['qvb'] = ref)} style={{ ...orbitStyle, marginTop: '45px' }} type="text" placeholder="Quadrant 2" />
                  </div>
                </div>
                <div className="quadrant-horizontal-line"></div>
                <div className="quadrant-row">
                  <div className="quadrant">
                    <input ref={(ref) => (ssenRef['qvc'] = ref)} style={orbitStyle} type="text" placeholder="Quadrant 3" />
                  </div>
                  <div className="quadrant-vertical-line"></div>
                  <div className="quadrant">
                    <input ref={(ref) => (ssenRef['qvd'] = ref)} style={orbitStyle} type="text" placeholder="Quadrant 4" />
                  </div>
                </div>
              </div>
              <VerticalGroup>
                {/*Azimuth Values*/}
                <text className='smaller-font'>{"Azimuth (Deg)"}</text>
                <input ref={(ref) => (ssenRef['azi'] = ref)} style={orbitStyle} type="text" value="" />
                {/*Elevation Values*/}
                <text className='smaller-font'>{"Elevation (Deg)"}</text>
                <input ref={(ref) => (ssenRef['elev'] = ref)} style={orbitStyle} type="text" value="" />
              </VerticalGroup>
            </HorizontalGroup>
          </VerticalGroup>
        )
      })}
    </div>
  );
};

export default SunSensor;

