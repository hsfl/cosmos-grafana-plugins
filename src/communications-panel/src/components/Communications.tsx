import React from 'react';
import { HorizontalGroup, VerticalGroup } from '@grafana/ui';

interface ColoredRectangleProps {
    color: string;
    width: number;
    height: number;
  }

  const nameStyle = {
    width: '67px',
    height: '30px', 
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
  
  
  const Header: React.FC<ColoredRectangleProps> = () => {
    const names: string[] = ["Mothership", "ChildSat_01", "ChildSat_02", "ChildSat_03", "ChildSat_04", "ChildSat_05", "UAV_01", "UAV_02", "Ship_01", "surreysc", "kauaicc", "uafairbanks"];
    const colors: string[] = ["green", "green", "yellow", "green", "green", "red", "green", "green", "green", "green", "orange", "green","green", "green", "yellow", "green", "green", "red", "green", "green", "green", "green", "orange", "green","green", "green", "yellow", "green", "green", "red", "green", "green", "green", "green", "orange", "green"];
  
    const commsTable = () => {
      const groups = [];
      for (let i = 0; i < names.length; i += 3) {
        const horizontalGroups = names.slice(i, i + 3).map((name, index) => (
          <HorizontalGroup key={index}>
            <input style={nameStyle} type="text" value={name} />
            <VerticalGroup spacing="xs">
                <ColoredRectangle color={colors[3*(i + index)]} width={24} height={10} />
                <HorizontalGroup spacing="xs">
                    <ColoredRectangle color={colors[3*(i + index)+1]} width={10} height={10} />
                    <ColoredRectangle color={colors[3*(i + index)+2]} width={10} height={10} />
                </HorizontalGroup>
            </VerticalGroup>
          </HorizontalGroup>
        ));
        groups.push(
          <VerticalGroup key={i}>
            {horizontalGroups}
          </VerticalGroup>
        );
      }
      return groups;
    };
  
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        <HorizontalGroup>
          {commsTable()}
        </HorizontalGroup>
      </div>
    );
  };
  

  export default Header;

