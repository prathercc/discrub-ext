import React from "react";
import { Stack } from "@mui/material";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import DiscordDateTimePicker from "../../DiscordComponents/DiscordDateTimePicker/DiscordDateTimePicker";
import { useDispatch, useSelector } from "react-redux";
import {
  selectMessage,
  setSearchAfterDate,
  setSearchBeforeDate,
} from "../../../features/message/messageSlice";

function BeforeAndAfterFields({ disabled }) {
  const dispatch = useDispatch();
  const { searchAfterDate, searchBeforeDate } = useSelector(selectMessage);

  return (
    <Stack
      direction="row"
      justifyContent="center"
      alignItems="center"
      spacing={1}
    >
      <Tooltip
        arrow
        title="Messages After"
        description="Search messages from after the provided date"
        placement="top"
      >
        <DiscordDateTimePicker
          onChange={(e) => dispatch(setSearchAfterDate(e))}
          label="Messages After"
          disabled={disabled}
          value={searchAfterDate}
        />
      </Tooltip>
      <Tooltip
        arrow
        title="Messages Before"
        description="Search messages from before the provided date"
        placement="top"
      >
        <DiscordDateTimePicker
          onChange={(e) => dispatch(setSearchBeforeDate(e))}
          label="Messages Before"
          disabled={disabled}
          value={searchBeforeDate}
        />
      </Tooltip>
    </Stack>
  );
}

export default BeforeAndAfterFields;
