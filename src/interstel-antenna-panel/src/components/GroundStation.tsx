import React from 'react';

const eventStyle = {
  width: '200pxpx',
  height: '80px',
  fontSize: '10px',
};

const GroundStation = ({}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridGap: '5px' }}>
      <textarea
        style={eventStyle}
        value={
          'GS\t\tElevation\t\tRange\nKCC\t\t-90\t\t\t0.165317\nUAF\t\t-31\t\t\t7482.581827\nSSC\t\t-2\t\t\t2943.655339'
        }
      />
    </div>
  );
};

export default GroundStation;
