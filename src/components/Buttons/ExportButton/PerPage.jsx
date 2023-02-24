import React, { useContext } from "react";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { ExportContext } from "../../../context/export/ExportContext";
import TextField from "@mui/material/TextField";

const PerPage = () => {
  const { state: exportState, setMessagesPerPage } = useContext(ExportContext);
  const { messagesPerPage, isExporting } = exportState;

  return (
    <Tooltip
      arrow
      placement="left"
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
          if (!isNaN(input)) setMessagesPerPage(input);
          else setMessagesPerPage(null);
        }}
      />
    </Tooltip>
  );
};

export default PerPage;
