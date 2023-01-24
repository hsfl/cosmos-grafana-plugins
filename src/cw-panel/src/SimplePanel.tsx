import React from 'react';
import { PanelProps } from '@grafana/data';
import { Button, HorizontalGroup} from '@grafana/ui';
import { SimpleOptions, /*currentMJD*/ } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

const green = '#0b0';
const yellow = '#ea3';

const useCautionAndWarning = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: "100%"}}>
      <HorizontalGroup spacing="xs">
        <Button size="xs" style={{ background:green }}>
          Flight Dynamics
        </Button>
        <Button size="xs" style={{ background:green }}>
          GS
        </Button>
        <Button size="xs" style={{ background:green }}>
          FSW
        </Button>
        <Button size="xs" style={{ background:green }}>
          Payloads
        </Button>
        <Button size="xs" style={{ background:green }}>
          TCS
        </Button>
        <Button size="xs" style={{ background:green }}>
          ADCS
        </Button>
        <Button size="xs" style={{ background:green }}>
          Telecom
        </Button>
        <Button size="xs" style={{ background:green }}>
          EPS
        </Button>
        <Button size="xs" style={{ background:yellow }}>
          Propulsion
        </Button>
        <Button size="xs" style={{ background:green }}>
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
