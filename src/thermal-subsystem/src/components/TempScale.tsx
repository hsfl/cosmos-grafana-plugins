import { HorizontalGroup, VerticalGroup } from "@grafana/ui";
import React from "react";
import '../thermal.css';

// const nameStyle = {
//   width: '60px',
//   height: '30px', 
//   fontSize: '10px', 
//   //color: '#32CD32',
// };

// const inputStyle = {
//   width: '76px',
//   height: '20px',
//   fontSize: '10px',
//   //color: '#32CD32',
// }

// const ColoredRectangle: React.FC<ColoredRectangleProps> = ({ color, width, height }) => {
//   const rectangleStyle = {
//     width: `${width}px`,
//     height: `${height}px`,
//     backgroundColor: color,
//   };
//   return <div style={rectangleStyle}></div>;
// };

const TempScale = () => {
return (
  <div style={{
    display: 'grid',
    gridTemplateRows: 'auto auto auto', 
    gridGap: '5px',
  }}> 
      <VerticalGroup>
      <HorizontalGroup>
        <div style = {{fontSize: '8px'}} >Temperature Scale</div>
        <div style = {{width: '30px'}}></div>
        <div style = {{fontSize: '8px'}}>All temperatures in deg C</div>
        </HorizontalGroup>
        <HorizontalGroup>
        <div style = {{fontSize: '8px'}} >-100</div>
        <div style = {{width: '13px'}}></div>
        <div style = {{fontSize: '8px'}}>-50</div>
        <div style = {{width: '13px'}}></div>
        <div style = {{fontSize: '8px'}}>0</div>
        <div style = {{width: '13px'}}></div>
        <div style = {{fontSize: '8px'}}>50</div>
        <div style = {{width: '13px'}}></div>
        <div style = {{fontSize: '8px'}}>100</div>
        <div style = {{width: '13px'}}></div>
        <div style = {{fontSize: '8px'}}>150</div>
        </HorizontalGroup>
        <div className="rainbow-rectangle"></div>
      </VerticalGroup>
  </div>
);
};

export default TempScale;
