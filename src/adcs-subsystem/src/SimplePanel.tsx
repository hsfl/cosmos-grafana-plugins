import React, { useEffect, useState } from 'react';
import { PanelProps, SelectableValue } from '@grafana/data';
import EstimatedStates from 'components/EstimatedStates';
import Controls from 'components/Controls';
import GPS from 'components/GPS';
import IMU from 'components/IMU';
import SunSensor from 'components/SunSensor';
import { SimpleOptions, RefMtr, RefRw, RefImu, RefSsen, RefGps } from './types';
import { useCosmosTimeline, useDomUpdate } from './helpers/hooks';

interface Props extends PanelProps<SimpleOptions> {}


export const SimplePanel: React.FC<Props> = ({ data, eventBus, timeRange }) => {
  // The selected cpu to display data for
  const [selectPanel, setSelectPanel] = useState<SelectableValue<string>>();
  // const [cpuSelectOptions, setCpuSelectOptions] = useState<Array<SelectableValue<string>>>([]);
  // Imperative animation hook -- the dictionary of refs and the animation callback function
  const [refInputs, mtrList, rwList, imuList, ssenList, gpsList, adcstotList, updateDOMRefs] = useDomUpdate(data); // removed selectPanel
  useCosmosTimeline(data, eventBus, updateDOMRefs);
  console.log(ssenList, gpsList, adcstotList);

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
    } else if (panel_type === 'imu') {
      // define dynamic list of imu elements for node 
      let imu_data = data.series.filter((row) => row.meta?.custom?.type === 'imu');
      const imu_dev_fields = imu_data[0].fields.filter((field) => field.name === 'theta_x');
      // if imu list is not equal to the refState List -1, clear refState and initialize
      if ((imu_dev_fields).length !== ((imuList.current).length - 1)) {
        imuList.current = [];
        imu_dev_fields.forEach((field) => {
          // let didx = field.values[0];
          let imu_name_value = field.labels!.name;
          let input_el_arr: HTMLInputElement[] = [];
          for (let i = 0; i < 13; i++) {
            const el: HTMLInputElement = document.createElement('input') as HTMLInputElement;
            input_el_arr.push(el);
          };
          let Imu_ob: RefImu = new Object({
            imu_name: input_el_arr[0],
            theta_x: input_el_arr[1],
            theta_y: input_el_arr[2],
            theta_z: input_el_arr[3],
            theta_w: input_el_arr[4],
            omega_x: input_el_arr[5],
            omega_y: input_el_arr[6],
            omega_z: input_el_arr[7],
            mag_x: input_el_arr[8],
            mag_y: input_el_arr[9],
            mag_z: input_el_arr[10],
          });
          Imu_ob.imu_name!.value = imu_name_value;
          imuList.current.push(Imu_ob)
          // console.log("useRef imu list", imuList);
        });
      };
      //
    } else if (panel_type === 'ssen') {
      // define dynamic list of ssen elements for node 
      let ssen_data = data.series.filter((row) => row.meta?.custom?.type === 'ssen');
      const ssen_dev_fields = ssen_data[0].fields.filter((field) => field.name === 'qva');
      // if ssen list is not equal to the refState List -1, clear refState and initialize
      if ((ssen_dev_fields).length !== ((ssenList.current).length - 1)) {
        ssenList.current = [];
        ssen_dev_fields.forEach((field) => {
          // let didx = field.values[0];
          let ssen_name_value = field.labels!.name;
          let input_el_arr: HTMLInputElement[] = [];
          for (let i = 0; i < 9; i++) {
            const el: HTMLInputElement = document.createElement('input') as HTMLInputElement;
            input_el_arr.push(el);
          };
          let Ssen_ob: RefSsen = new Object({
            ssen_name: input_el_arr[0],
            qva: input_el_arr[1],
            qvb: input_el_arr[2],
            qvc: input_el_arr[3],
            qvd: input_el_arr[4],
            azi: input_el_arr[5],
            elev: input_el_arr[6],
          });
          Ssen_ob.ssen_name!.value = ssen_name_value;
          ssenList.current.push(Ssen_ob)
          // console.log("useRef ssen list", ssenList);
        });
      };
      //
    } else if (panel_type === 'gps') {
      // define dynamic list of gps elements for node 
      let gps_data = data.series.filter((row) => row.meta?.custom?.type === 'gps');
      const gps_dev_fields = gps_data[0].fields.filter((field) => field.name === 'geoc_s_x');
      // if gps list is not equal to the refState List -1, clear refState and initialize
      if ((gps_dev_fields).length !== ((gpsList.current).length - 1)) {
        gpsList.current = [];
        gps_dev_fields.forEach((field) => {
          // let didx = field.values[0];
          let gps_name_value = field.labels!.name;
          let input_el_arr: HTMLInputElement[] = [];
          for (let i = 0; i < 9; i++) {
            const el: HTMLInputElement = document.createElement('input') as HTMLInputElement;
            input_el_arr.push(el);
          };
          let Gps_ob: RefGps = new Object({
            gps_name: input_el_arr[0],
            geoc_s_x: input_el_arr[1],
            geoc_s_y: input_el_arr[2],
            geoc_s_z: input_el_arr[3],
            geod_s_lat: input_el_arr[4],
            geod_s_lon: input_el_arr[5],
            geod_s_alt: input_el_arr[6],
          });
          Gps_ob.gps_name!.value = gps_name_value;
          gpsList.current.push(Gps_ob)
          // console.log("useRef gps list", gpsList);
        });
      };
      //
    };
  }, [data, mtrList, rwList, imuList, ssenList, gpsList]);
  // console.log("selectPanel: ", selectPanel);


  if (selectPanel?.label === 'imu') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        <IMU {...imuList} />
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
        <SunSensor {...ssenList} />
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
        <GPS {...gpsList} />
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
        <IMU {...imuList} />
        <SunSensor {...ssenList} />
        <GPS {...gpsList} />
        {/* <Controls {...mtrList} /> */}
        <EstimatedStates {...refInputs} />
      </div>
    );
  }
};
