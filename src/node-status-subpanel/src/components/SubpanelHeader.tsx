import React, { useState } from 'react';
//import { PanelProps } from '@grafana/data';
import { Button, Icon, Select} from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
//import { css } from '@emotion/css';

interface ColoredRectangleProps {
    color: string;
    width: number;
    height: number;
  }

  const nameStyle = {
    width: '60px',
    height: '30px', 
    fontSize: '10px', 
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
  
  const Header: React.FC<ColoredRectangleProps> = ({}) => {
    const [, setValue] = useState<SelectableValue<string>>();
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto auto'}}>
        <ColoredRectangle color="green" width={10} height={30}/>
        <input style={nameStyle} type="text" value="mothership" />
        <Button style={buttonStyle} size={'xs'}>
          MOST
        </Button>
        <Select
          className="custom-select"
          value={{ label: 'Nadir View' }}
          options={[{ label: 'Nadir View' }, { label: 'View 2' }, { label: 'View 3' }, { label: 'View 4' }, { label: 'View 5' }]}
          onChange={(v) => {
            setValue(v.value);
          }}
          width="auto"
        />
        <Icon name="expand-arrows" size="sm" />
      </div>
    );
  };

  export default Header;

