import React from 'react';
import { PanelProps } from '@grafana/data';
import ColoredPanels from './components/SolarPanels'
import TempScale from './components/TempScale'



export const SimplePanel: React.FC<PanelProps> = ({ options }) => {
  //const { text1, text2, text3, text4, text5, text6 } = options;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '10px' }}>
      <ColoredPanels color="red" width={10} height={30}/>
      <TempScale color="red" width={10} height={30}/>
    </div>
  );
};
