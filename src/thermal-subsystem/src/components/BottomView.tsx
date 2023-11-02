import { VerticalGroup } from "@grafana/ui";
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

const BottomView: React.FC<ColoredRectangleProps> = () => {
return (
  <div style={{
    display: 'grid',
    gridTemplateRows: 'auto auto auto', 
    gridGap: '5px',
  }}> 
  <VerticalGroup>
  <div style = {{fontSize: '10px'}} >Bottom View</div>
  <ColoredRectangle color={"black"} width={400} height={400} />
    </VerticalGroup>
  </div>
);
};

export default BottomView;
