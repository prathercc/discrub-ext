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

function BeforeAndAfterFields({
  disabled,
  afterProps = {
    toolTipTitle: "Messages After",
    toolTipDescription: "Search messages from after the provided date",
    label: "Messages After",
  },
  beforeProps = {
    toolTipTitle: "Messages Before",
    toolTipDescription: "Search messages from before the provided date",
    label: "Messages Before",
  },
}) {
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
        title={afterProps.toolTipTitle}
        description={afterProps.toolTipDescription}
        placement="top"
      >
        <DiscordDateTimePicker
          onChange={(e) => dispatch(setSearchAfterDate(e))}
          label={afterProps.label}
          disabled={disabled}
          value={searchAfterDate}
        />
      </Tooltip>
      <Tooltip
        arrow
        title={beforeProps.toolTipTitle}
        description={beforeProps.toolTipDescription}
        placement="top"
      >
        <DiscordDateTimePicker
          onChange={(e) => dispatch(setSearchBeforeDate(e))}
          label={beforeProps.label}
          disabled={disabled}
          value={searchBeforeDate}
        />
      </Tooltip>
    </Stack>
  );
}

export default BeforeAndAfterFields;
