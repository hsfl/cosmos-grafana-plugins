import React from 'react';
import { PanelProps } from '@grafana/data';
import GroundStation from 'components/GSInfo';


export const SimplePanel: React.FC<PanelProps> = () => {
  //const { text1, text2, text3, text4, text5, text6 } = options;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
      <GroundStation/>
    </div>
  );
};
