import React, { useImperativeHandle, useRef } from 'react';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { RectWithTextHandle, RectWithTextProps } from '../types';

// Component displaying some text in a rectangle
const RectWithText = React.forwardRef<RectWithTextHandle, RectWithTextProps>((props: RectWithTextProps, ref) => {
  const {width, height, temperature/*, refRect, refText*/} = props;
  const padding = 5;
  const refRect = useRef<SVGRectElement>(null);
  const refText = useRef<SVGTextElement>(null);
  // Expose rect and text references to parent component
  useImperativeHandle(ref, () => ({
    get rect() {
      return refRect.current;
    },
    get text() {
      return refText.current;
    },
  }));

  return (
    <div style={{display: 'inline-block'}}>
      <svg width={width+padding*2} height={height+padding*2}>
        <Group>
          <rect
            ref={refRect}
            x={padding/2}
            y={padding/2}
            width={width}
            height={height}
            fill="rgba(0, 225, 0, 1)"
          />
          <Text
            innerTextRef={refText}
            dx={padding/2+width/2}
            dy={padding/2+height/2}
            textAnchor='middle'
            verticalAnchor='middle'
            fontFamily="Helvetica"
            fontSize={16}
            style={{userSelect:'none'}}
          >
            {temperature}
          </Text>
        </Group>
      </svg>
    </div>
    
  );
});
RectWithText.displayName = 'RectWithText';

export default RectWithText;
