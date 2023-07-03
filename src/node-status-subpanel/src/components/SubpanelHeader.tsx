import React, { useState } from 'react';
//import { PanelProps } from '@grafana/data';
import { Button, Select} from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

interface ColoredRectangleProps {
    color: string;
    width: number;
    height: number;
  }

  const inputStyle = {
    width: '70px',
    height: '20px', 
    fontSize: '11px', 
  };
  
  const ColoredRectangle: React.FC<ColoredRectangleProps> = ({ color, width, height }) => {
    const rectangleStyle = {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: color,
    };
    return <div style={rectangleStyle}></div>;
  };

  const NodeName = () => {
    return <input style={inputStyle} type="text" value="mothership" />;
  };

  const MOSTButton = () => {
    return <Button size={'xs'}>
      MOST
      </Button>;
  };

  
  
  const Header: React.FC<ColoredRectangleProps> = ({}) => {
    const [, setValue] = useState<SelectableValue<string>>();
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto', gridGap: '10px' }}>
        <ColoredRectangle color="red" width={10} height={15}/>
        <NodeName/>
        <MOSTButton/>
        <Select
          value={{ label: 'Nadir View' }}
          options={[{ label: 'Nadir View' }, { label: 'View 2' }, { label: 'View 3' }, { label: 'View 4' }, { label: 'View 5' }]}
          onChange={(v) => {
            setValue(v.value);
          }}
          width="auto"
        />
      </div>
    );
  };

  export default Header;

