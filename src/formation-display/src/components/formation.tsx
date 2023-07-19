import { Button, HorizontalGroup, Icon, VerticalGroup } from '@grafana/ui';
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
    height: '15px', 
    fontSize: '10px', 
    padding: '2px',
    lineHeight: '8px',
  };

  const Formation: React.FC<ColoredRectangleProps> = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '2px' }}>
        <HorizontalGroup>
                <div style={{ justifySelf: 'start', alignSelf: 'start' }}>
            <text>Formation Display</text> 
        </div>
        <div style={{ justifySelf: 'end', alignSelf: 'end' }}>
            <Icon name="expand-arrows" size="xs" />
        </div>
        </HorizontalGroup>
        <VerticalGroup>
        <ColoredRectangle color="black" width={220} height={100}/>
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

