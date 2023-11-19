import React from "react";
import Tooltip from "../../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import {
  selectExport,
  setMessagesPerPage,
} from "../../../../features/export/exportSlice";

const PerPage = () => {
  const dispatch = useDispatch();
  const { messagesPerPage, isExporting } = useSelector(selectExport);

  return (
    <Tooltip
      arrow
      placement="top"
      title={"Messages Per Page"}
      description="Consider keeping this value low, export times can be completed many times faster if messages are broken up into pages."
    >
      <TextField
        label="Messages Per Page"
        variant="filled"
        size="small"
        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        disabled={isExporting}
        value={messagesPerPage}
        onChange={(e) => {
          const input = parseInt(e.target.value);
          if (!isNaN(input)) dispatch(setMessagesPerPage(input));
          else dispatch(setMessagesPerPage(null));
        }}
      />
    </Tooltip>
  );
};

export default PerPage;
