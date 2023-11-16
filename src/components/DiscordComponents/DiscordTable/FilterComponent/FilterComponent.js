import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import DiscordDateTimePicker from "../../DiscordDateTimePicker/DiscordDateTimePicker";
import FilterComponentStyles from "../Styles/FilterComponent.styles";
import {
  Autocomplete,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";
import { debounce } from "debounce";
import { useDispatch, useSelector } from "react-redux";
import {
  filterMessages,
  selectMessage,
  updateFilters,
} from "../../../../features/message/messageSlice";
import { selectChannel } from "../../../../features/channel/channelSlice";
import DiscordTooltip from "../../DiscordTooltip/DiscordToolTip";
import CopyAdornment from "../../../Messages/CopyAdornment/CopyAdornment";
import ClearIcon from "@mui/icons-material/Clear";
import { sortByProperty } from "../../../../utils";

const FilterComponent = () => {
  const classes = FilterComponentStyles();

  const dispatch = useDispatch();
  const { threads } = useSelector(selectMessage);
  const { selectedChannel } = useSelector(selectChannel);

  const handleFilterMessages = debounce(() => dispatch(filterMessages()), 600);

  const handleFilterUpdate = (name, e, type) => {
    dispatch(
      updateFilters({ filterName: name, filterValue: e, filterType: type })
    );
    handleFilterMessages();
  };

  const sortedThreads = threads.toSorted((a, b) =>
    sortByProperty(
      { name: a.name.toLowerCase() },
      { name: b.name.toLowerCase() },
      "name"
    )
  );

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [inverse, setInverse] = useState(false);

  return (
    <Stack zIndex={1} className={classes.stack} spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <DiscordDateTimePicker
          onChange={(e) => {
            handleFilterUpdate("startTime", e, "date");
            setStartTime(e);
          }}
          label="Start Time"
          value={startTime}
        />
        <DiscordDateTimePicker
          onChange={(e) => {
            handleFilterUpdate("endTime", e, "date");
            setEndTime(e);
          }}
          label="End Time"
          value={endTime}
        />
        <DiscordTooltip
          title="Inverse Filter"
          description="Show messages NOT matching the other provided Quick Filters"
        >
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={inverse}
                  onChange={(e) => {
                    handleFilterUpdate("inverse", e.target.checked, "toggle");
                    setInverse(e.target.checked);
                  }}
                />
              }
              label="Inverse"
            />
          </FormGroup>
        </DiscordTooltip>
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <TextField
          size="small"
          fullWidth
          variant="filled"
          label="Username"
          onChange={(e) =>
            handleFilterUpdate("username", e.target.value, "text")
          }
        />
        <TextField
          size="small"
          fullWidth
          variant="filled"
          onChange={(e) =>
            handleFilterUpdate("content", e.target.value, "text")
          }
          label="Message"
        />
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <TextField
          size="small"
          fullWidth
          variant="filled"
          onChange={(e) =>
            handleFilterUpdate("attachmentName", e.target.value, "text")
          }
          label="Attachment Name"
        />
        {selectedChannel.id && (
          <Autocomplete
            clearIcon={<ClearIcon />}
            onChange={(_, val) => handleFilterUpdate(null, val, "thread")}
            options={sortedThreads.map((thread) => {
              return thread.getId();
            })}
            getOptionLabel={(id) =>
              threads.find((thread) => thread.id === id)?.getName()
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                fullWidth
                size="small"
                label="Threads"
                className={classes.threadSelect}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <CopyAdornment
                      copyValue={threads
                        .map((thread) => thread.getName())
                        .join("\r\n")}
                      copyName="Thread List"
                    />
                  ),
                }}
              />
            )}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default FilterComponent;
