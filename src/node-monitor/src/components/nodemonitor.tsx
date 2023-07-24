import { Button, HorizontalGroup, Icon, VerticalGroup } from '@grafana/ui';
import React from 'react';
//import { PanelProps } from '@grafana/data';
//import MercatorMap from '../Mercator_map.jpg'
import mercator from '../mercator.png'

//   interface ColoredRectangleProps {
//     color: string;
//     width: number;
//     height: number;
//   }
  
//   const ColoredRectangle: React.FC<ColoredRectangleProps> = ({ color, width, height }) => {
//     const rectangleStyle = {
//       width: `${width}px`,
//       height: `${height}px`,
//       backgroundColor: color,
//     };
//     return <div style={rectangleStyle}></div>;
//   };

  const smallerFontSize = {
    fontSize: '10px',
  };

  const buttonStyle = {
    width: '85px',
    height: '15px', 
    fontSize: '10px', 
    padding: '2px',
    lineHeight: '8px',
  };

  const Formation = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '2px' }}>
        <HorizontalGroup>
        <div style={{ justifySelf: 'start', alignSelf: 'start' }}>
            <text>Node Monitor</text> 
        </div>
        <div style={{ justifySelf: 'end', alignSelf: 'end' }}>
            <Icon name="expand-arrows" size="xs" />
        </div>
        </HorizontalGroup>
        <VerticalGroup>
        {/* <ColoredRectangle color="black" width={275} height={80}/> */}
        <img src={mercator} alt="Mercator Map" width={275} height={80} />
        <HorizontalGroup>
            <VerticalGroup>
                <div style={smallerFontSize}>
                    <text style={{color: 'cyan'}}>Nodes Being Monitored</text>
                </div>
                <textarea style={{width: '100px', height: '35px', fontSize: '7px'}} value={"01 \tsurreysc \tGS \n02\tkauaicc\tGS \n03\tuafairbanks\tGS \n04\tChildSat_3\tSAT\n05\tChildSat_4\tSAT"}/>
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

