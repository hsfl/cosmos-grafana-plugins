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

  const buttonStyle = {
    width: '85px',
    height: '20px', 
    fontSize: '10px', 
    padding: '2px',
    lineHeight: '8px',
  };

  const Formation: React.FC<ColoredRectangleProps> = ({}) => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '2px' }}>
        <VerticalGroup>
        <ColoredRectangle color="black" width={275} height={100}/>
        <HorizontalGroup>
            <VerticalGroup>
                <div style={smallerFontSize}>
                    <text>Nodes Being Monitored</text>
                </div>
                <textarea style={{width: '100px', height: '40px', fontSize: '7px'}} value={"01 \tsurreysc \tGS \n02\tkauaicc\tGS \n03\tuafairbanks\tGS \n04\tChildSat_3\tSAT\n05\tChildSat_4\tSAT"}/>
            </VerticalGroup>
            <VerticalGroup>
                <Button style={buttonStyle} size={'xs'}>
                Flight Dynamics
                </Button>
                <Button style={buttonStyle} size={'xs'}>
                Target Monitor
                </Button>
            </VerticalGroup>
        </HorizontalGroup>
        </VerticalGroup>
      </div>
    );
  };

  export default Formation;

