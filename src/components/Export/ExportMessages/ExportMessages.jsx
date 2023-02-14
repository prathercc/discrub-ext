import React, { useContext } from "react";
import { Box, Stack } from "@mui/material";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportMessagesStyles from "./ExportMessages.styles";
import MessageMock from "./MessageMock";
import MessageTitleMock from "./MessageTitleMock";
import { ExportContext } from "../../../context/export/ExportContext";

const ExportMessages = ({ componentRef }) => {
  const classes = ExportMessagesStyles();

  const { state: exportState } = useContext(ExportContext);
  const { isExporting } = exportState;
  const { state: messageState } = useContext(MessageContext);
  const { messages, filters, filteredMessages, threads } = messageState;
  const exportMessages = filters.length > 0 ? filteredMessages : messages;

  return (
    <Box className={classes.boxContainer}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        ref={componentRef}
        className={classes.stackMessageContainer}
      >
        <MessageTitleMock />
        <Stack
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={1}
          className={classes.messagesStack}
        >
          {isExporting &&
            exportMessages.map((row, index) => {
              return <MessageMock row={row} index={index} threads={threads} />;
            })}
        </Stack>
      </Stack>
    </Box>
  );
};
export default ExportMessages;
