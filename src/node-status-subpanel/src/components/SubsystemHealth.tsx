import React from 'react';
//import { PanelProps } from '@grafana/data';
import { Button, VerticalGroup} from '@grafana/ui';
import '../NodeStatusSubpanel.css';


const green = '#0b0';
const yellow = '#ea3';
const red = '#e00'



const SubsystemHealth = () => {
    // const smallerButtonStyle = {
    //     padding: '0px 0px 1px 1px',
    //     fontSize: '8px',
    //   };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: "auto"}}>
        <VerticalGroup spacing="xs">
            <Button className="smaller-button" style={{ backgroundColor: green }}>
            Flight Dynamics
            </Button>
            <Button className="smaller-button" style={{ backgroundColor: green }}>
            GS
            </Button>
            <Button className="smaller-button" style={{ backgroundColor: green }}>
            FSW
            </Button>
            <Button className="smaller-button" style={{ backgroundColor: red }}>
            Payloads
            </Button>
            <Button className="smaller-button" style={{ backgroundColor: green }}>
            TCS
            </Button>
            <Button className="smaller-button" style={{ backgroundColor: green }}>
            ADCS
            </Button>
            <Button className="smaller-button" style={{ backgroundColor: green }}>
            Telecom
            </Button>
            <Button className="smaller-button" style={{ backgroundColor: green }}>
            EPS
            </Button>
            <Button className="smaller-button" style={{ backgroundColor: yellow }}>
            Propulsion
            </Button>
            <Button className="smaller-button" style={{ backgroundColor: green }}>
            OBCS
            </Button>
        </VerticalGroup>
        </div>
  );
};

export default SubsystemHealth;
