import React, { useState } from 'react';
import { PanelProps, SelectableValue } from '@grafana/data';
import { InlineFieldRow, AsyncSelect, InlineLabel, Button, HorizontalGroup } from '@grafana/ui';
import { SimpleOptions /*currentMJD*/ } from './types';
//import { currentMJD } from 'utils/utilFunctions';

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

const options = [
  { label: 'Option 1' },
  { label: 'Option 2' },
  { label: 'Option 3' },
  { label: 'Option 4' },
  { label: 'Option 5' },
  { label: 'Option 6' },
];

const loadAsyncOptions = () => {
  return new Promise<Array<SelectableValue<string>>>((resolve) => {
    setTimeout(() => {
      resolve(options);
    }, 2000);
  });
};
const useBasicSelectAsync = () => {
  const [value, setValue] = useState<SelectableValue<string>>();

  return (
    <AsyncSelect
      loadOptions={loadAsyncOptions}
      defaultOptions
      value={value}
      width={30}
      onChange={(v) => {
        setValue(v);
      }}
    />
  );
};

const useCommand = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
      <InlineFieldRow>
        <InlineLabel width={40}>
          CMD {'>'}
          {useBasicSelectAsync()}
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
