import React, { useContext } from "react";
import { Box, Stack } from "@mui/material";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportStyles from "../Styles/Export.styles";
import MessageMock from "../Mock/MessageMock";
import MessageTitleMock from "../Mock/MessageTitleMock";
import { ExportContext } from "../../../context/export/ExportContext";
import { sortByProperty } from "../../../utils";

const ExportMessages = ({ componentRef, bulk = false }) => {
  const classes = ExportStyles();

  const { state: exportState } = useContext(ExportContext);
  const { isExporting, currentPage, messagesPerPage, sortOverride } =
    exportState;
  const { state: messageState } = useContext(MessageContext);
  const { messages, filters, filteredMessages, threads } = messageState;
  let exportMessages = filters.length > 0 ? filteredMessages : messages;
  exportMessages = bulk
    ? exportMessages?.toSorted((a, b) =>
        sortByProperty(
          Object.assign(a, { date: new Date(a.timestamp) }),
          Object.assign(b, { date: new Date(b.timestamp) }),
          "date",
          sortOverride
        )
      )
    : exportMessages;
  const startIndex =
    currentPage === 1 ? 0 : (currentPage - 1) * messagesPerPage;

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
            exportMessages
              .slice(startIndex, startIndex + messagesPerPage)
              .map((row, index) => {
                return (
                  <MessageMock message={row} index={index} threads={threads} />
                );
              })}
        </Stack>
      </Stack>
    </Box>
  );
};
export default ExportMessages;
