import { HorizontalGroup, VerticalGroup } from '@grafana/ui';
import React from 'react';
import { RefDict } from '../types';
import './styles.css';

//Input Style
const orbitStyle = {
  width: '75px',
  height: '15px',
  fontSize: '10px',
  color: '#32CD32',
};

const SunSensor = (refInputs: React.MutableRefObject<RefDict>) => {
  return (
    <div style={ { display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' } }>
      {/*Sun Sensor*/ }
      {/*Quadrants*/}
      <VerticalGroup>
        <HorizontalGroup>
          <div className="quadrant-container">
            <div className="quadrant-row">
              <div className="quadrant">
                <input ref={ (ref) => (refInputs.current['qva'] = ref) } style={ { ...orbitStyle, marginTop: '45px' } } type="text" placeholder="Quadrant 1" />
              </div>
              <div className="quadrant-vertical-line"></div>
              <div className="quadrant">
                <input ref={ (ref) => (refInputs.current['qvb'] = ref) } style={ { ...orbitStyle, marginTop: '45px' } } type="text" placeholder="Quadrant 2" />
              </div>
            </div>
            <div className="quadrant-horizontal-line"></div>
            <div className="quadrant-row">
              <div className="quadrant">
                <input ref={ (ref) => (refInputs.current['qvc'] = ref) } style={ orbitStyle } type="text" placeholder="Quadrant 3" />
              </div>
              <div className="quadrant-vertical-line"></div>
              <div className="quadrant">
                <input ref={ (ref) => (refInputs.current['qvd'] = ref) } style={ orbitStyle } type="text" placeholder="Quadrant 4" />
              </div>
            </div>
          </div>
          <VerticalGroup>
            {/*Azimuth Values*/}
            <text className='smaller-font'>{ "Azimuth (Deg)" }</text>
            <input ref={ (ref) => (refInputs.current['azi'] = ref) } style={ orbitStyle } type="text" value="" />
            {/*Elevation Values*/}
            <text className='smaller-font'>{ "Elevation (Deg)" }</text>
            <input ref={ (ref) => (refInputs.current['elev'] = ref) } style={ orbitStyle } type="text" value="" />
          </VerticalGroup>
        </HorizontalGroup>
      </VerticalGroup>
    </div>
  );
};

export default SunSensor;

