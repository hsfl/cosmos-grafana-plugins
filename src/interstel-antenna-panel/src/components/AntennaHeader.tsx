import React, { useState } from 'react';
//import { PanelProps } from '@grafana/data';
import { HorizontalGroup, Select, VerticalGroup } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

interface ColoredRectangleProps {
  color: string;
  width: number;
  height: number;
}

const inputStyle = {
  width: '70px',
  height: '30px',
  fontSize: '12px',
};

const ColoredRectangle: React.FC<ColoredRectangleProps> = ({ color, width, height }) => {
  const rectangleStyle = {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: color,
  };
  return <div style={rectangleStyle}></div>;
};

const Header = ({}) => {
  const [, setValue] = useState<SelectableValue<string>>();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto' }}>
      <VerticalGroup>
        <HorizontalGroup>
          <text> Antenna </text>
          <Select
            className="custom-select"
            value={{ label: 'S-band patch' }}
            options={[
              { label: 'S-band patch' },
              { label: 'Option 2' },
              { label: 'Option 3' },
              { label: 'Option 4' },
              { label: 'Option 5' },
            ]}
            onChange={(v) => {
              setValue(v.value);
            }}
            width="auto"
          />
        </HorizontalGroup>
        <HorizontalGroup>
          <text> Beacon </text>
          <ColoredRectangle color={'black'} width={30} height={20} />
          <text> Carrier </text>
          <ColoredRectangle color={'black'} width={30} height={20} />
          <text> Signal Lock </text>
          <ColoredRectangle color={'black'} width={30} height={20} />
        </HorizontalGroup>
        <HorizontalGroup>
          <text> Transponder </text>
          <input style={inputStyle} type="text" value="Normal" />
        </HorizontalGroup>
      </VerticalGroup>
    </div>
  );
};

export default Header;
