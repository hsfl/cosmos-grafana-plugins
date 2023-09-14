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

  const SunSensor = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        {/*Sun Sensor*/}
        <VerticalGroup>
          <HorizontalGroup>
        <div className="quadrant-container">
      <div className="quadrant-row">
        <div className="quadrant">
          <input style={orbitStyle} type="text" placeholder="Quadrant 1" />
        </div>
        <div className="quadrant-vertical-line"></div>
        <div className="quadrant">
          <input style={orbitStyle} type="text" placeholder="Quadrant 2" />
        </div>
      </div>
      <div className="quadrant-horizontal-line"></div>
      <div className="quadrant-row">
        <div className="quadrant">
          <input style={orbitStyle} type="text" placeholder="Quadrant 3" />
        </div>
        <div className="quadrant-vertical-line"></div>
        <div className="quadrant">
          <input style={orbitStyle} type="text" placeholder="Quadrant 4" />
        </div>
      </div>
    </div>
      <VerticalGroup>
      <text className='smaller-font'>{"Azimuth (Deg)"}</text>
      <input style={orbitStyle} type="text" value="" />
      <text className='smaller-font'>{"Elevation (Deg)"}</text>
      <input style={orbitStyle} type="text" value="" />
      </VerticalGroup>
    </HorizontalGroup>
    </VerticalGroup>
      </div>
    );
  };

  export default SunSensor;

