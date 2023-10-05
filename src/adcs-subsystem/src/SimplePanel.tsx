import React, { useEffect, useState } from 'react';
import { PanelProps, SelectableValue } from '@grafana/data';
import EstimatedStates from 'components/EstimatedStates';
import Controls from 'components/Controls';
import GPS from 'components/GPS';
import IMU from 'components/IMU';
import SunSensor from 'components/SunSensor';
import { SimpleOptions } from './types';
import { useCosmosTimeline, useDomUpdate } from './helpers/hooks';

interface Props extends PanelProps<SimpleOptions> {}


export const SimplePanel: React.FC<Props> = ({ data, eventBus, timeRange }) => {
  // The selected cpu to display data for
  const [selectPanel, setSelectPanel] = useState<SelectableValue<string>>();
  // const [cpuSelectOptions, setCpuSelectOptions] = useState<Array<SelectableValue<string>>>([]);
  // Imperative animation hook -- the dictionary of refs and the animation callback function
  const [refInputs, updateDOMRefs] = useDomUpdate(); // removed selectPanel
  useCosmosTimeline(data, eventBus, updateDOMRefs);

  // Data changes should cause rerender even without the timeline
  // useEffect(() => {
  //   const dummyTimeEvent: TimeEvent = new TimeEvent({ time: timeRange.to.unix() });
  //   updateDOMRefs(data, dummyTimeEvent);
  // }, [data, timeRange.to, updateDOMRefs]);

  // Update list of node options
  useEffect(() => {
    if (data.series.length === 0 || data.series[0].fields.length === 0) {
      return;
    }
    const panelList: Array<SelectableValue<string>> = [];
    const panel_type = data.series[0].meta?.custom?.type;
    // let selection = { label: panel_type };
    // console.log("panel selected: ", selection);
    // console.log("panel type: ", panel_type);
    if (panel_type === undefined) {
      return;
      // selection = { label: 'imu' };
    }
    // else if (panel_type) {
    //   selection = { label: panel_type };
    // }
    panelList.push({ label: panel_type });
    setSelectPanel((selection) => {
      if (panelList.length === 0) {
        return selection;
      }
      if (panelList.findIndex((v) => v.label === selection?.label) === -1) {
        return panelList[0];
      }
      return selection;
    });
  }, [data]);
  // console.log("selectPanel: ", selectPanel);


  if (selectPanel?.label === 'imu') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        <IMU {...refInputs} />
        {/* <SunSensor />
        <GPS />
        <Controls />
        <EstimatedStates /> */}
      </div>
    );
  } else if (selectPanel?.label === 'ssen') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        {/* <IMU { ...refInputs } /> */}
        <SunSensor {...refInputs} />
        {/* <GPS />
        <Controls />
        <EstimatedStates /> */}
      </div>
    );
  } else if (selectPanel?.label === 'gps') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        {/* <IMU { ...refInputs } /> */}
        {/* <SunSensor /> */}
        <GPS {...refInputs} />
        {/* <Controls />
        <EstimatedStates /> */}
      </div>
    );
  } else if (selectPanel?.label === 'control') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        {/* <IMU { ...refInputs } /> */}
        {/* <SunSensor /> */}
        {/* <GPS /> */}
        <Controls {...refInputs} />
        {/* <EstimatedStates /> */}
      </div>
    );
  } else if (selectPanel?.label === 'adcstotal') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        {/* <IMU { ...refInputs } /> */}
        {/* <SunSensor /> */}
        {/* <GPS /> */}
        {/* <Controls /> */}
        <EstimatedStates {...refInputs} />
      </div>
    );
  } else {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        <h1>reset query</h1>
        <IMU {...refInputs} />
        <SunSensor {...refInputs} />
        <GPS {...refInputs} />
        <Controls {...refInputs} />
        <EstimatedStates {...refInputs} />
      </div>
    );
  }
};
