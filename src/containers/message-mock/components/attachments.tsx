import { Stack } from "@mui/material";
import AttachmentMock from "../../../components/attachment-mock";
import EmbedMock from "../../../components/embed-mock";
import Message from "../../../classes/message";

type AttachmentsProps = { message: Message };

const Attachments = ({ message }: AttachmentsProps) => {
  return (
    <Stack
      mt="5px"
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      spacing={1}
    >
      {message.attachments.map((attachment) => (
        <AttachmentMock attachment={attachment} />
      ))}
      {message.embeds.map((embed, index) => (
        <EmbedMock embed={embed} index={index} />
      ))}
    </Stack>
  );
};
export default Attachments;
