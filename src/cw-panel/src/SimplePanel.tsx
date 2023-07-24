import React from 'react';
import { PanelProps } from '@grafana/data';
import { Button, HorizontalGroup} from '@grafana/ui';
import { SimpleOptions, /*currentMJD*/ } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

const green = '#0b0';
const yellow = '#ea3';
const red = '#f00';

const useCautionAndWarning = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: "100%", alignItems: 'flex-start'}}>
      <HorizontalGroup spacing="xs">
        <Button style={{ fontSize: '10px', width: '80px', height: '25px', background:green, color: 'black', justifyContent: 'center', alignItems: 'center', marginBottom: 'auto' }}>
          Flight Dynamics
        </Button>
        <Button style={{ fontSize: '10px', width: '15px', height: '25px', background:red, color: 'black', justifyContent: 'center', alignItems: 'center', marginBottom: 'auto' }}>
          GS
        </Button>
        <Button style={{ fontSize: '10px', width: '20px', height: '25px', background:green, color: 'black', justifyContent: 'center', alignItems: 'center', marginBottom: 'auto' }}>
          FSW
        </Button>
        <Button style={{ fontSize: '10px', width: '50px', height: '25px', background:green, color: 'black', justifyContent: 'center', alignItems: 'center', marginBottom: 'auto' }}>
          Payloads
        </Button>
        <Button style={{ fontSize: '10px', width: '30px', height: '25px', background:green, color: 'black', justifyContent: 'center', alignItems: 'center', marginBottom: 'auto' }}>
          TCS
        </Button>
        <Button style={{ fontSize: '10px', width: '30px', height: '25px', background:green, color: 'black', justifyContent: 'center', alignItems: 'center', marginBottom: 'auto' }}>
          ADCS
        </Button>
        <Button style={{ fontSize: '10px', width: '50px', height: '25px', background:green, color: 'black', justifyContent: 'center', alignItems: 'center', marginBottom: 'auto' }}>
          Telecom
        </Button>
        <Button style={{ fontSize: '10px', width: '30px', height: '25px', background:green, color: 'black', justifyContent: 'center', alignItems: 'center', marginBottom: 'auto' }}>
          EPS
        </Button>
        <Button style={{ fontSize: '10px', width: '60px', height: '25px', background:yellow, color: 'black', justifyContent: 'center', alignItems: 'center', marginBottom: 'auto' }}>
          Propulsion
        </Button>
        <Button style={{ fontSize: '10px', width: '30px', height: '25px', background:green, color: 'black', justifyContent: 'center', alignItems: 'center', marginBottom: 'auto' }}>
          OBCS
        </Button>
      </HorizontalGroup>
    </div>
  );
}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  // const displayText = () => {
  //   if (options.on_off)
  //   {
  //     return(    
  //       <div>Text option value: {options.text}</div>
  //     );
  //   }
  //   return(null);
  // }; 

  return (
    <div>
      {/* {options.on_off ? <div>Text option value: {options.text}</div> : null}
      {displayText()}
      {displayText2(options)} */}
      {useCautionAndWarning()}
      {/* {useRadioButtonGroup()} */}
    </div>
  );
};
