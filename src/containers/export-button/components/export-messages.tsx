import { Box, Stack } from "@mui/material";
import { differenceInSeconds, parseISO } from "date-fns";
import Channel from "../../../classes/channel";
import Message from "../../../classes/message";
import Guild from "../../../classes/guild";
import MessageTitleMock from "./message-title-mock";
import MessageMock from "../../../components/message-mock";
import { MessageType } from "../../../enum/message-type";

type ExportMessagesProps = {
  componentRef: React.RefObject<HTMLDivElement | undefined>;
  isExporting: boolean;
  messages: Message[];
  entity: Channel | Guild | Maybe;
  getExportPageTitle: () => string;
};

const ExportMessages = ({
  componentRef,
  isExporting,
  messages,
  entity,
  getExportPageTitle,
}: ExportMessagesProps) => {
  return (
    <Box sx={{ display: "none", margin: 0 }}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        ref={componentRef as React.RefObject<HTMLDivElement>}
      >
        <MessageTitleMock
          entity={entity}
          getExportPageTitle={getExportPageTitle}
        />
        <Stack
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          spacing={1}
          sx={{ marginTop: "55px", width: "100%" }}
        >
          {isExporting &&
            messages.map((message, index) => {
              const previousMessage = messages[index - 1];

              let isChained = false;
              if (previousMessage) {
                const elapsedSeconds = differenceInSeconds(
                  parseISO(message.timestamp),
                  parseISO(previousMessage.timestamp)
                );

                isChained =
                  Math.abs(elapsedSeconds) <= 330 &&
                  message.author.id === previousMessage.author.id &&
                  message.type !== MessageType.REPLY &&
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
      </Stack>
    </Box>
  );
};
export default ExportMessages;
