import { Button, HorizontalGroup, VerticalGroup } from '@grafana/ui';
import React from 'react';
//import { PanelProps } from '@grafana/data';

  interface ColoredRectangleProps {
    color: string;
    width: number;
    height: number;
  }
  
  const ColoredRectangle: React.FC<ColoredRectangleProps> = ({ color, width, height }) => {
    const rectangleStyle = {
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: color,
    };
    return <div style={rectangleStyle}></div>;
  };

  const smallerFontSize = {
    fontSize: '10px',
  };

  const nameStyle = {
    width: '60px',
    height: '30px', 
    fontSize: '11px', 
  };

  const buttonStyle = {
    width: '95px',
    height: '20px', 
    fontSize: '10px', 
    padding: '2px',
    lineHeight: '8px',
  };

  const Formation: React.FC<ColoredRectangleProps> = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '2px' }}>
        <VerticalGroup>
        <ColoredRectangle color="black" width={225} height={120}/>
        <HorizontalGroup>
            <div style={smallerFontSize}>
                <text>Formation</text>
            </div>
            <input style={nameStyle} type="text" value="Diamond"/>
            <Button style={buttonStyle} size={'xs'}>
                Formation Design
            </Button>
        </HorizontalGroup>
        </VerticalGroup>
      </div>
    );
  };

  export default Formation;

