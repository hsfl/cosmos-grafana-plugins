import React from 'react';


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

  const OrbitDisplay: React.FC<ColoredRectangleProps> = ({}) => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'auto'}}>
        <ColoredRectangle color="black" width={150} height={110}/>
      </div>
    );
  };

  export default OrbitDisplay;



