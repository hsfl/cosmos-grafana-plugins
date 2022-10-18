import React from 'react';
import { Field, FieldType, FieldColorModeId, GrafanaTheme2, PanelProps, getDisplayProcessor } from '@grafana/data';
import { BarGauge, useTheme2 } from '@grafana/ui';
import { SimpleOptions } from 'types';
import { BarGaugeDisplayMode, VizOrientation } from '@grafana/schema';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, fieldConfig }) => {
  const field: Partial<Field> = {
    type: FieldType.number,
    config: {
      color:{mode:FieldColorModeId.Fixed}, 
      min:0,
      max:200,
    }
  };
  // Note: Bar Gauge does not work without setting theme prop (this is undocumented)
  // Note2: Refer copiously to https://github.com/grafana/grafana/blob/2b4613820227dc13057f0e837818c2d8fd6fc15f/packages/grafana-ui/src/components/BarGauge/BarGauge.tsx
  const theme: GrafanaTheme2 = useTheme2();
  field.display = getDisplayProcessor({field, theme});
  return (
    <div style={{ width: width, height: height, overflow: 'auto', display: 'flex', flexDirection: 'row' }}>
      <BarGauge
        height={width/2}
        width={height/2}
        field={field.config}
        display={field.display}
        value={{text:'', numeric: 50, color:'green'}}
        orientation={VizOrientation.Vertical}
        displayMode={BarGaugeDisplayMode.Basic}
        theme={theme}
      />
      <BarGauge
        height={width/2}
        width={height/2}
        field={field.config}
        display={field.display}
        value={{text:'', numeric: 100, color: 'green'}}
        orientation={VizOrientation.Vertical}
        displayMode={BarGaugeDisplayMode.Basic}
        theme={theme}
      />
    </div>
  );
};
