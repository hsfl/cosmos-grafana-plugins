import React from 'react';
import { PanelProps } from '@grafana/data';
import { InlineFieldRow, InlineLabel, Button, HorizontalGroup } from '@grafana/ui';
import { SimpleOptions /*currentMJD*/ } from './types';
//import { currentMJD } from 'utils/utilFunctions';
import { useInputSuggest } from './helpers/InputWithSuggest';

interface Props extends PanelProps<SimpleOptions> {}

//const defaultTime = currentMJD(-300 / 86400);

// const displayText2 = (options: SimpleOptions) => {
//   if (options.on_off)
//   {
//     const texts: JSX.Element[] = [];
//     for (let i = 0; i<3; i++)
//     {
//       texts.push(<div>Text option value: {options.text}</div>);
//     }
//     return(texts);
//   }
//   return(null);
// };

const useCommand = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
      <InlineFieldRow>
        <InlineLabel width={'auto'}>
          CMD {'>'}
          {useInputSuggest()}
        </InlineLabel>
      </InlineFieldRow>
      <HorizontalGroup spacing="xs">
        <Button size="xs">Send Command</Button>
        <Button size="xs">Macro{"'"}s</Button>
      </HorizontalGroup>
    </div>
  );
};

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  // const displayText = () => {
  //   if (options.on_off)
  //   {
  //     return(
  //       <div>Text option value: {options.text}</div>
  //     );
  //   }
  //   return(null);
  // };

  return (
    <div>
      {/* {options.on_off ? <div>Text option value: {options.text}</div> : null}
      {displayText()}
      {displayText2(options)} */}
      {useCommand()}
      {/* {useRadioButtonGroup()} */}
    </div>
  );
};
