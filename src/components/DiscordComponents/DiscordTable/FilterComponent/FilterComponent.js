import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import DiscordDateTimePicker from "../../DiscordDateTimePicker/DiscordDateTimePicker";
import FilterComponentStyles from "../Styles/FilterComponent.styles";
import { MenuItem } from "@mui/material";
import { debounce } from "debounce";
import { useDispatch, useSelector } from "react-redux";
import {
  filterMessages,
  selectMessage,
  updateFilters,
} from "../../../../features/message/messageSlice";
import { selectChannel } from "../../../../features/channel/channelSlice";

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

  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

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
          <TextField
            size="small"
            fullWidth
            variant="filled"
            onChange={(e) => handleFilterUpdate(null, e.target.value, "thread")}
            select
            label="Threads"
          >
            <MenuItem dense value={null} key={-1}>
              <strong>Reset Selection</strong>
            </MenuItem>
            {threads.map((thread) => {
              return (
                <MenuItem dense value={thread.id} key={thread.id}>
                  {thread.name}
                </MenuItem>
              );
            })}
          </TextField>
        )}
      </Stack>
    </Stack>
  );
};

export default FilterComponent;
