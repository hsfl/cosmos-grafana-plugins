import { HorizontalGroup, VerticalGroup } from "@grafana/ui";
import React from "react";
import '../thermal.css';


interface ColoredRectangleProps {
  color: string;
  width: number;
  height: number;
}

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

const ColoredRectangle: React.FC<ColoredRectangleProps> = ({ color, width, height }) => {
  const rectangleStyle = {
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: color,
  };
  return <div style={rectangleStyle}></div>;
};

const ColoredPanels: React.FC<ColoredRectangleProps> = () => {
return (
  <div style={{
    display: 'grid',
    gridTemplateRows: 'auto auto auto', 
    gridGap: '5px',
  }}> 
      <VerticalGroup>
      <div style = {{height: '15px'}}></div>
        <HorizontalGroup>
          <div style = {{width: '30px'}}></div>
          <VerticalGroup>
          <div style = {{fontSize: '8px'}} >#15</div>
          <div style = {{fontSize: '8px'}} >#16</div>
          </VerticalGroup>
          <VerticalGroup>
            <div style = {{fontSize: '8px'}} >-15.3</div>
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <div style = {{fontSize: '8px'}} >-15.3</div>
          </VerticalGroup>
          <VerticalGroup>
          <div style = {{fontSize: '8px'}} >#13</div>
          <div style = {{fontSize: '8px'}} >#14</div>
          </VerticalGroup>
          <VerticalGroup>
            <div style = {{fontSize: '8px'}} >-15.3</div>
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <div style = {{fontSize: '8px'}} >-15.3</div>
          </VerticalGroup>
          <VerticalGroup>
          <div style = {{fontSize: '8px'}} >#11</div>
          <div style = {{fontSize: '8px'}} >#12</div>
          </VerticalGroup>
          <VerticalGroup>
            <div style = {{fontSize: '8px'}} >-15.3</div>
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <div style = {{fontSize: '8px'}} >-15.3</div>
          </VerticalGroup>
        </HorizontalGroup>
        <div style = {{height: '10px'}}></div>
        <HorizontalGroup>
        <div style = {{width: '40px', height: '0px', fontSize: '8px'}} >#1</div>
        <div style = {{width: '125px', height: '0px', fontSize: '8px'}} >#2</div>
        <div style = {{width: '30px', height: '0px', fontSize: '8px'}} >#9</div>
        <div style = {{width: '40px', height: '0px', fontSize: '8px'}} >#10</div>
        </HorizontalGroup>
        <HorizontalGroup>
          <ColoredRectangle color={"cyan"} width={30} height={20} />
          <ColoredRectangle color={"cyan"} width={30} height={20} />
          <div style = {{width: '15px'}}></div>
          <ColoredRectangle color={"cyan"} width={45} height={30} />
          <div style = {{width: '15px'}}></div>
          <ColoredRectangle color={"cyan"} width={30} height={20} />
          <ColoredRectangle color={"cyan"} width={30} height={20} />
        </HorizontalGroup>
        <HorizontalGroup>
        <div style = {{width: '30px', fontSize: '8px'}} >-15.3</div>
        <div style = {{width: '60px', fontSize: '8px'}} >-15.3</div>
        <div style = {{width: '60px', fontSize: '8px'}} >-15.3</div>
        <div style = {{width: '30px', fontSize: '8px'}} >-15.3</div>
        <div style = {{width: '30px', fontSize: '8px'}} >-15.3</div>
        </HorizontalGroup>
        <div style = {{height: '10px'}}></div>
        <HorizontalGroup>
          <div style = {{width: '30px'}}></div>
          <VerticalGroup>
          <div style = {{fontSize: '8px'}} >#3</div>
          <div style = {{fontSize: '8px'}} >#4</div>
          </VerticalGroup>
          <VerticalGroup>
            <div style = {{fontSize: '8px'}} >-15.3</div>
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <div style = {{fontSize: '8px'}} >-15.3</div>
          </VerticalGroup>
          <VerticalGroup>
          <div style = {{fontSize: '8px'}} >#5</div>
          <div style = {{fontSize: '8px'}} >#6</div>
          </VerticalGroup>
          <VerticalGroup>
            <div style = {{fontSize: '8px'}} >-15.3</div>
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <div style = {{fontSize: '8px'}} >-15.3</div>
          </VerticalGroup>
          <VerticalGroup>
          <div style = {{fontSize: '8px'}} >#7</div>
          <div style = {{fontSize: '8px'}} >#8</div>
          </VerticalGroup>
          <VerticalGroup>
            <div style = {{fontSize: '8px'}} >-15.3</div>
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <ColoredRectangle color={"cyan"} width={20} height={30} />
            <div style = {{fontSize: '8px'}} >-15.3</div>
          </VerticalGroup>
        </HorizontalGroup>
      </VerticalGroup>
  </div>
);
};

export default ColoredPanels;
