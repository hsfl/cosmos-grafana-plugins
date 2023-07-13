import { Button, HorizontalGroup, VerticalGroup } from '@grafana/ui';
import React from 'react';
//import { PanelProps } from '@grafana/data';

const inputStyle = {
    width: '60px',
    height: '20px', 
    fontSize: '10px', 
  };

  const textBoxStyle = {
    width: '50px',
    height: '50px', 
    fontSize: '7px', 
  };

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

  const buttonStyle = {
    width: '40px',
    height: '20px', 
    fontSize: '8px', 
    padding: '2px',
    lineHeight: '8px',
  };

  const GroundStation = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        <HorizontalGroup>
            <VerticalGroup>
                <VerticalGroup>
                    <HorizontalGroup>
                        <ColoredRectangle color="cyan" width={10} height={10}/>
                        <text className='smaller-font'>Name</text>
                        <input style={inputStyle} type="text" value="surreysc" />
                    </HorizontalGroup>
                    <HorizontalGroup>
                        <Button style={buttonStyle} size={'xs'}>
                            MOST
                        </Button>
                        <Button style={buttonStyle} size={'xs'}>
                            Contact
                        </Button>
                    </HorizontalGroup>
                </VerticalGroup>
                <VerticalGroup>
                    <HorizontalGroup>
                        <ColoredRectangle color="purple" width={10} height={10}/>
                        <text className='smaller-font'>Name</text>
                        <input style={inputStyle} type="text" value="kauaicc" />
                    </HorizontalGroup>
                    <HorizontalGroup>
                        <Button style={buttonStyle} size={'xs'}>
                            MOST
                        </Button>
                        <Button style={buttonStyle} size={'xs'}>
                            Contact
                        </Button>
                    </HorizontalGroup>
                </VerticalGroup>
                <VerticalGroup>
                    <HorizontalGroup>
                        <ColoredRectangle color="magenta" width={10} height={10}/>
                        <text className='smaller-font'>Name</text>
                        <input style={inputStyle} type="text" value="uafairbanks" />
                    </HorizontalGroup>
                    <HorizontalGroup>
                        <Button style={buttonStyle} size={'xs'}>
                            MOST
                        </Button>
                        <Button style={buttonStyle} size={'xs'}>
                            Contact
                        </Button>
                    </HorizontalGroup>
                </VerticalGroup>
            </VerticalGroup>
            <VerticalGroup>
            <text className='even-smaller-font'>UTC Time:<br></br>Local Time:<br></br>Azimuth:<br></br>Elevation:</text>
            <text className='even-smaller-font'>UTC Time:<br></br>Local Time:<br></br>Azimuth:<br></br>Elevation:</text>
            <text className='even-smaller-font'>UTC Time:<br></br>Local Time:<br></br>Azimuth:<br></br>Elevation:</text>
            </VerticalGroup>
            <VerticalGroup>
                <textarea style={textBoxStyle} value={"20:24:20 \n20:24:20 \n0. \n90."}/>
                <textarea style={textBoxStyle} value={"20:24:20 \n20:24:20 \n0. \n90."}/>
                <textarea style={textBoxStyle} value={"20:24:20 \n20:24:20 \n0. \n90."}/>
            </VerticalGroup>
        </HorizontalGroup>
      </div>
    );
  };

  export default GroundStation;

