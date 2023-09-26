import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { OrbitDisplayPanel } from './OrbitDisplayPanel';

// Plugin entry point
export const plugin = new PanelPlugin<SimpleOptions>(OrbitDisplayPanel).setPanelOptions((builder) => {
  return builder
    .addBooleanSwitch({
      path: 'showCesiumIonLogo',
      name: 'Show Cesium Ion Logo',
      defaultValue: false,
    })
    .addBooleanSwitch({
      path: 'showTimeline',
      name: 'Show Timeline',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showAnimation',
      name: 'Show Time Wheel',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showPath',
      name: 'Show Path Lines',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showTargets',
      name: 'Show Targets',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showSensorCones',
      name: 'Show Sensor Cones',
      defaultValue: false,
    })
    .addBooleanSwitch({
      path: 'showFormationGoalLocations',
      name: 'Show Formation Goal Locations',
      defaultValue: true,
    });
});
