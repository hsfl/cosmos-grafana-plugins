import { HorizontalGroup, VerticalGroup } from "@grafana/ui";
import React from "react";
import '../thermal.css';


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

const Heaters: React.FC<ColoredRectangleProps> = () => {
return (
  <div style={{
    display: 'grid',
    gridTemplateRows: 'auto auto auto', 
    gridGap: '5px',
  }}> 
  <VerticalGroup>
    <HorizontalGroup>
      <div style = {{fontSize: '8px'}} >Heater 1</div>
        <div style = {{width: '15px'}}></div>
        <div style = {{fontSize: '8px'}}>Heater 2</div>
      </HorizontalGroup>
      <HorizontalGroup>
          <ColoredRectangle color={"grey"} width={30} height={15} />
          <div style = {{width: '15px'}}></div>
          <ColoredRectangle color={"grey"} width={30} height={15} />
      </HorizontalGroup>
    </VerticalGroup>
  </div>
);
};

export default Heaters;
