import React, { useEffect } from 'react';
import { PanelProps } from '@grafana/data';
import ColoredPanels from './components/SolarPanels'
import TempScale from './components/TempScale'
import Heaters from './components/Heaters'
import TopView from './components/TopView'
import BottomView from './components/BottomView'
import { HorizontalGroup, VerticalGroup } from '@grafana/ui';
import { RefBcreg, RefTsen } from './types';
import { useCosmosTimeline, useDomUpdate } from './helpers/hooks';


export const SimplePanel: React.FC<PanelProps> = ({ data, eventBus }) => {
  // Imperative animation hook -- the dictionary of refs and the animation callback function
  const [bcregList, tsenList, updateDOMRefs] = useDomUpdate(data); // removed selectPanel
  useCosmosTimeline(data, eventBus, updateDOMRefs);

  // Update list of node options
  useEffect(() => {
    if (data.series.length === 0 || data.series[0].fields.length === 0) {
      return;
    }
    // define dynamic list of device elements for node 
    let bcreg_data = data.series.filter((row) => row.meta?.custom?.type === 'bcreg');
    const bcreg_dev_fields = bcreg_data[0].fields.filter((field) => field.name === 'temp');
    // if list is not equal to the refState refList -1, clear refState List and initialize
    if ((bcreg_dev_fields).length !== ((bcregList.current).length - 1)) {
      bcregList.current = [];
      bcreg_dev_fields.forEach((field) => {
        let bcreg_name_value = field.labels!.name;
        let input_el_arr: HTMLInputElement[] = [];
        for (let i = 0; i < 2; i++) {
          const el: HTMLInputElement = document.createElement('input') as HTMLInputElement;
          input_el_arr.push(el);
        };
        let Bcreg_ob: RefBcreg = new Object({
          bcreg_name: input_el_arr[0],
          temp: input_el_arr[1],
        });
        Bcreg_ob.bcreg_name!.value = bcreg_name_value;
        bcregList.current.push(Bcreg_ob)
      });
    }; // bcreg init done
    //
    let tsen_data = data.series.filter((row) => row.meta?.custom?.type === 'tsen');
    const tsen_dev_fields = tsen_data[0].fields.filter((field) => field.name === 'temp');
    // if list is not equal to the refState refList -1, clear refState List and initialize
    if ((tsen_dev_fields).length !== ((tsenList.current).length - 1)) {
      tsenList.current = [];
      tsen_dev_fields.forEach((field) => {
        let tsen_name_value = field.labels!.name;
        let input_el_arr: HTMLInputElement[] = [];
        for (let i = 0; i < 2; i++) {
          const el: HTMLInputElement = document.createElement('input') as HTMLInputElement;
          input_el_arr.push(el);
        };
        let Tsen_ob: RefTsen = new Object({
          tsen_name: input_el_arr[0],
          temp: input_el_arr[1],
        });
        Tsen_ob.tsen_name!.value = tsen_name_value;
        tsenList.current.push(Tsen_ob)
      });
    }; // tsen init done
  }, [data, bcregList, tsenList]);


  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '10px' }}>
      <HorizontalGroup>
        <VerticalGroup>
          {/* <ColoredPanels color="red" width={10} height={30} {...bcregList} /> */}
          <ColoredPanels {...bcregList} />
          <Heaters color="red" width={10} height={30} />
          <TempScale />
        </VerticalGroup>
        {/* <TopView color="red" width={10} height={30} /> */}
        <TopView {...tsenList} />
        <BottomView color="red" width={10} height={30} />
      </HorizontalGroup>
    </div>
  );
};
