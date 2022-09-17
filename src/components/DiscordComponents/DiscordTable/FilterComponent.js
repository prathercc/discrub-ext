import React, { useContext } from "react";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import DiscordDateTimePicker from "../DiscordDateTimePicker/DiscordDateTimePicker";
import { MessageContext } from "../../../context/message/MessageContext";
import FilterComponentStyles from "./FilterComponent.styles";
import { MenuItem } from "@mui/material";
import { ChannelContext } from "../../../context/channel/ChannelContext";

const FilterComponent = () => {
  const classes = FilterComponentStyles();
  const { updateFilters, state: messageState } = useContext(MessageContext);
  const { state: channelState } = useContext(ChannelContext);
  const { threads } = messageState;
  const { selectedChannel } = channelState;

  return (
    <Stack zIndex={1} className={classes.stack} spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <DiscordDateTimePicker
          onChange={(e) => updateFilters("startTime", e, "date")}
          label="Start Time"
        />
        <DiscordDateTimePicker
          onChange={(e) => updateFilters("endTime", e, "date")}
          label="End Time"
        />
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <TextField
          fullWidth
          variant="filled"
          label="Username"
          onChange={(e) => updateFilters("username", e.target.value, "text")}
        />
        <TextField
          fullWidth
          variant="filled"
          onChange={(e) => updateFilters("content", e.target.value, "text")}
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
          fullWidth
          variant="filled"
          onChange={(e) =>
            updateFilters("attachmentName", e.target.value, "text")
          }
          label="Attachment Name"
        />
        {selectedChannel.id && (
          <TextField
            fullWidth
            variant="filled"
            onChange={(e) => updateFilters(null, e.target.value, "thread")}
            select
            label="Threads"
          >
            <MenuItem value={null} key={-1}>
              <strong>Reset Selection</strong>
            </MenuItem>
            {threads.map((thread) => {
              return (
                <MenuItem value={thread.id} key={thread.id}>
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
