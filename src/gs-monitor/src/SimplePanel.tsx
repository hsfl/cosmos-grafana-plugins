import React from 'react';
import { PanelProps } from '@grafana/data';
import GroundStation from 'components/GSInfo';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> {}


export const SimplePanel: React.FC<Props> = ({ data }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
      <GroundStation data={data}/>
    </div>
  );
};
