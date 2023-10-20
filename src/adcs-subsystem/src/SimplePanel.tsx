import React, { useEffect, useState } from 'react';
import { PanelProps, SelectableValue } from '@grafana/data';
import EstimatedStates from 'components/EstimatedStates';
import Controls from 'components/Controls';
import GPS from 'components/GPS';
import IMU from 'components/IMU';
import SunSensor from 'components/SunSensor';
import { SimpleOptions, RefMtr, RefRw } from './types';
import { useCosmosTimeline, useDomUpdate } from './helpers/hooks';

interface Props extends PanelProps<SimpleOptions> {}


export const SimplePanel: React.FC<Props> = ({ data, eventBus, timeRange }) => {
  // The selected cpu to display data for
  const [selectPanel, setSelectPanel] = useState<SelectableValue<string>>();
  // const [cpuSelectOptions, setCpuSelectOptions] = useState<Array<SelectableValue<string>>>([]);
  // Imperative animation hook -- the dictionary of refs and the animation callback function
  const [refInputs, mtrList, rwList, updateDOMRefs] = useDomUpdate(data); // removed selectPanel
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
    // IF MTR or RW
    if (panel_type === 'mtr' || panel_type === 'rw') {
      // define dynamic list of mtr elements for node 
      let mtr_data = data.series.filter((row) => row.meta?.custom?.type === 'mtr');
      const mtr_dev_fields = mtr_data[0].fields.filter((field) => field.name === 'didx');
      // if mtr list is not equal to the refState mtrList -1, clear refState and initialize
      if ((mtr_dev_fields).length !== ((mtrList.current).length - 1)) {
        mtrList.current = [];
        mtr_dev_fields.forEach((field) => {
          // let didx = field.values[0];
          let mtr_name_value = field.labels!.name;
          let input_el_arr: HTMLInputElement[] = [];
          for (let i = 0; i < 4; i++) {
            const el: HTMLInputElement = document.createElement('input') as HTMLInputElement;
            input_el_arr.push(el);
          };
          let Mtr_ob: RefMtr = new Object({
            mtr_name: input_el_arr[0],
            mtr_torq: input_el_arr[1],
            mtr_a: input_el_arr[2],
          });
          Mtr_ob.mtr_name!.value = mtr_name_value;
          mtrList.current.push(Mtr_ob)
          // console.log("useRef mtr list", mtrList);          
        });
      };
      // define dynamic list of rw elements for node
      let rw_data = data.series.filter((row) => row.meta?.custom?.type === 'rw');
      const rw_dev_fields = rw_data[0].fields.filter((field) => field.name === 'didx');
      // if mtr list is not equal to the refState mtrList -1, clear refState and initialize
      if ((rw_dev_fields).length !== ((rwList.current).length - 1)) {
        rwList.current = [];
        rw_dev_fields.forEach((field) => {
          // let didx = field.values[0];
          let rw_name_value = field.labels!.name;
          let input_el_arr: HTMLInputElement[] = [];
          for (let i = 0; i < 4; i++) {
            const el: HTMLInputElement = document.createElement('input') as HTMLInputElement;
            input_el_arr.push(el);
          };
          let Rw_ob: RefRw = new Object({
            rw_name: input_el_arr[0],
            rw_torq: input_el_arr[1],
            rw_rpm: input_el_arr[2],
          });
          Rw_ob.rw_name!.value = rw_name_value;
          rwList.current.push(Rw_ob)
        });
      };
    };
  }, [data, mtrList, rwList]);
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
  } else if (selectPanel?.label === 'mtr' || selectPanel?.label === 'rw') {
    let bothObjects = { mtrList, rwList };
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        {/* <IMU { ...refInputs } /> */}
        {/* <SunSensor /> */}
        {/* <GPS /> */}
        <Controls {...bothObjects} />
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
        {/* <Controls {...mtrList} /> */}
        <EstimatedStates {...refInputs} />
      </div>
    );
  }
};
