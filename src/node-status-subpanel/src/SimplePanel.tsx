import React from 'react';
import { PanelProps } from '@grafana/data';
import Header from './components/SubpanelHeader';

export const SimplePanel: React.FC<PanelProps> = ({ options }) => {
  //const { text1, text2, text3, text4, text5, text6 } = options;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '10px' }}>
      <Header color="red" width={10} height={15}/>
    </div>
  );
};
