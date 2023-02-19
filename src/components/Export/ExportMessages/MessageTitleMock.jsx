import React, { useContext } from "react";
import { Stack } from "@mui/material";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportMessagesStyles from "./ExportMessages.styles";
import PoweredBy from "./PoweredBy";

const MessageTitleMock = () => {
  const classes = ExportMessagesStyles();

  const { getExportTitle } = useContext(MessageContext);

  return (
    <Stack
      className={classes.exportTitleStack}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      {getExportTitle()}
      <PoweredBy />
    </Stack>
  );
};
export default MessageTitleMock;
