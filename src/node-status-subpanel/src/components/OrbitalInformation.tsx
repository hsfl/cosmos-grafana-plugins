import { HorizontalGroup } from '@grafana/ui';
import React from 'react';
//import { PanelProps } from '@grafana/data';

const orbitStyle = {
    width: '45px',
    height: '15px', 
    fontSize: '10px', 
    color: '#32CD32',
  };

  const eventStyle = {
    width: '68px',
    height: '25px', 
    fontSize: '6px', 
    color: '#32CD32',
  };

  const Footer = () => {
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
        <div style={{ position: 'relative', display: 'inline-block' }}>
      {/*Daylight Timeline*/}
      <div
        style={{
          width: `65px`,
          height: `10px`,
          backgroundColor: "yellow",
        }}
      />
      {/*Daylight Timeline Bar*/}
      <div
        style={{
          width: '2px',
          height: '10px',
          backgroundColor: 'black',
          position: 'absolute', 
          top: '0', 
          left: '30%', 
        }}
      />
    </div>
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/*Target Timeline*/}
      <div
        style={{
          width: `65px`,
          height: `10px`,
          backgroundColor: "black",
        }}
      />
      {/*Target Timeline Bar 1*/}
      <div
        style={{
          width: '2px',
          height: '10px',
          backgroundColor: 'red',
          position: 'absolute', 
          top: '0', 
          left: '50%',  
        }}
      />
      {/*Target Timeline Bar 2*/}
      <div
        style={{
          width: '2px',
          height: '10px',
          backgroundColor: 'blue',
          position: 'absolute', 
          top: '0', 
          left: '70%',  
        }}
      />
    </div>
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/*AOS/LOS Timeline*/}
      <div
        style={{
          width: `65px`,
          height: `10px`,
          backgroundColor: "black",
        }}
      />
      {/*AOS/LOS Timeline Bar*/}
      <div
        style={{
          width: '2px',
          height: '10px',
          backgroundColor: 'yellow',
          position: 'absolute',
          top: '0',
          left: '20%', 
        }}
      />
    </div>
        </HorizontalGroup>
        {/*Misc Info*/}
        <HorizontalGroup>
            <text className='even-smaller-font'>UTC<br></br>LocT</text>
            <textarea style={eventStyle} value={"09:00:00 (+1) \n22:00:00"}/>
            <text className='even-smaller-font'>State<br></br>ADCS</text>
            <textarea style={eventStyle} value={"Normal \nLVLH"}/>
        </HorizontalGroup>
      </div>
    );
  };

  export default Footer;

