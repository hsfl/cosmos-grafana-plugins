import React from 'react';
import { PanelProps } from '@grafana/data';
import EstimatedStates from 'components/EstimatedStates';
import Controls from 'components/Controls';
import GPS from 'components/GPS';
import IMU from 'components/IMU';
import SunSensor from 'components/SunSensor';

export const SimplePanel: React.FC<PanelProps> = () => {

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
      <IMU/>
      <SunSensor/>
      <GPS/>
      <Controls/>
      <EstimatedStates/>
    </div>
  );
};
