import { Button, HorizontalGroup, Icon, VerticalGroup } from '@grafana/ui';
import React from 'react';
//import { PanelProps } from '@grafana/data';

const inputStyle = {
    width: '55px',
    height: '15px', 
    fontSize: '9px', 
  };

  const textBoxStyle = {
    width: '100px',
    height: '40px', 
    fontSize: '6px', 
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
    height: '15px', 
    fontSize: '8px', 
    padding: '2px',
    lineHeight: '8px',
  };

  const GroundStation = () => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
        <HorizontalGroup>
        <div style={{ justifySelf: 'start', alignSelf: 'start' }}>
            <text>Ground Station Monitor</text> 
        </div>
        <div style={{ justifySelf: 'end', alignSelf: 'end' }}>
            <Icon name="expand-arrows" size="xs" />
        </div>
        </HorizontalGroup>
        <HorizontalGroup>
            <VerticalGroup>
                <VerticalGroup>
                    <HorizontalGroup>
                        <ColoredRectangle color="cyan" width={10} height={10}/>
                        <text className='even-smaller-font'>Name</text>
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
                        <text className='even-smaller-font'>Name</text>
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
                        <text className='even-smaller-font'>Name</text>
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
                <textarea style={textBoxStyle} value={"UTC Time:\t20:24:20 \nLocal Time:\t20:24:20 \nAzimuth:\t\t0. \nElevation:\t90."}/>
                <textarea style={textBoxStyle} value={"UTC Time:\t20:24:20 \nLocal Time:\t20:24:20 \nAzimuth:\t\t0. \nElevation:\t90."}/>
                <textarea style={textBoxStyle} value={"UTC Time:\t20:24:20 \nLocal Time:\t20:24:20 \nAzimuth:\t\t0. \nElevation:\t90."}/>
            </VerticalGroup>
        </HorizontalGroup>
      </div>
    );
  };

  export default GroundStation;

