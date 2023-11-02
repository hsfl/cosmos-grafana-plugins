import React from 'react';
import { PanelProps } from '@grafana/data';
import ColoredPanels from './components/SolarPanels'
import TempScale from './components/TempScale'
import Heaters from './components/Heaters'
import TopView from './components/TopView'
import BottomView from './components/BottomView'
import { HorizontalGroup, VerticalGroup } from '@grafana/ui';



export const SimplePanel: React.FC<PanelProps> = ({ options }) => {
  //const { text1, text2, text3, text4, text5, text6 } = options;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '10px' }}>
      <HorizontalGroup>
        <VerticalGroup>
      <ColoredPanels color="red" width={10} height={30}/>
      <Heaters color="red" width={10} height={30}/>
      <TempScale/>
      </VerticalGroup>
      <TopView color="red" width={10} height={30}/>
      <BottomView color="red" width={10} height={30}/>
      </HorizontalGroup>
    </div>
  );
};
