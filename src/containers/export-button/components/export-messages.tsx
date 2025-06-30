import { Box, Stack } from "@mui/material";
import { differenceInSeconds, parseISO } from "date-fns";
import Channel from "../../../classes/channel";
import Message from "../../../classes/message";
import Guild from "../../../classes/guild";
import MessageTitleMock from "./message-title-mock";
import MessageMock from "../../message-mock/message-mock";
import { MessageType } from "../../../enum/message-type";
import { isNonStandardMessage, messageTypeEquals } from "../../../utils";
import PageFooterControls from "./page-footer-controls";
import { ExportData } from "../../../features/export/export-types.ts";

type ExportMessagesProps = {
  componentRef: React.MutableRefObject<HTMLDivElement | null>;
  isExporting: boolean;
  messages: Message[];
  entity: Channel | Guild | Maybe;
  currentPage: number;
  totalPages: number;
  safeEntityName: string;
  exportData: ExportData;
};

const ExportMessages = ({
  componentRef,
  isExporting,
  messages,
  entity,
  currentPage,
  totalPages,
  safeEntityName,
  exportData,
}: ExportMessagesProps) => {
  const getExportPageTitle = (): string => {
    return `Page ${currentPage} of ${totalPages}`;
  };

  return (
    <Box sx={{ display: "none", margin: 0 }}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        ref={componentRef}
      >
        <MessageTitleMock
          entity={entity}
          getExportPageTitle={getExportPageTitle}
          exportData={exportData}
        />
        <Stack
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={1}
          sx={{ marginTop: "25px", width: "100%", marginBottom: "45px" }}
        >
          {isExporting &&
            messages.map((message, index) => {
              const previousMessage = messages[index - 1];

              let isChained = false;
              if (
                previousMessage &&
                !isNonStandardMessage(previousMessage) &&
                !isNonStandardMessage(message)
              ) {
                const elapsedSeconds = differenceInSeconds(
                  parseISO(message.timestamp),
                  parseISO(previousMessage.timestamp),
                );

                isChained =
                  Math.abs(elapsedSeconds) <= 330 &&
                  message.author.id === previousMessage.author.id &&
                  message.author.username === previousMessage.author.username &&
                  !messageTypeEquals(message.type, MessageType.REPLY) &&
                  previousMessage.channel_id === message.channel_id;
              }

              return (
                <MessageMock
                  message={message}
                  index={index}
                  isChained={isChained}
                />
              );
            })}
        </Stack>
        <PageFooterControls
          safeEntityName={safeEntityName}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </Stack>
    </Box>
  );
};
export default ExportMessages;
