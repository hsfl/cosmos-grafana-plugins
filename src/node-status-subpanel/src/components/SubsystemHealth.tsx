import React from 'react';
//import { PanelProps } from '@grafana/data';
import { Button, VerticalGroup} from '@grafana/ui';
import '../NodeStatusSubpanel.css';


const green = '#0b0';
const yellow = '#ea3';
const red = '#e00'

const SubsystemHealth = () => {
    const buttonStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      };
  return (
    <div style={{ display: 'flex', flexDirection: 'column'}}>
        <VerticalGroup spacing="xs">
            {/* <Button className="smaller-button" style={{ ...buttonStyle, backgroundColor: green }}>
            Flight Dynamics
            </Button> */}
            <Button className="smaller-button" style={{ ...buttonStyle, backgroundColor: green }}>
            GS
            </Button>
            <Button className="smaller-button" style={{ ...buttonStyle, backgroundColor: green }}>
            FSW
            </Button>
            <Button className="smaller-button" style={{ ...buttonStyle, backgroundColor: red }}>
            Payloads
            </Button>
            <Button className="smaller-button" style={{ ...buttonStyle, backgroundColor: green }}>
            TCS
            </Button>
            <Button className="smaller-button" style={{ ...buttonStyle, backgroundColor: green }}>
            ADCS
            </Button>
            <Button className="smaller-button" style={{ ...buttonStyle, backgroundColor: green }}>
            Telecom
            </Button>
            <Button className="smaller-button" style={{ ...buttonStyle, backgroundColor: green }}>
            EPS
            </Button>
            <Button className="smaller-button" style={{ ...buttonStyle, backgroundColor: yellow }}>
            Propulsion
            </Button>
            <Button className="smaller-button" style={{ ...buttonStyle, backgroundColor: green }}>
            OBCS
            </Button>
        </VerticalGroup>
        </div>
  );
};

export default SubsystemHealth;
