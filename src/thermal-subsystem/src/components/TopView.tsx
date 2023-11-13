import { VerticalGroup, HorizontalGroup } from "@grafana/ui";
import React from "react";
import { RefTsen } from '../types';
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

const tempStyle = {
  width: '75px',
  height: '15px',
  fontSize: '10px',
  color: '#32CD32',
};

const TopView = (refInputs: React.MutableRefObject<RefTsen[]>) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: 'auto auto auto',
      gridGap: '5px',
    }}>
      {refInputs.current.map((tsenRef, i) => {
        return (
          <HorizontalGroup key={`tsen-${i}`}>
            <text >{`TSEN TEMP ${i + 1}`}</text>
            <input ref={(ref) => (tsenRef['temp'] = ref)} style={tempStyle} type="text" value="" />
          </HorizontalGroup>
        )
      })}
      <VerticalGroup>
        <div style={{ fontSize: '10px' }} >Top View</div>
        <ColoredRectangle color={"black"} width={400} height={400} />
      </VerticalGroup>
    </div>
  );
};

export default TopView;
