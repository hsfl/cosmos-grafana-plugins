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
const smallerStyle = {
  width: '50px',
  height: '15px', 
  fontSize: '10px', 
  color: '#32CD32',
};

  const EstimatedStates = () => {
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
    {/*GPS*/}
    <VerticalGroup>
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
    </VerticalGroup>
    {/*Controls*/}
    <VerticalGroup>
      <HorizontalGroup>
      <text style={{marginLeft: '70px'}} className='smaller-font'>{"Torque (Nm)"}</text>
      <text style={{marginLeft: '10px'}} className='smaller-font'>{"Current (A)"}</text>
      </HorizontalGroup>
      <HorizontalGroup>
      <text className='smaller-font'>{"Torqurod 1"}</text>
      <input style={orbitStyle} type="text" value="" />
      <input style={orbitStyle} type="text" value="" />
      </HorizontalGroup>
      <HorizontalGroup>
      <text className='smaller-font'>{"Torqurod 2"}</text>
      <input style={orbitStyle} type="text" value="" />
      <input style={orbitStyle} type="text" value="" />
      </HorizontalGroup>
      <HorizontalGroup>
      <text className='smaller-font'>{"Torqurod 3"}</text>
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
    {/*Estimated States*/}
    <VerticalGroup>
    <text className='smaller-font'>{"Total Attitude Matrix"}</text>
      <HorizontalGroup>
      <input style={smallerStyle} type="text" value="" />
      <input style={smallerStyle} type="text" value="" />
      <input style={smallerStyle} type="text" value="" />
      </HorizontalGroup>
      <HorizontalGroup>
      <input style={smallerStyle} type="text" value="" />
      <input style={smallerStyle} type="text" value="" />
      <input style={smallerStyle} type="text" value="" />
      </HorizontalGroup>
      <HorizontalGroup>
      <input style={smallerStyle} type="text" value="" />
      <input style={smallerStyle} type="text" value="" />
      <input style={smallerStyle} type="text" value="" />
      </HorizontalGroup>
    </VerticalGroup>
    <VerticalGroup>
    <text className='smaller-font'>{"Total Angular Velocity"}</text>
    <HorizontalGroup>
    <text className='smaller-font'>{"X (Deg/s)"}</text>
    <input style={orbitStyle} type="text" value="" />
    </HorizontalGroup>
    <HorizontalGroup>
    <text className='smaller-font'>{"Y (Deg/s)"}</text>
    <input style={orbitStyle} type="text" value="" />
    </HorizontalGroup>
    <HorizontalGroup>
    <text className='smaller-font'>{"Z (Deg/s)"}</text>
    <input style={orbitStyle} type="text" value="" />
    </HorizontalGroup>
    </VerticalGroup>
    <VerticalGroup>
    <text className='smaller-font'>{"Position"}</text>
    <HorizontalGroup>
    <text className='smaller-font'>{"Lat. (Deg)"}</text>
    <input style={orbitStyle} type="text" value="" />
    </HorizontalGroup>
    <HorizontalGroup>
    <text className='smaller-font'>{"Long. (Deg)"}</text>
    <input style={orbitStyle} type="text" value="" />
    </HorizontalGroup>
    <HorizontalGroup>
    <text className='smaller-font'>{"Alt. (m)"}</text>
    <input style={orbitStyle} type="text" value="" />
    </HorizontalGroup>
    </VerticalGroup>
      </div>
    );
  };

  export default EstimatedStates;

