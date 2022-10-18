import React from 'react';
import { PanelProps } from '@grafana/data';
import { Button, HorizontalGroup} from '@grafana/ui';
import { SimpleOptions, /*currentMJD*/ } from 'types';

interface Props extends PanelProps<SimpleOptions> {}

const useCautionAndWarning = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: "100%"}}>
      <HorizontalGroup spacing="xs">
        <Button size="xs" variant = "destructive">
          Flight Dynamics
        </Button>
        <Button size = "xs" variant = "primary">
          GS
        </Button>
        <Button size="xs" variant = "primary">
          FSW
        </Button>
        <Button size="xs" variant = "primary">
          Payloads
        </Button>
        <Button size="xs" variant = "destructive">
          TCS
        </Button>
        <Button size="xs" variant = "destructive">
          ADCS
        </Button>
        <Button size="xs" variant = "destructive">
          Telecom
        </Button>
        <Button size="xs" variant = "destructive">
          EPS
        </Button>
        <Button size="xs" variant = "destructive">
          Propulsion
        </Button>
        <Button size="xs" variant = "destructive">
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
