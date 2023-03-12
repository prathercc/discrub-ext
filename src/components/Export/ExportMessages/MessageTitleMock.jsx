import React, { useContext } from "react";
import { Stack, Typography } from "@mui/material";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportMessagesStyles from "./ExportMessages.styles";
import PoweredBy from "./PoweredBy";
import { ExportContext } from "../../../context/export/ExportContext";

const MessageTitleMock = () => {
  const classes = ExportMessagesStyles();

  const { getExportTitle, state: messageState } = useContext(MessageContext);
  const { filteredMessages, messages } = messageState;
  const { state: exportState } = useContext(ExportContext);
  const { currentPage, messagesPerPage } = exportState;
  const pageTitle = `Page ${currentPage} of ${Math.ceil(
    (filteredMessages.length ? filteredMessages.length : messages.length) /
      messagesPerPage
  )}`;

  return (
    <Stack
      className={classes.exportTitleStack}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
    >
      {getExportTitle()}
      <Typography className={classes.typographyTitle} variant="h6">
        {pageTitle}
      </Typography>
      <PoweredBy />
    </Stack>
  );
};
export default MessageTitleMock;
