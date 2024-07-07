import { Stack } from "@mui/material";
import WebhookEmbedMock from "../../../components/webhook-embed-mock";
import Message from "../../../classes/message";
import { getRichEmbeds } from "../../../utils";

type WebhookEmbedsProps = {
  message: Message;
};

const WebhookEmbeds = ({ message }: WebhookEmbedsProps) => {
  return (
    <Stack
      sx={{ maxWidth: "600px" }}
      mt="5px"
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      spacing={1}
    >
      {getRichEmbeds(message).map((embed) => (
        <WebhookEmbedMock
          alwaysExpanded={true}
          embed={embed}
          message={message}
        />
      ))}
    </Stack>
  );
};
export default WebhookEmbeds;
