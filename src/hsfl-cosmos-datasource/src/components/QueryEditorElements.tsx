// To prevent QueryEditor.tsx from getting too bloated
import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import { nodalawareTypeArgs, posTypeOptions, SelectOption } from '../types';

// Custom rendering for Select dropdown options -- displays label and description
export const renderOption = <T,>(props: React.HTMLAttributes<HTMLLIElement>, option: SelectOption<T>) => (
  <ListItem {...props} style={{ display: 'block' }}>
    <div>{option.label}</div>
    <div style={{ color: 'grey' }}>{option.description}</div>
  </ListItem>
);

export const QueryArgComponent = (props: {
  // Callback function to run when user changes the arg input
  onChange: (value: string) => void,
  // The currently selected query option, e.g., "Position"
  type: string,
  // The state of the current arg
  arg: string,
}) => {
  const { onChange, type, arg } = props;

  return (
    type === 'position' ? (
      <div>
        Type
        <Autocomplete
          disableClearable
          options={posTypeOptions}
          value={posTypeOptions.find((option) => option.value === arg)}
          onChange={(event, value) => onChange(value.value)}
          renderInput={(params) => <TextField {...params} />}
          renderOption={renderOption}
          componentsProps={{ popper: { placement: 'bottom-start', style: { width: 'fit-content' } } }}
          style={{ gridColumn: 2, width: 'fit-content' }}
        />
      </div>
    ) : type === 'nodalaware' ? (
      <div>
        Origin Node
        <Autocomplete
          disableClearable
          options={nodalawareTypeArgs}
          value={nodalawareTypeArgs.find((option) => option.value === arg)}
          onChange={(event, value) => onChange(value.value)}
          renderInput={(params) => <TextField {...params} />}
          renderOption={renderOption}
          componentsProps={{ popper: { placement: 'bottom-start', style: { width: 'fit-content' } } }}
          style={{ gridColumn: 2, width: 'fit-content' }}
        />
      </div>
    ) : null
  );
}
