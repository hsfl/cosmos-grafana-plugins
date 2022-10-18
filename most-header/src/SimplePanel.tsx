import React, {useState} from 'react';
import { PanelProps, SelectableValue } from '@grafana/data';
import { InlineField, InlineFieldRow, Input, AsyncSelect, InlineLabel, RadioButtonGroup, Button, HorizontalGroup} from '@grafana/ui';
import { SimpleOptions, /*currentMJD*/ } from 'types';
//import { currentMJD } from 'utils/utilFunctions';

interface Props extends PanelProps<SimpleOptions> {}

//const defaultTime = currentMJD(-300 / 86400);

// const displayText2 = (options: SimpleOptions) => {
//   if (options.on_off)
//   {
//     const texts: JSX.Element[] = [];
//     for (let i = 0; i<3; i++)
//     {  
//       texts.push(<div>Text option value: {options.text}</div>);
//     }
//     return(texts);
//   }
//   return(null);
// }; 

const useRadioButtonGroup = () => {
  const [selected, setSelected] = useState('log review');
    const options = [
      { label: 'Log Review', value: 'log review' },
      { label: 'Log Entry', value: 'log entry' },
      { label: 'Log In', value: 'log in' },
      { label: 'Log Out', value: 'log out' },
      { label: 'B/G Monitor', value: 'b/g montitor' },
    ];
  
    return (
      <div style={{ width: '10%' }}>
        <div style={{ marginBottom: '32px' }}>
          <RadioButtonGroup
            size = "sm"
            options={options}
            value={selected}
            onChange={(v) => setSelected(v!)}
          />
        </div>
      </div>
    );
  }

const options = [
  { label: 'Design' },
  { label: 'Near Realtime' },
  { label: 'Archived' },
  { label: 'Simulation/Rehearsal' },
  { label: 'Background' },
  { label: 'Extrapolated' }
];



const loadAsyncOptions = () => {
  return new Promise<Array<SelectableValue<string>>>((resolve) => {
    setTimeout(() => {
      resolve(options);
    }, 2000);
  });
};
const useBasicSelectAsync = () => {
  const [value, setValue] = useState<SelectableValue<string>>();

  return (
    <AsyncSelect
      loadOptions={loadAsyncOptions}
      defaultOptions
      value={value}
      width = {10}
      onChange={v => {
        setValue(v);
      }}
    />
  );
};



const useTimeMode = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: "100%"}}>
      <InlineFieldRow>
        <InlineField
          label="UTC"
          labelWidth = {6}
          //tooltip="Displays Current UTC Time"
          shrink
        >
          <Input
            name = "start"
            type="number"
            value = {Date.now()}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField
            label="MOC"
            labelWidth = {6}
            //tooltip="Displays MOC"
            shrink
          >
            <Input
              name="start"
              type="number"
              value = {123456}
            />
          </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField
            label="MET"
            labelWidth = {6}
            //tooltip="Displays MET"
            shrink
          >
            <Input
              name="start"
              type="number"
              value = {123456}
            />
          </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField
            label="SLT"
            labelWidth = {6}
            //tooltip="Displays SLT"
            shrink
          >
            <Input
              name="start"
              type="number"
              value = {123456}
            />
          </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField
            label="MJD"
            labelWidth = {8}
            //tooltip="Displays Current UTC Time in MJD"
            shrink
          >
            <Input
              name="start"
              type="number"
              value = {123456}
            />
          </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineLabel width={17}>
          Mode  
        {useBasicSelectAsync()}
        </InlineLabel>
      </InlineFieldRow>
      <InlineFieldRow>
        {useRadioButtonGroup()}
      </InlineFieldRow>
    </div>
  );
};

const useCautionAndWarning = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: "100%"}}>
      <HorizontalGroup spacing="xs">
        <Button size="xs" variant = "destructive">
          Flight Dynamics
        </Button>
        <Button size = "xs" variant = "success">
          GS
        </Button>
        <Button size="xs" variant = "success">
          FSW
        </Button>
        <Button size="xs" variant = "success">
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
      {useTimeMode()}
      {useCautionAndWarning()}
      {/* {useRadioButtonGroup()} */}
    </div>
  );
};
