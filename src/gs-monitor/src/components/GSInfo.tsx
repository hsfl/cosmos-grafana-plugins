import { Button, HorizontalGroup, Icon, VerticalGroup } from '@grafana/ui';
import React from 'react';
//import { PanelProps } from '@grafana/data';
import { PanelData } from '@grafana/data';

//style for labels
const inputStyle = {
    width: '55px',
    height: '15px', 
    fontSize: '9px', 
    color: '#32CD32',
  };

//style for data boxes
  const textBoxStyle = {
    width: '100px',
    height: '40px', 
    fontSize: '6px', 
  };

//There's probably a better way to make rectangles but this is it for now
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

  //Style for MOST and Contact buttons for each GS
  const buttonStyle = {
    width: '40px',
    height: '15px', 
    fontSize: '8px', 
    padding: '2px',
    lineHeight: '8px',
  };

  export const GroundStation = (props: {
    data: PanelData;
  }) => {

    //Alphabetizing data since it comes in in random orders currently
    const dataArray = [];
    for (let i = 0; i < props.data.series.length; i++) {
      dataArray.push(props.data.series[i]);
    }
  
    dataArray.sort((a, b) => {
      const nameA = a.name!.toUpperCase();
      const nameB = b.name!.toUpperCase();
  
      if (nameA < nameB) {
        return -1; 
      }
      if (nameA > nameB) {
        return 1; 
      }
      return 0; 
    });

    //Unix to HH:MM:SS converter
    const convertUnixToHHMMSS = (timestamp: number) => {
        const date = new Date(timestamp * 1000); // Convert to milliseconds
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    
        return `${hours}:${minutes}:${seconds}`;
      };
    
    //Establishing local time (should probably get from data table eventually?). Currently HST.  
    const localTime = -11
    //Grabbing and converting data for data table
    const unixTimeStampsUTC = [dataArray[1].fields[0].values.get(0), dataArray[3].fields[0].values.get(0), dataArray[5].fields[0].values.get(0)]
    const UTCTimeValues = unixTimeStampsUTC.map((unixTimeStampUTC) => (
        convertUnixToHHMMSS(unixTimeStampUTC)
    ));
    const unixTimeStampsLocal = unixTimeStampsUTC.map(
        (unixTimeStampUTC) => unixTimeStampUTC + 3600 * localTime
    );
    console.log(unixTimeStampsLocal);
    const localTimeValues = unixTimeStampsLocal.map((unixTimeStampLocal) =>
        convertUnixToHHMMSS(unixTimeStampLocal)
    );
  
    const azimuthValues = [dataArray[1].fields[1].values.get(0).toFixed(6), dataArray[3].fields[1].values.get(0).toFixed(6), dataArray[5].fields[1].values.get(0).toFixed(6)]
    const elevationValues = [dataArray[1].fields[3].values.get(0).toFixed(6), dataArray[3].fields[3].values.get(0).toFixed(6), dataArray[5].fields[3].values.get(0).toFixed(6)]
    const valueStrings = azimuthValues.map((azimuthValue, index) => (
        `UTC Time:\t${UTCTimeValues[index]} \nLocal Time:\t${localTimeValues[index]} \nAzimuth:\t\t${azimuthValue} \nElevation:\t${elevationValues[index]}`
    ));

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
                        <input style={inputStyle} type="text" value={dataArray[0].name} />
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
                        <input style={inputStyle} type="text" value={dataArray[2].name} />
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
                    <input style={inputStyle} type="text" value={dataArray[4].name} />
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
                <textarea style={textBoxStyle} value={valueStrings[0]}/>
                <textarea style={textBoxStyle} value={valueStrings[1]}/>
                <textarea style={textBoxStyle} value={valueStrings[2]}/>
            </VerticalGroup>
        </HorizontalGroup>
      </div>
    );
  };

  export default GroundStation;

