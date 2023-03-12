import React, { useContext } from "react";
import { Stack } from "@mui/material";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { MessageContext } from "../../context/message/MessageContext";
import DiscordDateTimePicker from "../DiscordComponents/DiscordDateTimePicker/DiscordDateTimePicker";

function BeforeAndAfterFields({ disabled }) {
  const {
    state: messageState,
    setSearchBeforeDate,
    setSearchAfterDate,
  } = useContext(MessageContext);

  const { searchBeforeDate, searchAfterDate } = messageState;

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={1}
    >
      <Tooltip
        arrow
        title="Messages After (Optional)"
        description="Search messages from after the provided date"
        placement="top"
      >
        <DiscordDateTimePicker
          onChange={(e) => setSearchAfterDate(e)}
          label="Messages After"
          disabled={disabled}
          value={searchAfterDate}
        />
      </Tooltip>
      <Tooltip
        arrow
        title="Messages Before (Optional)"
        description="Search messages from before the provided date"
        placement="top"
      >
        <DiscordDateTimePicker
          onChange={(e) => setSearchBeforeDate(e)}
          label="Messages Before"
          disabled={disabled}
          value={searchBeforeDate}
        />
      </Tooltip>
    </Stack>
  );
}

export default BeforeAndAfterFields;
