import React from 'react';
import { PanelProps } from '@grafana/data';
import GroundStation from 'components/GSInfo';


export const SimplePanel: React.FC<PanelProps> = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
      <GroundStation/>
    </div>
  );
};
