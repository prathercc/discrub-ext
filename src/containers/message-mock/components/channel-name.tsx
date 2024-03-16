import { Typography, useTheme } from "@mui/material";
import Channel from "../../../classes/channel";
import Message from "../../../classes/message";

type ChannelNameProps = { channels: Channel[]; message: Message };

const ChannelName = ({ channels, message }: ChannelNameProps) => {
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
      {channels.find((channel) => channel.id === message.channel_id)?.name}
    </Typography>
  );
};
export default ChannelName;
