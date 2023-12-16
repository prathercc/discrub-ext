import React from "react";
import { Box, Stack } from "@mui/material";
import ExportStyles from "../Styles/Export.styles";
import MessageMock from "../Mock/MessageMock";
import MessageTitleMock from "../Mock/MessageTitleMock";
import { sortByProperty } from "../../../utils";
import { useSelector } from "react-redux";
import { selectExport } from "../../../features/export/exportSlice";
import { selectMessage } from "../../../features/message/messageSlice";
import { selectThread } from "../../../features/thread/threadSlice";
import { differenceInSeconds } from "date-fns";

const ExportMessages = ({ componentRef, bulk = false }) => {
  const classes = ExportStyles();

  const { isExporting, currentPage, messagesPerPage, sortOverride } =
    useSelector(selectExport);
  const { threads } = useSelector(selectThread);
  const { messages, filters, filteredMessages } = useSelector(selectMessage);

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

  const slicedMessages = exportMessages.slice(
    startIndex,
    startIndex + messagesPerPage
  );

  return (
    <Box className={classes.boxContainer}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        ref={componentRef}
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
            slicedMessages.map((message, index) => {
              const previousMessage = slicedMessages[index - 1];

              let isChained = false;
              if (previousMessage) {
                const elapsedSeconds = differenceInSeconds(
                  message.getDate(),
                  previousMessage.getDate()
                );

                isChained =
                  Math.abs(elapsedSeconds) <= 330 &&
                  message.getAuthor().getUserId() ===
                    previousMessage.getAuthor().getUserId() &&
                  !message.isReply() &&
                  previousMessage.getChannelId() === message.getChannelId();
              }

              return (
                <MessageMock
                  message={message}
                  index={index}
                  threads={threads}
                  isChained={isChained}
                />
              );
            })}
        </Stack>
      </Stack>
    </Box>
  );
};
export default ExportMessages;
