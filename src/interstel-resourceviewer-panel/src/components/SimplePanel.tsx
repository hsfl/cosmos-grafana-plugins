import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { ResourceViewer } from './ResourceViewer';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  return (
      <div>
        <ResourceViewer data={data} width={width} height={height} />
      </div>
  );
};
