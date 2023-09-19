import { HorizontalGroup, VerticalGroup } from '@grafana/ui';
import React from 'react';
import { RefDict } from '../types';
//import { PanelProps } from '@grafana/data';
import './styles.css';

const orbitStyle = {
  width: '75px',
  height: '15px',
  fontSize: '10px',
  color: '#32CD32',
};

const GPS = (refInputs: React.MutableRefObject<RefDict>) => {
  return (
    <div style={ { display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' } }>
      {/*GPS*/ }
      {/* <HorizontalGroup>
        <text className='smaller-font'>{ "Sampling Rate (Hz)" }</text>
        <input style={ orbitStyle } type="text" value="" />
      </HorizontalGroup> */}
      <HorizontalGroup>
        <VerticalGroup>
          <HorizontalGroup>
            <text className='smaller-font'>{ "X (m)" }</text>
            <input ref={ (ref) => (refInputs.current['geoc_s_x'] = ref) } style={ orbitStyle } type="text" value="" />
          </HorizontalGroup>
          <HorizontalGroup>
            <text className='smaller-font'>{ "Y (m)" }</text>
            <input ref={ (ref) => (refInputs.current['geoc_s_y'] = ref) } style={ orbitStyle } type="text" value="" />
          </HorizontalGroup>
          <HorizontalGroup>
            <text className='smaller-font'>{ "Z (m)" }</text>
            <input ref={ (ref) => (refInputs.current['geoc_s_z'] = ref) } style={ orbitStyle } type="text" value="" />
          </HorizontalGroup>
        </VerticalGroup>
        <VerticalGroup>
          <HorizontalGroup>
            <text className='smaller-font'>{ "Lat. (Deg)" }</text>
            <input ref={ (ref) => (refInputs.current['geod_s_lat'] = ref) } style={ { ...orbitStyle, marginLeft: '12px' } } type="text" value="" />
          </HorizontalGroup>
          <HorizontalGroup>
            <text className='smaller-font'>{ "Long. (Deg)" }</text>
            <input ref={ (ref) => (refInputs.current['geod_s_lon'] = ref) } style={ orbitStyle } type="text" value="" />
          </HorizontalGroup>
          <HorizontalGroup>
            <text className='smaller-font'>{ "Alt. (Deg)" }</text>
            <input ref={ (ref) => (refInputs.current['geod_s_alt'] = ref) } style={ { ...orbitStyle, marginLeft: '11px' } } type="text" value="" />
          </HorizontalGroup>
        </VerticalGroup>
      </HorizontalGroup>
    </div>
  );
};

export default GPS;

