import React, { useRef, useState } from 'react';
import Select, { ActionMeta, InputActionMeta, SingleValue } from 'react-select';
import { SelectableValue } from '@grafana/data';
//import { InputActionMeta } from '@grafana/ui';

// const commandList = [
//   'Reset',
//   'Reboot',
//   'SendBeacon',
//   'ClearQueue',
//   'ExternalCommand',
//   'ExternalTask',
//   'TestRadio',
//   'ListDirectory',
//   'TransferFile',
//   'TransferNode',
//   'TransferRadio',
//   'TransferList',
//   'InternalRequest',
//   'Ping',
//   'SetTime',
//   'GetTimeHuman',
//   'GetTimeBinary',
//   'SetOpsMode',
//   'AdcsCommunicate',
//   'AdcsState',
//   'AdcsSetRunMode',
//   'AdcsGetAdcsState',
//   'AdcsOrbitParameters',
//   'EpsCommunicate',
//   'EpsSwitchName',
//   'EpsSwitchNumber',
//   'EpsReset',
//   'EpsState',
//   'EpsWatchdog',
//   'EpsSetTime',
//   'EpsMinimumPower',
//   'EpsSwitchNames',
//   'EpsSwitchStatus',
//   'ExecLoadCommand',
//   'ExecAddCommand',
//   'RadioCommunicate',
// ];

const commandList = [{ value: 'Reset' }, { value: 'Reboot' }, { value: 'EpsSwitchName' }];

const groundNodeList = [{ value: 'ground' }, { value: 'ground2' }];
const groundAgentList = [{ value: 'comm' }];
const agentRequestList = [{ value: 'command' }, { value: 'command_adcs' }];
const destNodeList = [{ value: 'iobc' }, { value: 'unibap' }];
const radioUpList = [{ value: 'UHFUP' }, { value: 'RXSNET' }];
// const radioDownList = [{ value: 'UHFDOWN' }, { value: 'TXSI2C' }];

const commandFormat = [
  'agent',
  'GROUND_NODE',
  'GROUND_AGENT',
  'AGENT_REQUEST',
  'DEST_NODE',
  'RADIOUP:RADIODOWN',
  'COMMAND',
  'ARGS',
];
// const optionsList: Array<SelectableValue<string>> = [
//   {
//     label: 'Reset',
//     value: 'agent GROUND_NODE GROUND_AGENT AGENT_REQUEST DEST_NODE RADIOUP:RADIODOWN Reset ARGS',
//     description: 'Resets the given node',
//   },
//   {
//     label: 'Reboot',
//     value: 'agent GROUND_NODE GROUND_AGENT AGENT_REQUEST DEST_NODE RADIOUP:RADIODOWN Reboot ARGS',
//     description: 'Reboot the given node',
//   },
//   {
//     label: 'EpsSwitchName',
//     value: 'agent GROUND_NODE GROUND_AGENT AGENT_REQUEST DEST_NODE RADIOUP:RADIODOWN EpsSwitchName ARGS',
//     description: 'Turn EPS switch on/off',
//   },
// ];

