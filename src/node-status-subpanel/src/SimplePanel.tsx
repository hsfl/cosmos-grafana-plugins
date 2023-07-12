import React from 'react';
import { PanelProps } from '@grafana/data';
import Header from './components/SubpanelHeader';
import OrbitDisplay from 'components/SubpanelOrbitDisplay';
import SubsystemHealth from 'components/SubsystemHealth';
import { HorizontalGroup } from '@grafana/ui';
import Footer from 'components/OrbitalInformation';


export const SimplePanel: React.FC<PanelProps> = () => {
  //const { text1, text2, text3, text4, text5, text6 } = options;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
      <Header color="red" width={10} height={30}/>
      <HorizontalGroup>
        <OrbitDisplay color="black" width={50} height={50}/>
        <SubsystemHealth/>
      </HorizontalGroup>
      <Footer/>
    </div>
  );
};
