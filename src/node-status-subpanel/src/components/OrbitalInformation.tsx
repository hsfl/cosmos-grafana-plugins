import { HorizontalGroup } from '@grafana/ui';
import React from 'react';
//import { PanelProps } from '@grafana/data';

const orbitStyle = {
    width: '45px',
    height: '20px', 
    fontSize: '10px', 
  };

  const eventStyle = {
    width: '68px',
    height: '30px', 
    fontSize: '7px', 
  };

  interface ColoredRectangleProps {
    color: string;
    width: number;
    height: number;
  }
  
  const ColoredRectangle: React.FC<ColoredRectangleProps> = ({ color, width, height }) => {
    const rectangleStyle = {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: color,
    };
    return <div style={rectangleStyle}></div>;
  };

  const Footer = ({}) => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        {/*Latitude, Longitude, Altitude*/}
        <HorizontalGroup>
            <text className='smaller-font'>Lat</text>
            <input style={orbitStyle} type="text" value="54.3" />
            <text className='smaller-font'>Lon</text>
            <input style={orbitStyle} type="text" value="306.9" />
            <text className='smaller-font'>Alt</text>
            <input style={orbitStyle} type="text" value="403468" />
        </HorizontalGroup>
        {/*Orbital Events*/}
        <HorizontalGroup>
            <textarea style={eventStyle} value={"Daylight: 00:29:47 \nUmbra: 08:52:39"}/>
            <textarea style={eventStyle} value={"Target: 00:48:23 \nStation: 00:30:21"}/>
            <textarea style={eventStyle} value={"AOS: 00:02:32 \nLOS: 00:58:13"}/>
        </HorizontalGroup>
        {/*Orbital Event Timeline Display*/}
        <HorizontalGroup>
            <ColoredRectangle color="yellow" width={65} height={10}/>
            <ColoredRectangle color="black" width={65} height={10}/>
            <ColoredRectangle color="black" width={65} height={10}/>
        </HorizontalGroup>
        {/*Misc Info*/}
        <HorizontalGroup>
            <text className='even-smaller-font'>UTC<br></br>Loc</text>
            <textarea style={eventStyle} value={"00:09:00 \n????"}/>
            <text className='even-smaller-font'>State<br></br>ADCS</text>
            <textarea style={eventStyle} value={"Normal \nLVLH"}/>
        </HorizontalGroup>
      </div>
    );
  };

  export default Footer;

