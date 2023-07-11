import React, { useState } from 'react';
//import { PanelProps } from '@grafana/data';
import { Button, Select} from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

interface ColoredRectangleProps {
    color: string;
    width: number;
    height: number;
  }

  const nameStyle = {
    width: '70px',
    height: '30px', 
    fontSize: '11px', 
  };

  const buttonStyle = {
    width: '40px',
    height: '30px', 
    fontSize: '11px', 
    padding: '2px',
    lineHeight: '8px',
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
    return <input style={nameStyle} type="text" value="mothership" />;
  };

  const MOSTButton = () => {
    return <Button style={buttonStyle} size={'xs'}>
      MOST
      </Button>;
  };

  
  
  const Header: React.FC<ColoredRectangleProps> = ({}) => {
    const [, setValue] = useState<SelectableValue<string>>();
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto'}}>
        <ColoredRectangle color="green" width={10} height={30}/>
        <NodeName/>
        <MOSTButton/>
        <Select
          className="custom-select"
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

