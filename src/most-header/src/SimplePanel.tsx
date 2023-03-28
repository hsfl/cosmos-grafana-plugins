import React, {useEffect, useRef, useState} from 'react';
import { BusEventWithPayload, PanelProps } from '@grafana/data';
import { InlineField, InlineFieldRow, Input, Select, RadioButtonGroup} from '@grafana/ui';
import { SimpleOptions, /*currentMJD*/ } from 'types';
import moment from 'moment-timezone';
//import { currentMJD } from 'utils/utilFunctions';

interface Props extends PanelProps<SimpleOptions> {}

interface TimeEventPayload {
  // The starting time, positive unix milliseconds timestamp
  time?: number,
  // Time progression rate, in seconds. Event fires sparsely
  rate?: number,
}

class TimeEvent extends BusEventWithPayload<Partial<TimeEventPayload>> {
  static type = 'COSMOS-TimeEvent';
}

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

//Selection bar
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
            size = "md"
            options={options}
            value={selected}
            onChange={(v) => setSelected(v!)}
          />
        </div>
      </div>
    );
  }

//options for drop down menu
const options = [
  { label: 'Design' },
  { label: 'Near Realtime' },
  { label: 'Archived' },
  { label: 'Simulation/Rehearsal' },
  { label: 'Background' },
  { label: 'Extrapolated' }
];


//Dropdown menu
const useBasicSelectAsync = () => {

  return (
    <Select
      options={options}
      //value={value}
      width={17}
      onChange={v => {
        //setValue(v);
      }}
    />
  );
};



const useTimeMode = (refUTCTimeDiv: React.Ref<HTMLInputElement>, refMJDTimeDiv: React.Ref<HTMLInputElement>, refMETTimeDiv: React.Ref<HTMLInputElement>, refMOCTimeDiv: React.Ref<HTMLInputElement>) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: "100%"}}>
      <InlineFieldRow>
        <InlineField
          label="UTC"
          labelWidth = {5}
          //tooltip="Displays Current UTC Time"
          shrink
        >
          <Input
            ref={refUTCTimeDiv}
            name = "start"
            type="text"
            value = {""}
            width={12}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField
            label="MOC"
            labelWidth = {5}
            //tooltip="Displays MOC"
            shrink
          >
            <Input
              ref={refMOCTimeDiv}
              name="start"
              type="text"
              value = {""}
              width={12}
            />
          </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField
            label="MET"
            labelWidth = {5}
            //tooltip="Displays MET"
            shrink
          >
            <Input
                ref={refMETTimeDiv}
              name="start"
              type="text"
              value = {0}
              width={12}
            />
          </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField
            label="SLT"
            labelWidth = {5}
            //tooltip="Displays SLT"
            shrink
          >
            <Input
              name="start"
              type="number"
              value = {0}
              width={12}
            />
          </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField
            label="MJD"
            labelWidth = {5}
            //tooltip="Displays Current UTC Time in MJD"
            shrink
          >
            <Input
              ref={refMJDTimeDiv}
              name="start"
              type="number"
              value = {0}
              width={12.5}
            />
          </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField label="Mode" labelWidth = {6}>
        {useBasicSelectAsync()}
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        {useRadioButtonGroup()}
      </InlineFieldRow>
    </div>
  );
};

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, eventBus }) => {
  // const displayText = () => {
  //   if (options.on_off)
  //   {
  //     return(    
  //       <div>Text option value: {options.text}</div>
  //     );
  //   }
  //   return(null);
  // };

  const refUTCTimeDiv = useRef<HTMLInputElement>(null);
  const refMJDTimeDiv = useRef<HTMLInputElement>(null);
  const refMETTimeDiv = useRef<HTMLInputElement>(null);
  const refMOCTimeDiv = useRef<HTMLInputElement>(null);
  const missionStartTime = useRef<number>(0);

  useEffect(() => {
    const subscriber = eventBus.getStream(TimeEvent).subscribe(event => {
      if (event.payload.time !== undefined) {
        if (refMJDTimeDiv.current !== null) {
          // Unix millisecond timestamp to mjd
          const newMJDTime = (event.payload.time / (86400.0*1000)) + 2440587.5 - 2400000.5;
          refMJDTimeDiv.current.value = newMJDTime.toString();
        }
        if (refUTCTimeDiv.current !== null) {
          // Unix timestamp to mjd
          // .unix takes unix seconds argument, so convert milliseconds to seconds
          const newUTCTime = moment.unix(event.payload.time/1000).tz('UTC').format('HH:mm:ss');
          refUTCTimeDiv.current.value = newUTCTime;
        }
        if (refMOCTimeDiv.current !== null) {
          // Unix timestamp to mjd
          // .unix takes unix seconds argument, so convert milliseconds to seconds
          const newMOCTime = moment.unix(event.payload.time/1000).tz('America/Honolulu').format('HH:mm:ss');
          refMOCTimeDiv.current.value = newMOCTime;
        }
        if (refMETTimeDiv.current !== null) {
            if (missionStartTime.current === 0 || event.payload.time < missionStartTime.current) {
                missionStartTime.current = event.payload.time;
            }
            const diffTime = event.payload.time - missionStartTime.current;
            const duration = moment.duration(diffTime);
            const hours = Math.floor(duration.asHours());
            const hoursString = String(hours).padStart(2, '0');
            const metString = hoursString + moment.utc(diffTime).format(":mm:ss");
            refMETTimeDiv.current.value = metString;
        }
        
      }
    });

    return () => {
      subscriber.unsubscribe();
    }
  }, [eventBus]);

  return (
    <div>
      {/* {options.on_off ? <div>Text option value: {options.text}</div> : null}
      {displayText()}
      {displayText2(options)} */}
      {useTimeMode(refUTCTimeDiv, refMJDTimeDiv, refMETTimeDiv, refMOCTimeDiv)}
      {/* {useRadioButtonGroup()} */}
    </div>
  );
};
