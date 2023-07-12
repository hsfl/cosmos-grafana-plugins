import React from 'react';
//import { PanelProps } from '@grafana/data';
import { Button, VerticalGroup} from '@grafana/ui';
import '../NodeStatusSubpanel.css';


const green = '#0b0';
const yellow = '#ea3';
const red = '#c00'

const SubsystemHealth = () => {
    const buttonStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      };

{/*Temporary until we get real data*/}
const SubsystemData = [
  { label: 'GS', color: green },
  { label: 'FSW', color: green },
  { label: 'Payloads', color: red },
  { label: 'TCS', color: green },
  { label: 'ADCS', color: green },
  { label: 'Telecom', color: green },
  { label: 'EPS', color: green },
  { label: 'Propulsion', color: yellow },
  { label: 'OBCS', color: green },
];
return (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <VerticalGroup spacing="xs">
      {SubsystemData.map((subsystem, index) => (
        <Button
          key={index}
          className="smaller-button"
          style={{
            ...buttonStyle,
            backgroundColor: subsystem.color,
            color: 'black', 
          }}
        >
          {subsystem.label}
        </Button>
      ))}
    </VerticalGroup>
  </div>
);
};

export default SubsystemHealth;