export const useInputSuggest = () => {
  // const [value, setValue] = useState<SelectableValue<string>>();
  const [options, setOptions] = useState<Array<SelectableValue<string>>>(groundNodeList);
  // Reference to current input search string
  const searchQueryTermRef = useRef<string>('');
  const searchQueryIdxRef = useRef<number>(0);
  const selectRef = useRef(null);
  const [inputValue, setInputValue] = useState<string>('');

  // const onInputChange = (event: React.FormEvent<HTMLInputElement>) => {
  //   if (inputRef === undefined) {
  //     return;
  //   }
  //   const splitInput = event.currentTarget.value.split(/\s+/);
  //   const termIdx = Math.min(splitInput.length - 1, commandFormat.length - 1);
  //   const newTerm = splitInput[termIdx];
  //   if (!newTerm.length) {
  //     return;
  //   }

  //   console.log(commandFormat[termIdx] + ':', newTerm);
  //   const argIdx = commandFormat.length - termIdx - 1;

  // };

  // Event fired when user types into search
  const onInputChange = (value: string, actionMeta: InputActionMeta) => {
    console.log('onInputChange:', value, actionMeta);
    console.log('selectRef.current:', selectRef.current);

    if (actionMeta.action === 'input-change') {
      // Called if typing
      const splitInput = value.split(/\s+/);
      const termIdx = Math.min(splitInput.length - 1, commandFormat.length - 1);
      const newTerm = splitInput[termIdx];
      searchQueryTermRef.current = newTerm;
      searchQueryIdxRef.current = termIdx;
      console.log('input-change', searchQueryIdxRef.current, searchQueryTermRef.current);
      updateOptions();
      setInputValue(value);
    } else if (actionMeta.action === 'set-value') {
      // Called if tab-completing based on suggestion
      //   const splitInput = actionMeta.prevInputValue.split(/\s+/);
      //   const termIdx = Math.min(splitInput.length, commandFormat.length - 1);
      //   const newTerm = ''
      // searchQueryTermRef.current = newTerm;
      // searchQueryIdxRef.current = termIdx;
      // console.log('set-value', searchQueryIdxRef.current, '\''+searchQueryTermRef.current+'\'')
      // updateOptions();
    }
  };

  const updateOptions = () => {
    console.log('updateoptions:', searchQueryIdxRef.current);
    switch (searchQueryIdxRef.current) {
      case 0:
        // GROUND_NODE
        setOptions(groundNodeList);
        //console.log('ret', ret);
        break;
      case 1:
        // GROUND_AGENT
        setOptions(groundAgentList);
        break;
      case 2:
        // AGENT_REQUEST
        setOptions(agentRequestList);
        break;
      case 3:
        // DEST_NODE
        setOptions(destNodeList);
        break;
      case 4:
        // RADIOUP:RADIODOWN
        setOptions(radioUpList);
        break;
      case 5:
        // COMMAND
        setOptions(commandList);
        break;
      default:
        // ARGS
        break;
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'Tab') {
      return;
    }
  };

  //const onSelectChange = (option: SelectableValue<string>) => {
  const onChange = (option: SingleValue<SelectableValue<string>>, action: ActionMeta<SelectableValue<string>>) => {
    console.log('onChange value:', option, action);
    if (action.action !== 'select-option' || option?.value === undefined) {
      return;
    }
    console.log('currentTerm:', searchQueryIdxRef, searchQueryTermRef);
    setInputValue((inputValue) => {
      // Remove unformed last word, if it exists, and replace with selected value
      const lastChar = inputValue.slice(-1);
      if (lastChar === ' ') {
        return inputValue + option.value + ' ';
      }
      const prevStr = inputValue.split(/\s+/);
      prevStr[prevStr.length - 1] = option.value!;
      return prevStr.join(' ') + ' ';
    });
    searchQueryTermRef.current = '';
    searchQueryIdxRef.current += 1;
    updateOptions();
  };
  console.log('rerender', options, 'idx:', searchQueryIdxRef.current, searchQueryTermRef.current);

  // Filters available options based on current searchQuery string
  // Called for each option in the list of options
  // option: contains label and value of the currently examined option
  // searchQuery: The entire search string accumulated so far
  const filterOption = (option: SelectableValue<string>, searchQuery: string): boolean => {
    let ret = false;

    if (option.value === undefined) {
      return false;
    }

    switch (searchQueryIdxRef.current) {
      case 0:
        // GROUND_NODE
        ret = option.value.includes(searchQueryTermRef.current);
        break;
      case 1:
        // GROUND_AGENT
        ret = option.value.includes(searchQueryTermRef.current);
        break;
      case 2:
        // AGENT_REQUEST
        ret = option.value.includes(searchQueryTermRef.current);
        break;
      case 3:
        // DEST_NODE
        ret = option.value.includes(searchQueryTermRef.current);
        break;
      case 4:
        // RADIOUP:RADIODOWN
        ret = option.value.includes(searchQueryTermRef.current);
        break;
      case 5:
        // COMMAND
        ret = option.value.includes(searchQueryTermRef.current);
        break;
      default:
        // ARGS
        return true;
    }

    // if (option.value?.includes(searchQuery)) {
    //   console.log('option:', option, 'searchQuery:', searchQuery)
    //   return true;
    // }
    return ret;
  };
  // Format the options list label, show only the current relevant term in the full value
  const formatOptionLabel = (option: SelectableValue<string>): string => {
    if (option.value === undefined) {
      return '';
    }
    // Split full
    // const splitStr = option.value.split(' ');
    switch (searchQueryIdxRef.current) {
      case 0:
    }

    return option.value;
  };

  return (
    <div style={{ width: '35em', paddingLeft: '1em', overflow: 'visible' }}>
      <Select
        ref={selectRef}
        inputValue={inputValue}
        isClearable
        isSearchable
        options={options}
        onChange={onChange}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
        filterOption={filterOption}
        getOptionLabel={formatOptionLabel}
        closeMenuOnSelect={false}
        // With these two props, menulist always renders on top
        menuPortalTarget={document.body}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        //components={{Input: CustomInput}}
      />
    </div>
  );
};
//const CustomInput = (props: InputProps<SelectableValue<string>, false>)  =>
// const CustomInput = ({innerRef, innerProps})  =>
// {
//   return (
//     <div >
//         <input ref={innerRef} {...innerProps} />
//     </div>
//   );
// }
