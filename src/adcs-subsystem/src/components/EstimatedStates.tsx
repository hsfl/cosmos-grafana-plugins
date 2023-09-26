import { HorizontalGroup, VerticalGroup } from '@grafana/ui';
import React from 'react';
import './styles.css';
import { RefDict } from 'types';

//Input Style
const orbitStyle = {
  width: '75px',
  height: '15px',
  fontSize: '10px',
  color: '#32CD32',
};
//Smaller Input Style
const smallerStyle = {
  width: '50px',
  height: '15px',
  fontSize: '10px',
  color: '#32CD32',
};

const EstimatedStates = (refInputs: React.MutableRefObject<RefDict>) => {
  return (
    <div style={ { display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' } }>
      {/*Estimated States*/ }
      <VerticalGroup>
        <text className='smaller-font'>{"Total Attitude Matrix"}</text>
        <HorizontalGroup>
          <input ref={(ref) => (refInputs.current['s_b'] = ref)} style={smallerStyle} type="text" value="" />
          <input ref={(ref) => (refInputs.current['v_x'] = ref)} style={smallerStyle} type="text" value="" />
          <input ref={(ref) => (refInputs.current['a_x'] = ref)} style={smallerStyle} type="text" value="" />
        </HorizontalGroup>
        <HorizontalGroup>
          <input ref={(ref) => (refInputs.current['s_e'] = ref)} style={smallerStyle} type="text" value="" />
          <input ref={(ref) => (refInputs.current['v_y'] = ref)} style={smallerStyle} type="text" value="" />
          <input ref={(ref) => (refInputs.current['a_y'] = ref)} style={smallerStyle} type="text" value="" />
        </HorizontalGroup>
        <HorizontalGroup>
          <input ref={(ref) => (refInputs.current['s_h'] = ref)} style={smallerStyle} type="text" value="" />
          <input ref={(ref) => (refInputs.current['v_z'] = ref)} style={smallerStyle} type="text" value="" />
          <input ref={(ref) => (refInputs.current['a_z'] = ref)} style={smallerStyle} type="text" value="" />
        </HorizontalGroup>
      </VerticalGroup>
      <VerticalGroup>
        <text className='smaller-font'>{"Total Angular Velocity"}</text>
        <HorizontalGroup>
          <text className='smaller-font'>{"X (Deg/s)"}</text>
          <input ref={(ref) => (refInputs.current['v_deg_x'] = ref)} style={orbitStyle} type="text" value="" />
        </HorizontalGroup>
        <HorizontalGroup>
          <text className='smaller-font'>{"Y (Deg/s)"}</text>
          <input ref={(ref) => (refInputs.current['v_deg_y'] = ref)} style={orbitStyle} type="text" value="" />
        </HorizontalGroup>
        <HorizontalGroup>
          <text className='smaller-font'>{"Z (Deg/s)"}</text>
          <input ref={(ref) => (refInputs.current['v_deg_z'] = ref)} style={orbitStyle} type="text" value="" />
        </HorizontalGroup>
      </VerticalGroup>
      <VerticalGroup>
        <text className='smaller-font'>{"Position"}</text>
        <HorizontalGroup>
          <text className='smaller-font'>{"Lat. (Deg)"}</text>
          <input ref={(ref) => (refInputs.current['geod_s_lat'] = ref)} style={orbitStyle} type="text" value="" />
        </HorizontalGroup>
        <HorizontalGroup>
          <text className='smaller-font'>{"Long. (Deg)"}</text>
          <input ref={(ref) => (refInputs.current['geod_s_lon'] = ref)} style={orbitStyle} type="text" value="" />
        </HorizontalGroup>
        <HorizontalGroup>
          <text className='smaller-font'>{"Alt. (m)"}</text>
          <input ref={(ref) => (refInputs.current['geod_s_alt'] = ref)} style={orbitStyle} type="text" value="" />
        </HorizontalGroup>
      </VerticalGroup>
    </div>
  );
};

export default EstimatedStates;

