import React, { useContext } from "react";
import { Box, Stack } from "@mui/material";
import { MessageContext } from "../../context/message/MessageContext";
import ExportButtonGroupStyles from "./ExportButtonGroup.styles";
import MessageMock from "./MessageMock";
import MessageTitleMock from "./MessageTitleMock";

const ExportMessages = ({ componentRef, exporting }) => {
  const classes = ExportButtonGroupStyles();

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
        {exporting &&
          exportMessages.map((row, index) => {
            return <MessageMock row={row} index={index} threads={threads} />;
          })}
      </Stack>
    </Box>
  );
};
export default ExportMessages;
