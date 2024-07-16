import { Typography, useTheme } from "@mui/material";
import Channel from "../../../classes/channel";
import Message from "../../../classes/message";

type ChannelNameProps = {
  channels: Channel[];
  message: Message;
  thread: Channel | undefined;
};

const ChannelName = ({ channels, message, thread }: ChannelNameProps) => {
  const theme = useTheme();

  return (
    <Typography
      variant="caption"
      mt="1px"
      sx={{
        textDecoration: "underline",
        textDecorationStyle: "dotted",
        color: theme.palette.text.primary,
      }}
    >
      {
        channels.find(
          (channel) =>
            channel.id === message.channel_id ||
            thread?.parent_id === channel.id
        )?.name
      }
    </Typography>
  );
};
export default ChannelName;
