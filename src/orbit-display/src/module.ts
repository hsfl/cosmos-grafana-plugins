import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { OrbitDisplayPanel } from './OrbitDisplayPanel';

// Plugin entry point
export const plugin = new PanelPlugin<SimpleOptions>(OrbitDisplayPanel).setPanelOptions((builder) => {
  return builder
    .addBooleanSwitch({
      path: 'showTimeline',
      name: 'Show Timeline',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showAnimation',
      name: 'Show Animatino',
      defaultValue: true,
    });
});
