import React, { useState } from 'react';
import Autocomplete, {
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteInputChangeReason,
  AutocompleteRenderGetTagProps,
  AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';
import type { AutocompleteHighlightChangeReason } from '@mui/material';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import ListItem from '@mui/material/ListItem';
import Popper, { PopperProps } from '@mui/material/Popper';
import TextField from '@mui/material/TextField';

// interface PacketCommandDescription {
//   command: string;
//   synopsis: string;
//   description: string;
//   args: {
//     [key: string]: {
//       value?: string;
//       desc: string;
//     };
//   };
// }

interface CommandHistoryDescription {
  command: string;
  utc: number;
  node: string;
}

export const useInputSuggest_mui = () => {
  // The array of selected options
  const [value] = useState<CommandHistoryDescription>();
  // The text field display value
  const [inputValue, setInputValue] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<PopperProps['anchorEl']>(null);
  const [open, setOpen] = useState(false);

  //   useEffect(() => {
  //     console.log('inputValue changed: ', inputValue);
  //   }, [inputValue]);
  //   useEffect(() => {
  //     console.log('value changed: ', value);
  //   }, [value]);

  // If an option is chosen from the list
  const onValueChange = (
    _: React.SyntheticEvent,
    value: CommandHistoryDescription | string,
    reason: AutocompleteChangeReason,
    details?: AutocompleteChangeDetails<CommandHistoryDescription | string>
  ) => {
    // console.log('onValueChange', 'event:', 'event', 'value:', value, 'reason:', reason, 'details:', details);
    // setValue(value);
  };

  // Fired when typing in text field
  const onInputValueChange = (_: React.SyntheticEvent, value: string, reason: AutocompleteInputChangeReason) => {
    // console.log('onInputValueChange', 'event:', 'event', 'value:', value, 'reason:', reason);
    setInputValue(value);
  };

  // Fired when the highlighted option changes
  const onHighlightChange = (
    event: React.SyntheticEvent,
    option: CommandHistoryDescription | null,
    reason: AutocompleteHighlightChangeReason
  ) => {
    console.log('onhighlightchange', 'event:', event, 'option:', option, 'reason:', reason);
    if (option === null) {
      return;
    }
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  // Custom rendering for each option list item
  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: CommandHistoryDescription | string,
    state: AutocompleteRenderOptionState
  ) => {
    const ret = <ListItem {...props}>{typeof option === 'string' ? option : option.command}</ListItem>;
    if (state.selected) {
      //   setAnchorEl(ret);
      //   setOpen(true);
    }
    return ret;
  };

  // Custom rendering for each tag (disable deleteIcon)
  const renderTags = (
    tagValue: Array<CommandHistoryDescription | string>,
    getTagProps: AutocompleteRenderGetTagProps
  ) => {
    return tagValue.map((option, index) => {
      // Remove deleteIcon from tagProps
      const { onDelete: _, key, ...props } = getTagProps({ index });
      return (
        <Chip key={key} {...props} onClick={() => {}} label={typeof option === 'string' ? option : option.command} />
      );
    });
  };

  return (
    <div style={{ width: '35em', paddingLeft: '1em', overflow: 'visible' }}>
      <Popper open={open} anchorEl={anchorEl} placement={'right'} transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <div>This is my message</div>
          </Fade>
        )}
      </Popper>
      <Autocomplete
        freeSolo
        disablePortal
        disableCloseOnSelect
        disableClearable
        options={commandHistory}
        value={value}
        onChange={onValueChange}
        inputValue={inputValue}
        getOptionLabel={(option: CommandHistoryDescription | string) =>
          typeof option === 'string' ? option : option.command
        }
        onClose={() => setOpen(false)}
        onInputChange={onInputValueChange}
        onHighlightChange={onHighlightChange}
        onKeyDown={(event) => {
          if (event.key === 'Tab') {
            event.preventDefault();
            return;
          }
        }}
        renderInput={(params) => <TextField {...params} variant="standard" size="small" />}
        renderOption={renderOption}
        renderTags={renderTags}
      />
    </div>
  );
};

const commandHistory: CommandHistoryDescription[] = [
  {
    utc: 60101.09,
    command: 'agent ground comm ping',
    node: 'ground',
  },
  {
    utc: 60101.1,
    command: 'agent ground comm command iobc UHFUP:UHFDOWN Ping',
    node: 'ground',
  },
];

// const packetCommands: PacketCommandDescription[] = [
//   {
//     command: 'Reset',
//     synopsis: '[SECONDS_DELAY]',
//     description: 'Reset the agent',
//     args: {
//       SECONDS_DELAY: {
//         desc: 'Seconds to wait until reset',
//       },
//     },
//   },
//   {
//     command: 'Reboot',
//     synopsis: '[SECONDS_DELAY]',
//     description: 'Reboots the obc of the node',
//     args: {
//       SECONDS_DELAY: {
//         desc: 'Seconds to wait until reboot',
//       },
//     },
//   },
//   {
//     command: 'EpsSwitchName',
//     synopsis: 'CHANNEL [0|1|2]',
//     description: 'Control switch enabled status',
//     args: {
//       CHANNEL: {
//         value: '{vbattbus|simplex|5vbus|hdrm|hdrmalt|3v3bus|adcs|adcsalt|gps|sband|xband|mcce|unibap|ext200}',
//         desc: 'Channel name',
//       },
//     },
//   },
// ];
