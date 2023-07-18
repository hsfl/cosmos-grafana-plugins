import React from 'react';
import { PanelProps } from '@grafana/data';
import Formation from 'components/nodemonitor';


export const SimplePanel: React.FC<PanelProps> = () => {

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
      <Formation color="black" width={50} height={50}/>
    </div>
  );
};
